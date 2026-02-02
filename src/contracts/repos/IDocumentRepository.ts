import type {
  ArchiveDocumentCommand,
  CreateDocumentCommand,
  DocumentState,
  GetDocumentCommand,
  SearchDocumentCommand,
  UpdateDocumentCommand,
} from "../states/document.js";

// A repository is a class whose ONLY job is to talk to the database (or storage).
// A repository does only CRUD:
// Why we use Repositories
// Separate business logic from DB logic
// can change the database without rewriting services
export interface IDocumentRepository {
  create(command: CreateDocumentCommand): Promise<DocumentState>;
  getById(command: GetDocumentCommand): Promise<DocumentState | null>;
  search(command: SearchDocumentCommand): Promise<DocumentState[]>;
  update(command: UpdateDocumentCommand): Promise<void>;
  archive(command: ArchiveDocumentCommand): Promise<void>;
}
