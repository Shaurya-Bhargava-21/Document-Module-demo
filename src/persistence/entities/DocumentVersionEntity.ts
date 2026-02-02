import { CreateDateColumn, Entity,Column ,PrimaryGeneratedColumn, UpdateDateColumn, OneToMany, ManyToOne } from "typeorm";
import type { DocStatusType, DocType } from "../../contracts/states/document.js";
import { DocumentEntity } from "./DocumentEntity.js";

@Entity("documentversions")
export class DocumentVersionEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type:'numeric'})
    version: number;

    @Column('text')
    content: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(()=>DocumentEntity,(doc)=>doc.versions)
    document:DocumentEntity
}