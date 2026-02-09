import type { IDocumentRepository } from "../contracts/repos/IDocumentRepository.js";
import {
  DocStatusType,
  type ArchiveDocumentCommand,
  type CreateDocumentCommand,
  type DocumentState,
  type GetDocumentCommand,
  type SearchDocumentCommand,
  type SoftDeleteDocumentCommand,
  type UpdateDocumentCommand,
} from "../contracts/states/document.js";

export class InMemoryDocRepo implements IDocumentRepository {
  private documents: DocumentState[] = [];

  private generateId(): string {
    return crypto.randomUUID();
  }

  async create(command: CreateDocumentCommand): Promise<DocumentState> {
    const now = new Date();

    const doc: DocumentState = {
      id: this.generateId(),
      title: command.title,
      type: command.type,
      status: DocStatusType.PUBLISHED,
      active: true,
      createdAt: now,
      updatedAt: now,
    };

    this.documents.push(doc);
    return doc;
  }

  async getById(command: GetDocumentCommand): Promise<DocumentState | null> {
    const doc = this.documents.find(
      (d) => d.id === command.id && d.status !== DocStatusType.DELETED,
    );

    return doc ?? null;
  }

  async search(command: SearchDocumentCommand): Promise<DocumentState[]> {
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

  async update(command: UpdateDocumentCommand): Promise<void> {
    const doc = this.documents.find((d) => d.id === command.documentId);
    if (!doc) return;

    if (command.title !== undefined) doc.title = command.title;
    if (command.status !== undefined) doc.status = command.status;
    if (command.active !== undefined) doc.active = command.active;

    doc.updatedAt = new Date();
  }

  async archive(command: ArchiveDocumentCommand): Promise<void> {
    const doc = this.documents.find((d) => d.id === command.documentId);
    if (!doc) return;

    doc.active = false;
    doc.updatedAt = new Date();
  }

  async softDelete(command: SoftDeleteDocumentCommand): Promise<void> {
    const doc = this.documents.find((d) => d.id === command.documentId);
    if (!doc) return;

    doc.status = DocStatusType.DELETED;
    doc.active = false;
    doc.updatedAt = new Date();
  }
}
