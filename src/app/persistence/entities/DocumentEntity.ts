import {
  CreateDateColumn,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";

import { DocumentVersionEntity } from "./DocumentVersionEntity.js";
import { DocumentStatusType, DocumentType } from "../../../contracts/states/document.js";

@Entity("documents")
export class DocumentEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar")
  title: string;

  @Column({ type: "enum", enum: DocumentType })
  type: DocumentType;

  @Column({
    type: "enum",
    enum: DocumentStatusType,
    default: DocumentStatusType.PUBLISHED,
  })
  status: DocumentStatusType;

  @Column("text")
  url: string;

  @Column({ type: "boolean", default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DocumentVersionEntity, (ver) => ver.document)
  versions: DocumentVersionEntity[];
}
