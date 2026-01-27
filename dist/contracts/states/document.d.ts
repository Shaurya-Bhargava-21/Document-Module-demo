export declare enum DocType {
    PDF = "PDF",
    JPG = "JPG",
    PNG = "PNG",
    TXT = "TXT"
}
export declare enum DocStatusType {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED"
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
export interface GetDocumentCommand {
    id: number;
}
export interface SearchDocumentCommand {
    query?: string;
    type?: DocType;
    status?: DocStatusType;
    active?: boolean;
    limit: number;
    offset: number;
}
//# sourceMappingURL=document.d.ts.map