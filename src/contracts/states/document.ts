export enum DocType {
  PDF = "PDF",
  JPG = "JPG",
  PNG = "PNG",
  TXT = "TXT",
}
export enum DocStatusType {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
}

export interface DocumentState {
  id: number;
  title: string;
  type: DocType;
  status: DocStatusType;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  versions?:DocumentVersionState[];
}

export interface DocumentVersionState{
  id:number;
  documentId:number;
  version:number;
  content:string;
  createdAt:Date;
}

export interface CreateDocumentCommand {
  title: string;
  type: DocType;
}
export interface GetDocumentCommand{ // to fetch one specific document by id
  id:number;
}

export interface SearchDocumentCommand { // to find many documents
  query?: string; // search by title (partial match)
  type?: DocType; // filter by document type
  status?: DocStatusType; // filter by document status
  active?: boolean; // filter active / inactive documents
  limit: number; // max number of documents to return
  offset: number; // starting index
}

export interface SearchDocumentsResult {
  documents: DocumentState[];
  total: number;
  limit: number;
  offset: number;
}

export interface AddVersionCommand {
  documentId: number;
  version: number;
  content: string;
}

export interface ListVersionCommand {
  documentId: number;
}

export interface ArchiveDocumentCommand {
  documentId: number;
}

export interface ServiceError {
  code: string;
  message: string;
  details?: unknown;
}

export interface UpdateDocumentCommand {
  documentId: number; // which document to update
  title?: string; // optional, update only if provided
  status?: DocStatusType;
  active?: boolean;
}





// finish all the commands required for documentservice