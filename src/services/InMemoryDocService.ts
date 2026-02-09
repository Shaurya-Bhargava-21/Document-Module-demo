import type { IDocumentService } from "../contracts/services/IDocumentService.js";
import {
  DocStatusType,
  type AddVersionCommand,
  type ArchiveDocumentCommand,
  type CreateDocumentCommand,
  type GetDocumentCommand,
  type ListVersionCommand,
  type SearchDocumentCommand,
  type SoftDeleteDocumentCommand,
} from "../contracts/states/document.js";
import { DocumentErrors } from "../errors/DocumentError.js";
import { InMemoryDocRepo } from "../repos/InMemoryDocRepo.js";

export class InMemoryDocService implements IDocumentService {
  private repo: InMemoryDocRepo;

  constructor() {
    this.repo = new InMemoryDocRepo();
  }
  async createDocument(command: CreateDocumentCommand) {
    return this.repo.create(command);
  }
  async getDocument(command: GetDocumentCommand) {
    const doc = await this.repo.getById(command);
    if (!doc) throw DocumentErrors.NOT_FOUND();
    return doc;
  }
  async searchDocument(command: SearchDocumentCommand) {
    return this.repo.search(command);
  }

  async addVersion(command: AddVersionCommand) {
    const doc = await this.repo.getById({
      id: command.documentId,
    });

    if (!doc) throw DocumentErrors.NOT_FOUND();
    if (!doc.active) throw DocumentErrors.ARCHIVED();
    if (doc.status === DocStatusType.DELETED) throw DocumentErrors.DELETED();

    const versions = await this.repo.listVersions({
      documentId: command.documentId,
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

  async listVersion(command: ListVersionCommand) {
    return this.repo.listVersions(command);
  }

  async archiveDocument(command: ArchiveDocumentCommand) {
    const doc = await this.repo.getById({
      id: command.documentId,
    });
    if (!doc) throw DocumentErrors.NOT_FOUND();
    await this.repo.archive(command);
  }

  async softDeleteDocument(command: SoftDeleteDocumentCommand) {
    const doc = await this.repo.getById({
      id: command.documentId,
    });
    if (!doc) throw DocumentErrors.NOT_FOUND();
    await this.repo.softDelete(command);
  }
}
