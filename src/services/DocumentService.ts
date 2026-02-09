import type { IDocumentRepository } from "../contracts/repos/IDocumentRepository.js";
import type { IDocumentVersionRepository } from "../contracts/repos/IDocumentVersionRepository.js";
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
import { AddVersionCommandSchema, ArchiveDocumentCommandSchema, CreateDocumentCommandSchema, GetDocumentCommandSchema, ListVersionCommandSchema, SearchDocumentCommandSchema, SoftDeleteDocumentCommandSchema } from "../validators/DocumentValidators.js";

export class DocumentService implements IDocumentService {
  constructor(
    private readonly documentRepo: IDocumentRepository,
    private readonly versionRepo: IDocumentVersionRepository,
  ) {}

  async createDocument(command: CreateDocumentCommand): Promise<DocumentState> {
    const validatedCommand = CreateDocumentCommandSchema.parse(command);
    return this.documentRepo.create(validatedCommand);
  }

  async getDocument(command: GetDocumentCommand): Promise<DocumentState> {
    const validatedCommand = GetDocumentCommandSchema.parse(command);
    const doc = await this.documentRepo.getById(validatedCommand);
    if (!doc) throw DocumentErrors.NOT_FOUND();
    return doc;
  }

  async searchDocument(
    command: SearchDocumentCommand,
  ): Promise<DocumentState[]> {
    const validatedCommand = SearchDocumentCommandSchema.parse(command);

    return this.documentRepo.search(validatedCommand as SearchDocumentCommand);
  }

  async addVersion(command: AddVersionCommand): Promise<DocumentVersionState> {
    const validatedCommand = AddVersionCommandSchema.parse(command);

    const doc = await this.documentRepo.getById({
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
    const versions = await this.versionRepo.listVersions({
      documentId: validatedCommand.documentId,
    });
    const nextVersion =
      versions.length === 0
        ? 1
        : Math.max(...versions.map((v) => v.version)) + 1;

    return this.versionRepo.addVersion({
      documentId: command.documentId,
      content: command.content,
      version: nextVersion,
    });
  }

  async listVersion(
    command: ListVersionCommand,
  ): Promise<DocumentVersionState[]> {
    const validatedCommand = ListVersionCommandSchema.parse(command);
    return this.versionRepo.listVersions(validatedCommand);
  }

  async archiveDocument(command: ArchiveDocumentCommand): Promise<void> {
    const validatedCommand = ArchiveDocumentCommandSchema.parse(command);

    const doc = await this.documentRepo.getById({
      id: validatedCommand.documentId,
    });

    if (!doc) {
      throw DocumentErrors.NOT_FOUND({
        documentId: validatedCommand.documentId,
      });
    }

    await this.documentRepo.archive(validatedCommand);
  }

  async softDeleteDocument(command: SoftDeleteDocumentCommand): Promise<void> {
    const validatedCommand = SoftDeleteDocumentCommandSchema.parse(command);

    const doc = await this.documentRepo.getById({
      id: validatedCommand.documentId,
    });
    if (!doc) {
      throw DocumentErrors.NOT_FOUND();
    }
    await this.documentRepo.softDelete(command);
  }
}