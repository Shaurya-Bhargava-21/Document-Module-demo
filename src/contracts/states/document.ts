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

export interface Document {
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

// finish all the commands required for documentservice