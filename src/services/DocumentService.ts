import type { CreateDocumentInput } from "../contracts/CreateDocumentInput.js";
import type { DocumentState } from "../contracts/DocumentState.js";

export class DocumentService{
    private documents :DocumentState[] = [];
    private idCounter = 1;

    async createDocument(input:CreateDocumentInput): Promise<DocumentState>{
        const now = new Date();
        
        const doc :DocumentState ={
            id:this.idCounter++,// autoincrementing
            title:input.title,
            type:input.type,
            status:"active",
            createdAt: now,
            updatedAt:now,
        }

        this.documents.push(doc);
        return doc;
    }

    async getDocument(id:number):Promise<DocumentState| null>{
        return this.documents.find((doc)=> doc.id === id) || null;
    }
}