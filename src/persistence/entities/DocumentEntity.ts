import { CreateDateColumn, Entity,Column ,PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { DocStatusType, DocType } from "../../contracts/states/document.js";
import { DocumentVersionEntity } from "./DocumentVersionEntity.js";

@Entity("documents")
export class DocumentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar")
  title: string;

  @Column({ type: "enum", enum: DocType })
  type: DocType;

  @Column({ type: "enum", enum: DocStatusType})
  status: DocStatusType;

  @Column({type:'boolean'})
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DocumentVersionEntity, (ver) => ver.document)
  versions: DocumentVersionEntity[];
}