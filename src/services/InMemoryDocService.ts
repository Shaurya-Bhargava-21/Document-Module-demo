import type { IDocumentRepository } from "../contracts/repos/IDocumentRepository.js";
import type { IDocumentVersionRepository } from "../contracts/repos/IDocumentVersionRepository.js";
import type { IDocumentService } from "../contracts/services/IDocumentService.js";
import {
  DocStatusType,
  type AddVersionCommand,
  type ArchiveDocumentCommand,
  type CreateDocumentCommand,
  type DocumentState,
  type DocumentVersionState,
  type GetDocumentCommand,
  type ListVersionCommand,
  type SearchDocumentCommand,
  type SoftDeleteDocumentCommand,
} from "../contracts/states/document.js";
import { DocumentErrors } from "../errors/DocumentError.js";

export class InMemoryDocService implements IDocumentService {
  constructor(
    private readonly documentRepo: IDocumentRepository,
    private readonly versionRepo: IDocumentVersionRepository,
  ) {}
  async createDocument(command: CreateDocumentCommand) {
    return this.documentRepo.create(command);
  }
  async getDocument(command: GetDocumentCommand) {
    const doc = await this.documentRepo.getById(command);
    if (!doc) throw DocumentErrors.NOT_FOUND();
    return doc;
  }
  async searchDocument(command: SearchDocumentCommand) {
    return this.documentRepo.search(command);
  }

  async addVersion(command: AddVersionCommand) {
    const doc = await this.documentRepo.getById({
      id: command.documentId,
    });

    if (!doc) throw DocumentErrors.NOT_FOUND();
    if (!doc.active) throw DocumentErrors.ARCHIVED();
    if (doc.status === DocStatusType.DELETED) throw DocumentErrors.DELETED();

    const versions = await this.versionRepo.listVersions({
      documentId: command.documentId,
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

  async listVersion(command: ListVersionCommand) {
    return this.versionRepo.listVersions(command);
  }

  async archiveDocument(command: ArchiveDocumentCommand) {
    const doc = await this.documentRepo.getById({
      id: command.documentId,
    });
    if (!doc) throw DocumentErrors.NOT_FOUND();
    await this.documentRepo.archive(command);
  }

  async softDeleteDocument(command: SoftDeleteDocumentCommand) {
    const doc = await this.documentRepo.getById({
      id: command.documentId,
    });
    if (!doc) throw DocumentErrors.NOT_FOUND();
    await this.documentRepo.softDelete(command);
  }
}
