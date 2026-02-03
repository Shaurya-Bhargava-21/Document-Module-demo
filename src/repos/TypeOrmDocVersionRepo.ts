import type { Repository } from "typeorm";
import type { IDocumentVersionRepository } from "../contracts/repos/IDocumentVersionRepository.js";
import { DocumentVersionEntity } from "../persistence/entities/DocumentVersionEntity.js";
import { AppDataSource } from "../persistence/data-source.js";
import type {
  AddVersionRepoCommand,
  DocumentVersionState,
  ListVersionCommand,
} from "../contracts/states/document.js";

export class TypeOrmDocVersionRepo implements IDocumentVersionRepository {
  private repo: Repository<DocumentVersionEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(DocumentVersionEntity);
  }

  private toState(entity: DocumentVersionEntity): DocumentVersionState {
    return {
      id: entity.id,
      documentId: entity.document.id, 
      version: entity.version,
      content: entity.content,
      createdAt: entity.createdAt,
    };
  }

  async addVersion(command: AddVersionRepoCommand): Promise<DocumentVersionState> {
    const entity = this.repo.create({
      version: command.version,
      content: command.content,
      document: { id: command.documentId } as any, //It is not a number (ID); it’s an object of type DocumentEntity,can’t pass documentId directly. You need to pass an object representing the document: , "as any" is a TypeScript workaround to avoid type errors.
    });

    const saved = await this.repo.save(entity);

    const FullVersionWithDocument: DocumentVersionEntity | null =
      await this.repo.findOne({
        where: { id: saved.id },
        relations: ["document"], // Without relations: ["document"], FullVersionWithDocument.document would be undefined—just the foreign key ID would exist internally in the database.
      });
    if (!FullVersionWithDocument)
      throw new Error("Version not found after save");

    return this.toState(FullVersionWithDocument);
  }

  async listVersions(
    command: ListVersionCommand,
  ): Promise<DocumentVersionState[]> {
    const entities = await this.repo
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
