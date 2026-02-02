import { DocStatusType, DocType } from "../../contracts/states/document.js";
import { DocumentVersionEntity } from "./DocumentVersionEntity.js";
export declare class DocumentEntity {
    id: number;
    title: string;
    type: DocType;
    status: DocStatusType;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    versions: DocumentVersionEntity[];
}
//# sourceMappingURL=DocumentEntity.d.ts.map