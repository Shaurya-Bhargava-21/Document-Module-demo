import type { IDocumentService } from "../contracts/services/IDocumentService.js";
import type { CreateDocumentCommand, GetDocumentCommand, SearchDocumentCommand, DocumentState } from "../contracts/states/document.js";
export declare class DocumentService implements IDocumentService {
    private documents;
    private idCounter;
    createDocument(command: CreateDocumentCommand): Promise<DocumentState>;
    getDocument(command: GetDocumentCommand): Promise<DocumentState>;
    searchDocument(command: SearchDocumentCommand): Promise<DocumentState[]>;
    clearDocuments(): void;
}
//# sourceMappingURL=DocumentService.d.ts.map