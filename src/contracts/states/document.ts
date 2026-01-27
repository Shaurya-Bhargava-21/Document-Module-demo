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
}

export interface CreateDocumentCommand {
  title: string;
  type: DocType;
}
export interface GetDocumentCommand{ // to fetch one specific document by id
  id:number;
}

export interface SearchDocumentCommand { // to find many documents
  title?: string; // search by title (partial match)
  type?: DocType; // filter by document type
  status?: DocStatusType; // filter by document status
  active?: boolean; // filter active / inactive documents
  limit: number; // max number of documents to return
  offset: number; // starting index
}


// finish all the commands required for documentservice