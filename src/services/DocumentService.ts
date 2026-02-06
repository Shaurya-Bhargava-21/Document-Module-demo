import type { IDocumentRepository } from "../contracts/repos/IDocumentRepository.js";
import type { IDocumentVersionRepository } from "../contracts/repos/IDocumentVersionRepository.js";
import type { IDocumentService } from "../contracts/services/IDocumentService.js";

import {
  type CreateDocumentCommand,
  type GetDocumentCommand,
  type SearchDocumentCommand,
  type DocumentState,
  type AddVersionCommand,
  type DocumentVersionState,
  type ListVersionCommand,
  type ArchiveDocumentCommand,
  DocStatusType,
  type SoftDeleteDocumentCommand,
} from "../contracts/states/document.js";
import { AddVersionCommandSchema, ArchiveDocumentCommandSchema, CreateDocumentCommandSchema, GetDocumentCommandSchema, ListVersionCommandSchema, SearchDocumentCommandSchema, SoftDeleteDocumentCommandSchema } from "../validators/DocumentValidators.js";

export class DocumentService implements IDocumentService {
  constructor(
    private readonly documentRepo: IDocumentRepository,
    private readonly versionRepo: IDocumentVersionRepository,
  ) {}

  async createDocument(command: CreateDocumentCommand): Promise<DocumentState> {
    const validatedCommand = CreateDocumentCommandSchema.parse(command)
    return this.documentRepo.create(validatedCommand);
  }

  async getDocument(command: GetDocumentCommand): Promise<DocumentState> {
    const validatedCommand = GetDocumentCommandSchema.parse(command);
    const doc = await this.documentRepo.getById(validatedCommand);
    if (!doc) throw new Error("DOCUMENT_NOT_FOUND");
    return doc;
  }

  async searchDocument(
    command: SearchDocumentCommand,
  ): Promise<DocumentState[]> {
    const validatedCommand = SearchDocumentCommandSchema.parse(command);

    return this.documentRepo.search(validatedCommand as SearchDocumentCommand);
  }

  async addVersion(command: AddVersionCommand): Promise<DocumentVersionState> {
    const validatedCommand = AddVersionCommandSchema.parse(command)

    const doc = await this.documentRepo.getById({
      id: validatedCommand.documentId,
    });
    if (!doc) {
      throw new Error("Document not found");
    }

    if(!doc.active){
      throw new Error("Cannot add version to archived document");
    }
    if(doc.status === DocStatusType.DELETED){
      throw new Error("Cannot add version to a deleted document");
    }
    const versions = await this.versionRepo.listVersions({
      documentId: command.documentId,
    });
    const nextVersion =
      versions.length === 0
        ? 1
        : Math.max(...versions.map((v) => v.version)) + 1;

    return this.versionRepo.addVersion({
      documentId: command.documentId,
      content: command.content,
      version: nextVersion,
    });
  }

  async listVersion(
    command: ListVersionCommand,
  ): Promise<DocumentVersionState[]> {
    const validatedCommand = ListVersionCommandSchema.parse(command);
    return this.versionRepo.listVersions(validatedCommand);
  }

  async archiveDocument(command: ArchiveDocumentCommand): Promise<void> {
    const validatedCommand = ArchiveDocumentCommandSchema.parse(command);
    await this.documentRepo.archive(validatedCommand);
  }

  async softDeleteDocument(command: SoftDeleteDocumentCommand): Promise<void> {
    const validatedCommand = SoftDeleteDocumentCommandSchema.parse(command);

    const doc = await this.documentRepo.getById({
      id: validatedCommand.documentId,
    });
    if(!doc){
      throw new Error("Document not found");
    }
    await this.documentRepo.softDelete(command)
  }

}

// export class DocumentService implements IDocumentService {
//   private documents: DocumentState[] = [];
//   private idCounter = 1;

//   async createDocument(command: CreateDocumentCommand): Promise<DocumentState> {
//     const now = new Date();

//     const doc: DocumentState = {
//       id: this.idCounter++,
//       title: command.title,
//       type: command.type,
//       status: DocStatusType.DRAFT,
//       active: true,
//       createdAt: now,
//       updatedAt: now,
//     };

//     this.documents.push(doc);
//     return doc;
//   }

//   async getDocument(command: GetDocumentCommand): Promise<DocumentState> {
//     const doc = this.documents.find((d) => d.id === command.id);
//     if (!doc) throw new Error("Document not found");
//     return doc;
//   }

//   async searchDocument(
//     command: SearchDocumentCommand,
//   ): Promise<DocumentState[]> {
//     let result = [...this.documents];

//     if (command.query !== undefined) {
//       result = result.filter((d) =>
//         d.title.toLowerCase().includes(command.query!.toLowerCase()),
//       );
//     }

//     return result.slice(command.offset, command.offset + command.limit);
//   }

// }
