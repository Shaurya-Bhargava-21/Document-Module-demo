export enum DocumentType {
  PDF = "PDF",
  JPG = "JPG",
  PNG = "PNG",
  TXT = "TXT",
}
export enum DocumentStatusType {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  DELETED = "DELETED",
}

export interface DocumentState {
  id: string;
  title: string;
  type: DocumentType;
  status: DocumentStatusType;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  versions: DocumentVersionState[] | null;
}

export interface DocumentVersionState {
  id: string;
  documentId: string;
  version: number;
  content: string;
  createdAt: Date;
}

export interface CreateDocumentCommand {
  title: string;
  type: DocumentType;
}
export interface GetDocumentCommand {
  // to fetch one specific document by id
  id: string;
}

export interface SearchDocumentCommand {
  // to find many documents
  query: string | null; // search by title (partial match)
  type: DocumentType | null; // filter by document type
  status: DocumentStatusType | null; // filter by document status
  active: boolean | null; // filter active / inactive documents
  limit: number; // max number of documents to return
  offset: number; // starting index
}

export interface AddVersionCommand {
  documentId: string;
  content: string;
}

export interface AddVersionRepoCommand {
  documentId: string;
  version: number;
  content: string;
}

export interface ListVersionCommand {
  documentId: string;
}

export interface ArchiveDocumentCommand {
  documentId: string;
}

export interface UnArchiveDocumentCommand {
  documentId: string;
}

export interface IServiceError {
  code: string;
  statusCode: number;
  message: string;
  details?: unknown;
}

export interface UpdateDocumentCommand {
  documentId: string; // which document to update
  title: string | null; // optional, update only if provided
  status: DocumentStatusType | null;
  active: boolean | null;
}

export interface SoftDeleteDocumentCommand {
  documentId: string;
}
