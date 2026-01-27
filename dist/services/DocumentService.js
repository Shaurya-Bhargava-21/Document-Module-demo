import { DocStatusType } from "../contracts/states/document.js";
export class DocumentService {
    documents = [];
    idCounter = 1;
    async createDocument(command) {
        const now = new Date();
        const doc = {
            id: this.idCounter++,
            title: command.title,
            type: command.type,
            status: DocStatusType.DRAFT,
            active: true,
            createdAt: now,
            updatedAt: now,
        };
        this.documents.push(doc);
        return doc;
    }
    async getDocument(command) {
        const doc = this.documents.find((d) => d.id === command.id);
        if (!doc)
            throw new Error("Document not found");
        return doc;
    }
    async searchDocument(command) {
        let result = [...this.documents];
        if (command.query !== undefined) {
            result = result.filter((d) => d.title.toLowerCase().includes(command.query.toLowerCase()));
        }
        return result.slice(command.offset, command.offset + command.limit);
    }
}
//# sourceMappingURL=DocumentService.js.map