import type {
  CreateDocumentCommand,
  GetDocumentCommand,
  SearchDocumentCommand,
  DocumentState,
  AddVersionCommand,
  DocumentVersionState,
  ListVersionCommand,
  ArchiveDocumentCommand,
} from "../states/document.js";

export interface IDocumentService {
  createDocument(command: CreateDocumentCommand): Promise<DocumentState>;
  getDocument(command: GetDocumentCommand): Promise<DocumentState>;
  searchDocument(command: SearchDocumentCommand): Promise<DocumentState[]>;
  addVersion(command:AddVersionCommand):Promise<DocumentVersionState>;
  listVersion(command:ListVersionCommand):Promise<DocumentVersionState[]>;
  archiveDocument(command:ArchiveDocumentCommand):Promise<void>;
}
// ex - parseStringToDate

// Service methods



	// •	archiveDocument(id)
	// •	softDeleteDocument(id)
