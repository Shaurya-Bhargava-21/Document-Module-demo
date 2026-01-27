import type {
  CreateDocumentCommand,
  GetDocumentCommand,
  SearchDocumentCommand,
  DocumentState,
} from "../states/document.js";

export interface IDocumentService {
  createDocument(command: CreateDocumentCommand): Promise<DocumentState>;
  getDocument(command: GetDocumentCommand): Promise<DocumentState>;
  searchDocument(command: SearchDocumentCommand): Promise<DocumentState[]>;
}
// ex - parseStringToDate