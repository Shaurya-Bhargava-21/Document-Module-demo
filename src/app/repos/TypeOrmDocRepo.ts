import { Not, Repository } from "typeorm";

import {
  DocStatusType,
  type AddVersionRepoCommand,
  type ArchiveDocumentCommand,
  type CreateDocumentCommand,
  type DocumentState,
  type DocumentVersionState,
  type GetDocumentCommand,
  type ListVersionCommand,
  type SearchDocumentCommand,
  type SoftDeleteDocumentCommand,
  type UpdateDocumentCommand,
} from "../../contracts/states/document.js";
import { DocumentVersionEntity } from "../persistence/entities/DocumentVersionEntity.js";
import { AppDataSource } from "../persistence/data-source.js";
import { DocumentEntity } from "../persistence/entities/DocumentEntity.js";

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
    const entity = this.docRepo.create({
      title: command.title,
      type: command.type,
    });

    const saved = await this.docRepo.save(entity);
    return this.toDocState(saved);
  }

  async getById(command: GetDocumentCommand): Promise<DocumentState | null> {
    const doc = await this.docRepo.findOne({
      where: {
        id: command.id,
        status: Not(DocStatusType.DELETED),
      },
    });
    return doc ? this.toDocState(doc) : null;
  }

  async search(command: SearchDocumentCommand): Promise<DocumentState[]> {
    const qb = this.docRepo.createQueryBuilder("d");

    qb.where("d.status != :deletedStatus", {
      deletedStatus: DocStatusType.DELETED,
    });

    if (command.query) {
      qb.andWhere("d.title ILIKE :q", {
        q: `%${command.query}%`,
      });
    }

    if (command.type) {
      qb.andWhere("d.type = :type", {
        type: command.type,
      });
    }

    if(command.status){
      qb.andWhere("d.status = :status",{
        status:command.status
      })
    }

    if (command.active !== undefined) {
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
    if (command.title !== undefined) updateData.title = command.title;
    if (command.status !== undefined) updateData.status = command.status;
    if (command.active !== undefined) updateData.active = command.active;

    await this.docRepo.update(command.documentId, updateData);
  }

  async archive(command: ArchiveDocumentCommand): Promise<void> {
    const doc = await this.docRepo.findOne({
      where: { id: command.documentId },
    });
    if (!doc) return;

    doc.active = false;
    doc.status = DocStatusType.DRAFT;
    await this.docRepo.save(doc);
  }

  async softDelete(command: SoftDeleteDocumentCommand): Promise<void> {
    const doc = await this.docRepo.findOne({
      where: { id: command.documentId },
    });

    if (!doc) return;

    doc.status = DocStatusType.DELETED;
    doc.active = false;

    await this.docRepo.save(doc);
  }

  // Version methods
  async addVersion(
    command: AddVersionRepoCommand,
  ): Promise<DocumentVersionState> {
    const entity = this.versionRepo.create({
      version: command.version,
      content: command.content,
      document: { id: command.documentId } as any,
    });

    const saved = await this.versionRepo.save(entity);

    const fullVersionWithDocument: DocumentVersionEntity | null =
      await this.versionRepo.findOne({
        where: { id: saved.id },
        relations: ["document"],
      });
    if (!fullVersionWithDocument)
      throw new Error("Version not found after save");

    return this.toVersionState(fullVersionWithDocument);
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
