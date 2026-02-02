import { Repository } from "typeorm";
import { AppDataSource } from "../persistence/data-source.js";
import { DocumentEntity } from "../persistence/entities/DocumentEntity.js";
import {
  DocStatusType,
  type ArchiveDocumentCommand,
  type CreateDocumentCommand,
  type DocumentState,
  type GetDocumentCommand,
  type SearchDocumentCommand,
  type UpdateDocumentCommand,
} from "../contracts/states/document.js";
import type { IDocumentRepository } from "../contracts/repos/IDocumentRepository.js";

export class TypeOrmDocRepo implements IDocumentRepository {
  private repo: Repository<DocumentEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(DocumentEntity);
  }

  private toState(entity: DocumentEntity): DocumentState {
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
  async create(command: CreateDocumentCommand): Promise<DocumentState> {
    const entity = this.repo.create({
      title: command.title,
      type: command.type,
      status: DocStatusType.DRAFT,
      active: true,
    });

    const saved = await this.repo.save(entity);
    return this.toState(saved);
  }
  async getById(command: GetDocumentCommand): Promise<DocumentState | null> {
    const doc = await this.repo.findOne({ where: { id: command.id } });
    return doc ? this.toState(doc) : null;
  }
  async search(command: SearchDocumentCommand): Promise<DocumentState[]> {
    const qb = this.repo.createQueryBuilder("d");

    if (command.query) {
      qb.andWhere("d.title ILIKE :q", {
        q: `%${command.query}%`,
      });
    }

    if (command.active !== undefined) {
      qb.andWhere("d.active = :active", {
        active: command.active,
      });
    }

    qb.skip(command.offset).take(command.limit);

    const docs = await qb.getMany();
    return docs.map(this.toState);
  }

  async update(command: UpdateDocumentCommand): Promise<void> {
    // Only update fields that are provided
    const updateData: Partial<DocumentEntity> = {};
    if (command.title !== undefined) updateData.title = command.title;
    if (command.status !== undefined) updateData.status = command.status;
    if (command.active !== undefined) updateData.active = command.active;

    await this.repo.update(command.documentId, updateData);
  }

  async archive(command: ArchiveDocumentCommand): Promise<void> {
    const doc = await this.repo.findOne({ where: { id: command.documentId } });
    if (!doc) throw new Error("DOCUMENT_NOT_FOUND");

    doc.active = false; // mark as archived
    doc.status = DocStatusType.DRAFT; // optional: reset status
    await this.repo.save(doc);
  }
}
