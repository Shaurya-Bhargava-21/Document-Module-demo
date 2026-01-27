import type { IDocumentService } from "../contracts/services/IDocumentService.js";
import { DocStatusType } from "../contracts/states/document.js";
import type {
  CreateDocumentCommand,
  GetDocumentCommand,
  SearchDocumentCommand,
  DocumentState,
} from "../contracts/states/document.js";

export class DocumentService implements IDocumentService {
  private documents: DocumentState[] = [];
  private idCounter = 1;

  async createDocument(command: CreateDocumentCommand): Promise<DocumentState> {
    const now = new Date();

    const doc: DocumentState = {
      id: this.idCounter++,
      title: command.title,
      type: command.type,
      status: DocStatusType.DRAFT,
      active: true,
      createdAt: now,
      updatedAt: now,
    };

    this.documents.push(doc);
    return doc;
  }

  async getDocument(command: GetDocumentCommand): Promise<DocumentState> {
    const doc = this.documents.find((d) => d.id === command.id);
    if (!doc) throw new Error("Document not found");
    return doc;
  }

  async searchDocument(
    command: SearchDocumentCommand,
  ): Promise<DocumentState[]> {
    let result = [...this.documents];

    if (command.query !== undefined) {
      result = result.filter((d) =>
        d.title.toLowerCase().includes(command.query!.toLowerCase()),
      );
    }

    return result.slice(command.offset, command.offset + command.limit);
  }

}
