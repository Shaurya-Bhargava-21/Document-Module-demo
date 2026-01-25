import type { CreateDocumentCommand } from "../states/document";


export interface IDocumentService{
    createDocument(command:CreateDocumentCommand):Promise<Document>;
    getDocument(command:GetDocumentCommand):Promise<Document>;
    searchDocument(command:SearchDocumentCommand):Promise<Document[]>;
}
// ex - parseStringToDate