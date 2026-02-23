import { Not, Repository } from "typeorm";

import {
  DocumentStatusType,
  type AddVersionRepoCommand,
  type ArchiveDocumentCommand,
  type CreateDocumentCommand,
  type DocumentState,
  type DocumentVersionState,
  type GetDocumentCommand,
  type ListVersionCommand,
  type SearchDocumentCommand,
  type SoftDeleteDocumentCommand,
  type UnArchiveDocumentCommand,
  type UpdateDocumentCommand,
} from "../../contracts/states/document.js";
import { DocumentVersionEntity } from "../persistence/entities/DocumentVersionEntity.js";
import { AppDataSource } from "../persistence/data-source.js";
import { DocumentEntity } from "../persistence/entities/DocumentEntity.js";
import { DocumentErrors } from "../../contracts/errors/DocumentError.js";

export class TypeOrmDocRepo {
  private docRepo: Repository<DocumentEntity>;
  private versionRepo: Repository<DocumentVersionEntity>;

  constructor() {
    this.docRepo = AppDataSource.getRepository(DocumentEntity);
    this.versionRepo = AppDataSource.getRepository(DocumentVersionEntity);
  }

  private toDocState(entity: DocumentEntity): DocumentState {
    return {
      id: entity.id,
      title: entity.title,
      type: entity.type,
      status: entity.status,
      url: entity.url,
      active: entity.active,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private toVersionState(entity: DocumentVersionEntity): DocumentVersionState {
    return {
      id: entity.id,
      documentId: entity.document.id,
      version: entity.version,
      content: entity.content,
      createdAt: entity.createdAt,
    };
  }

  // Document methods
  async create(command: CreateDocumentCommand): Promise<DocumentState> {
    return AppDataSource.transaction(async (manager) => {
      const docRepo = manager.getRepository(DocumentEntity);
      const versionRepo = manager.getRepository(DocumentVersionEntity);

      const doc = docRepo.create({
        title: command.title,
        type: command.type,
        url: command.url,
      });

      const savedDoc = await docRepo.save(doc);

      const version = versionRepo.create({
        version: 1,
        content: command.title,
        document: savedDoc,
      });

      await versionRepo.save(version);

      return this.toDocState(savedDoc);
    });
  }

  async getById(command: GetDocumentCommand): Promise<DocumentState | null> {
    const doc = await this.docRepo.findOne({
      where: {
        id: command.id,
        status: Not(DocumentStatusType.DELETED),
      },
    });
    return doc ? this.toDocState(doc) : null;
  }

  async search(command: SearchDocumentCommand): Promise<DocumentState[]> {
    const qb = this.docRepo.createQueryBuilder("d");

    qb.where("d.status != :deletedStatus", {
      deletedStatus: DocumentStatusType.DELETED,
    });

    if (command.query !== null) {
      qb.andWhere("d.title ILIKE :q", {
        q: `%${command.query}%`,
      });
    }

    if (command.type !== null) {
      qb.andWhere("d.type = :type", {
        type: command.type,
      });
    }

    if (command.status !== null) {
      qb.andWhere("d.status = :status", {
        status: command.status,
      });
    }

    if (command.active !== null) {
      qb.andWhere("d.active = :active", {
        active: command.active,
      });
    }

    qb.skip(command.offset).take(command.limit);

    const docs = await qb.getMany();
    return docs.map((doc) => this.toDocState(doc));
  }

  async update(command: UpdateDocumentCommand): Promise<void> {
    const updateData: Partial<DocumentEntity> = {};
    if (command.title !== null) updateData.title = command.title;
    if (command.status !== null) updateData.status = command.status;
    if (command.active !== null) updateData.active = command.active;

    await this.docRepo.update(command.documentId, updateData);
  }

  async archive(command: ArchiveDocumentCommand): Promise<void> {
    const doc = await this.docRepo.findOne({
      where: { id: command.documentId },
    });
    if (!doc) return;

    doc.active = false;
    doc.status = DocumentStatusType.DRAFT;
    await this.docRepo.save(doc);
  }

  async unarchive(command: UnArchiveDocumentCommand): Promise<void> {
    const doc = await this.docRepo.findOne({
      where: { id: command.documentId },
    });
    if (!doc) return;

    doc.active = true;
    doc.status = DocumentStatusType.PUBLISHED;
    await this.docRepo.save(doc);
  }

  async softDelete(command: SoftDeleteDocumentCommand): Promise<void> {
    const doc = await this.docRepo.findOne({
      where: { id: command.documentId },
    });

    if (!doc) return;

    doc.status = DocumentStatusType.DELETED;
    doc.active = false;

    await this.docRepo.save(doc);
  }

  // Version methods
  async addVersion(
    command: AddVersionRepoCommand,
  ): Promise<DocumentVersionState> {
    return AppDataSource.transaction(async (manager) => {
      const versionRepo = manager.getRepository(DocumentVersionEntity);
      const docRepo = manager.getRepository(DocumentEntity);

      const doc = await docRepo.findOne({
        where: { id: command.documentId },
        lock: { mode: "pessimistic_write" },
      });

      if (!doc) {
        throw DocumentErrors.NOT_FOUND({ documentId: command.documentId });
      }

      if (doc.status === DocumentStatusType.DELETED) {
        throw DocumentErrors.DELETED();
      }

      if (!doc.active) {
        throw DocumentErrors.ARCHIVED();
      }

      const lastVersion = await versionRepo
        .createQueryBuilder("v")
        .where("v.documentId = :documentId", {
          documentId: command.documentId,
        })
        .orderBy("v.version", "DESC")
        .getOne();

      const nextVersion = lastVersion ? Number(lastVersion.version) + 1 : 1;

      const entity = versionRepo.create({
        version: nextVersion,
        content: command.content,
        document: doc,
      });

      const saved = await versionRepo.save(entity);

      saved.document = doc;

      return this.toVersionState(saved);
    });
  }

  async listVersions(
    command: ListVersionCommand,
  ): Promise<DocumentVersionState[]> {
    const entities = await this.versionRepo
      .createQueryBuilder("v")
      .leftJoinAndSelect("v.document", "d")
      .where("d.id = :documentId", { documentId: command.documentId })
      .orderBy("v.version", "ASC")
      .getMany();

    return entities.map((entity) => ({
      id: entity.id,
      documentId: entity.document.id,
      version: entity.version,
      content: entity.content,
      createdAt: entity.createdAt,
    }));
  }
}
