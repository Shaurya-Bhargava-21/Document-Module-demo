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
  private documents: DocumentState[] = [];

  private generateId(): string {
    return crypto.randomUUID();
  }

  constructor() {}
  async createDocument(command: CreateDocumentCommand): Promise<DocumentState> {
    const now = new Date();

    const doc: DocumentState = {
      id: this.generateId(),
      title: command.title,
      type: command.type,
      status: DocStatusType.PUBLISHED,
      active: true,
      createdAt: now,
      updatedAt: now,
      versions: [],
    };

    this.documents.push(doc);
    return doc;
  }
  async getDocument(command: GetDocumentCommand): Promise<DocumentState> {
    const doc = this.documents.find(
      (d) => d.id === command.id && d.status !== DocStatusType.DELETED,
    );
    if (!doc) {
      throw DocumentErrors.NOT_FOUND({ id: command.id });
    }
    return doc;
  }
  async searchDocument(
    command: SearchDocumentCommand,
  ): Promise<DocumentState[]> {
    let result = this.documents.filter(
      (d) => d.status !== DocStatusType.DELETED,
    );
    if (command.query) {
      result = result.filter((d) =>
        d.title.toLowerCase().includes(command.query!.toLowerCase()),
      );
    }
    if (command.active !== undefined) {
      result = result.filter((d) => d.active === command.active);
    }

    if (command.type) {
      result = result.filter((d) => d.type === command.type);
    }

    if (command.status) {
      result = result.filter((d) => d.status === command.status);
    }

    return result.slice(command.offset, command.offset + command.limit);
  }

  async addVersion(command: AddVersionCommand): Promise<DocumentVersionState> {
    const doc = this.documents.find((d) => d.id === command.documentId);

    if (!doc) {
      throw DocumentErrors.NOT_FOUND({ id: command.documentId });
    }

    if (!doc.active) {
      throw DocumentErrors.ARCHIVED()
    }

    if (doc.status === DocStatusType.DELETED) {
      throw DocumentErrors.DELETED()
    }

    const nextVersion =
      doc.versions && doc.versions.length > 0
        ? Math.max(...doc.versions.map((v) => v.version)) + 1
        : 1;

    const version: DocumentVersionState = {
      id: this.generateId(),
      documentId: doc.id,
      version: nextVersion,
      content: command.content,
      createdAt: new Date(),
    };

    doc.versions!.push(version);
    doc.updatedAt = new Date();

    return version;
  }
  async listVersion(
    command: ListVersionCommand,
  ): Promise<DocumentVersionState[]> {
    const doc = this.documents.find((d) => d.id === command.documentId);

    if (!doc) {
      throw DocumentErrors.NOT_FOUND()
    }

    return doc.versions ?? [];
  }
  async archiveDocument(command: ArchiveDocumentCommand): Promise<void> {
    const doc = this.documents.find((d) => d.id === command.documentId);

    if (!doc) {
      throw DocumentErrors.NOT_FOUND();
    }

    doc.active = false;
    doc.updatedAt = new Date();
  }
  async softDeleteDocument(command: SoftDeleteDocumentCommand): Promise<void> {
    const doc = this.documents.find((d) => d.id === command.documentId);
    if (!doc) {
      throw DocumentErrors.NOT_FOUND();
    }

    doc.status = DocStatusType.DELETED;
    doc.active = false;
    doc.updatedAt = new Date();
  }
}
