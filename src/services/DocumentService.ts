import type { IDocumentService } from "../contracts/services/IDocumentService.js";

import {
  type CreateDocumentCommand,
  type GetDocumentCommand,
  type SearchDocumentCommand,
  type DocumentState,
  type AddVersionCommand,
  type DocumentVersionState,
  type ListVersionCommand,
  type ArchiveDocumentCommand,
  DocStatusType,
  type SoftDeleteDocumentCommand,
} from "../contracts/states/document.js";
import { DocumentErrors } from "../errors/DocumentError.js";
import { TypeOrmDocRepo } from "../repos/TypeOrmDocRepo.js";
import {
  AddVersionCommandSchema,
  ArchiveDocumentCommandSchema,
  CreateDocumentCommandSchema,
  GetDocumentCommandSchema,
  ListVersionCommandSchema,
  SearchDocumentCommandSchema,
  SoftDeleteDocumentCommandSchema,
} from "../validators/DocumentValidators.js";

export class DocumentService implements IDocumentService {
  private repo: TypeOrmDocRepo;

  constructor() {
    this.repo = new TypeOrmDocRepo();
  }

  async createDocument(command: CreateDocumentCommand): Promise<DocumentState> {
    const validatedCommand = CreateDocumentCommandSchema.parse(command);
    return this.repo.create(validatedCommand);
  }

  async getDocument(command: GetDocumentCommand): Promise<DocumentState> {
    const validatedCommand = GetDocumentCommandSchema.parse(command);
    const doc = await this.repo.getById(validatedCommand);
    if (!doc) throw DocumentErrors.NOT_FOUND();
    return doc;
  }

  async searchDocument(
    command: SearchDocumentCommand,
  ): Promise<DocumentState[]> {
    const validatedCommand = SearchDocumentCommandSchema.parse(command);

    return this.repo.search(validatedCommand as SearchDocumentCommand);
  }

  async addVersion(command: AddVersionCommand): Promise<DocumentVersionState> {
    const validatedCommand = AddVersionCommandSchema.parse(command);

    const doc = await this.repo.getById({
      id: validatedCommand.documentId,
    });
    if (!doc) {
      throw DocumentErrors.NOT_FOUND();
    }

    if (!doc.active) {
      throw DocumentErrors.ARCHIVED();
    }
    if (doc.status === DocStatusType.DELETED) {
      throw DocumentErrors.DELETED();
    }
    const versions = await this.repo.listVersions({
      documentId: validatedCommand.documentId,
    });
    const nextVersion =
      versions.length === 0
        ? 1
        : Math.max(...versions.map((v) => v.version)) + 1;

    return this.repo.addVersion({
      documentId: command.documentId,
      content: command.content,
      version: nextVersion,
    });
  }

  async listVersion(
    command: ListVersionCommand,
  ): Promise<DocumentVersionState[]> {
    const validatedCommand = ListVersionCommandSchema.parse(command);
    return this.repo.listVersions(validatedCommand);
  }

  async archiveDocument(command: ArchiveDocumentCommand): Promise<void> {
    const validatedCommand = ArchiveDocumentCommandSchema.parse(command);

    const doc = await this.repo.getById({
      id: validatedCommand.documentId,
    });

    if (!doc) {
      throw DocumentErrors.NOT_FOUND({
        documentId: validatedCommand.documentId,
      });
    }

    await this.repo.archive(validatedCommand);
  }

  async softDeleteDocument(command: SoftDeleteDocumentCommand): Promise<void> {
    const validatedCommand = SoftDeleteDocumentCommandSchema.parse(command);

    const doc = await this.repo.getById({
      id: validatedCommand.documentId,
    });
    if (!doc) {
      throw DocumentErrors.NOT_FOUND();
    }
    await this.repo.softDelete(command);
  }
}
