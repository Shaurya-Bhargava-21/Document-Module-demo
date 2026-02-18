import {
  CreateDateColumn,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";

import { DocumentVersionEntity } from "./DocumentVersionEntity.js";
import { DocStatusType, DocType } from "../../../contracts/states/document.js";

@Entity("documents")
export class DocumentEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar")
  title: string;

  @Column({ type: "enum", enum: DocType })
  type: DocType;

  @Column({
    type: "enum",
    enum: DocStatusType,
    default: DocStatusType.PUBLISHED,
  })
  status: DocStatusType;

  @Column({ type: "boolean", default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DocumentVersionEntity, (ver) => ver.document)
  versions: DocumentVersionEntity[];
}
