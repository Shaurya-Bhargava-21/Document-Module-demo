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

export class InMemoryDocRepo {
  private documents: DocumentState[] = [];
  private versions: DocumentVersionState[] = [];

  private generateId(): string {
    return crypto.randomUUID();
  }

  private toDocState(doc: DocumentState): DocumentState {
    return {
      id: doc.id,
      title: doc.title,
      type: doc.type,
      status: doc.status,
      url:doc.url,
      active: doc.active,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(command: CreateDocumentCommand): Promise<DocumentState> {
    const now = new Date();

    const doc: DocumentState = {
      id: this.generateId(),
      title: command.title,
      type: command.type,
      status: DocumentStatusType.PUBLISHED,
      url:command.url,
      active: true,
      createdAt: now,
      updatedAt: now,
    };

    this.documents.push(doc);
    return doc;
  }

  async getById(command: GetDocumentCommand): Promise<DocumentState | null> {
    const doc = this.documents.find(
      (d) => d.id === command.id && d.status !== DocumentStatusType.DELETED,
    );
    if (!doc) return null;

    return this.toDocState(doc);
  }

  async search(command: SearchDocumentCommand): Promise<DocumentState[]> {
    let result = this.documents.filter(
      (d) => d.status !== DocumentStatusType.DELETED,
    );

    if (command.query !== null) {
      const q = command.query.toLowerCase();
      result = result.filter((d) => d.title.toLowerCase().includes(q));
    }

    if (command.active !== null) {
      result = result.filter((d) => d.active === command.active);
    }

    if (command.type !== null) {
      result = result.filter((d) => d.type === command.type);
    }

    if (command.status !== null) {
      result = result.filter((d) => d.status === command.status);
    }

    return result.slice(command.offset, command.offset + command.limit);
  }

  async update(command: UpdateDocumentCommand): Promise<void> {
    const doc = this.documents.find((d) => d.id === command.documentId);
    if (!doc) return;

    if (command.title !== null) doc.title = command.title;
    if (command.status !== null) doc.status = command.status;
    if (command.active !== null) doc.active = command.active;

    doc.updatedAt = new Date();
  }

  async archive(command: ArchiveDocumentCommand): Promise<void> {
    const doc = this.documents.find((d) => d.id === command.documentId);
    if (!doc) return;

    doc.active = false;
    doc.status = DocumentStatusType.DRAFT;
    doc.updatedAt = new Date();
  }

  async unarchive(command: UnArchiveDocumentCommand): Promise<void> {
    const doc = this.documents.find((d) => d.id === command.documentId);
    if (!doc) return;

    doc.active = true;
    doc.status = DocumentStatusType.PUBLISHED;
    doc.updatedAt = new Date();
  }

  async softDelete(command: SoftDeleteDocumentCommand): Promise<void> {
    const doc = this.documents.find((d) => d.id === command.documentId);
    if (!doc) return;

    doc.status = DocumentStatusType.DELETED;
    doc.active = false;
    doc.updatedAt = new Date();
  }

  async addVersion(
    command: AddVersionRepoCommand,
  ): Promise<DocumentVersionState> {
    const versionsForDoc = this.versions.filter(
      (v) => v.documentId === command.documentId,
    );

    const nextVersion =
      versionsForDoc.length === 0
        ? 1
        : Math.max(...versionsForDoc.map((v) => v.version)) + 1;

    const version: DocumentVersionState = {
      id: this.generateId(),
      documentId: command.documentId,
      version: nextVersion,
      content: command.content,
      createdAt: new Date(),
    };

    this.versions.push(version);
    return version;
  }

  async listVersions(
    command: ListVersionCommand,
  ): Promise<DocumentVersionState[]> {
    return this.versions
      .filter((v) => v.documentId === command.documentId)
      .sort((a, b) => a.version - b.version);
  }
}
