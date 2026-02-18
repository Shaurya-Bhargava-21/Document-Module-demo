import {
  CreateDateColumn,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  type Relation,
} from "typeorm";
import { DocumentEntity } from "./DocumentEntity.js";

@Entity("documentversions")
export class DocumentVersionEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "numeric" })
  version: number;

  @Column("text")
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => DocumentEntity, (doc) => doc.versions)
  // @ManyToOne("DocumentEntity",)
  document: Relation<DocumentEntity>;
}
