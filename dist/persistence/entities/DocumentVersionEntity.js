var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CreateDateColumn, Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany, ManyToOne } from "typeorm";
import { DocumentEntity } from "./DocumentEntity.js";
let DocumentVersionEntity = class DocumentVersionEntity {
    id;
    version;
    content;
    createdAt;
    document;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], DocumentVersionEntity.prototype, "id", void 0);
__decorate([
    Column({ type: 'numeric' }),
    __metadata("design:type", Number)
], DocumentVersionEntity.prototype, "version", void 0);
__decorate([
    Column('text'),
    __metadata("design:type", String)
], DocumentVersionEntity.prototype, "content", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], DocumentVersionEntity.prototype, "createdAt", void 0);
__decorate([
    ManyToOne(() => DocumentEntity, (doc) => doc.versions),
    __metadata("design:type", DocumentEntity)
], DocumentVersionEntity.prototype, "document", void 0);
DocumentVersionEntity = __decorate([
    Entity("documentversions")
], DocumentVersionEntity);
export { DocumentVersionEntity };
//# sourceMappingURL=DocumentVersionEntity.js.map