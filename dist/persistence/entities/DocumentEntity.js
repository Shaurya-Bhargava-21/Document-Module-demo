var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CreateDateColumn, Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { DocStatusType, DocType } from "../../contracts/states/document.js";
import { DocumentVersionEntity } from "./DocumentVersionEntity.js";
let DocumentEntity = class DocumentEntity {
    id;
    title;
    type;
    status;
    active;
    createdAt;
    updatedAt;
    versions;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], DocumentEntity.prototype, "id", void 0);
__decorate([
    Column("varchar"),
    __metadata("design:type", String)
], DocumentEntity.prototype, "title", void 0);
__decorate([
    Column({ type: "enum", enum: DocType }),
    __metadata("design:type", String)
], DocumentEntity.prototype, "type", void 0);
__decorate([
    Column({ type: "enum", enum: DocStatusType }),
    __metadata("design:type", String)
], DocumentEntity.prototype, "status", void 0);
__decorate([
    Column({ type: 'boolean' }),
    __metadata("design:type", Boolean)
], DocumentEntity.prototype, "active", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], DocumentEntity.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], DocumentEntity.prototype, "updatedAt", void 0);
__decorate([
    OneToMany(() => DocumentVersionEntity, (ver) => ver.document),
    __metadata("design:type", Array)
], DocumentEntity.prototype, "versions", void 0);
DocumentEntity = __decorate([
    Entity("documents")
], DocumentEntity);
export { DocumentEntity };
//# sourceMappingURL=DocumentEntity.js.map