import { DocumentErrors } from "../../contracts/errors/DocumentError.js";
import type { IDocumentService } from "../../contracts/services/IDocumentService.js";

import {
  type CreateDocumentCommand,
  type GetDocumentCommand,
  type SearchDocumentCommand,
  type DocumentState,
  type AddVersionCommand,
  type DocumentVersionState,
  type ListVersionCommand,
  type ArchiveDocumentCommand,
  DocumentStatusType,
  type SoftDeleteDocumentCommand,
  type UnArchiveDocumentCommand,
} from "../../contracts/states/document.js";
import { redisClient } from "../../entry/redis.js";
import { cacheGet } from "../decorators/cacheGet.js";
import { cachePurge } from "../decorators/cachePurge.js";
import { performanceTracker } from "../decorators/performanceTracker.js";

import { TypeOrmDocRepo } from "../repos/TypeOrmDocRepo.js";
import {
  AddVersionCommandSchema,
  ArchiveDocumentCommandSchema,
  CreateDocumentCommandSchema,
  GetDocumentCommandSchema,
  ListVersionCommandSchema,
  SearchDocumentCommandSchema,
  SoftDeleteDocumentCommandSchema,
  UnArchiveDocumentCommandSchema,
} from "../../contracts/validators/DocumentValidators.js";
import { DocumentProducer } from "../producers/DocumentProducer.js";

export class DocumentService implements IDocumentService {
  private repo: TypeOrmDocRepo;
  private documentProducer: DocumentProducer;

  private isUrlMatchingType(url: string, type: string): boolean {
    const lowerUrl = url.toLowerCase().split("?")[0]!; // remove query params
    const t = type.toUpperCase();

    if (t === "JPG") {
      return lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg");
    }

    if (t === "PNG") {
      return lowerUrl.endsWith(".png");
    }

    if (t === "PDF") {
      return lowerUrl.endsWith(".pdf");
    }

    if (t === "TXT") {
      return lowerUrl.endsWith(".txt");
    }

    return false;
  }

  constructor() {
    this.repo = new TypeOrmDocRepo();
    this.documentProducer = new DocumentProducer();
  }

  @cachePurge(["searchDocument"])
  async createDocument(command: CreateDocumentCommand): Promise<DocumentState> {
    const validatedCommand = CreateDocumentCommandSchema.parse(command);
    if (validatedCommand.url?.startsWith("data:")) {
      throw DocumentErrors.INVALID_FILE_TYPE({
        reason: "Data URLs are not supported",
      });
    }
    if (validatedCommand.url) {
      const ok = this.isUrlMatchingType(
        validatedCommand.url,
        validatedCommand.type,
      );

      if (!ok) {
        throw DocumentErrors.INVALID_FILE_TYPE({
          expectedType: validatedCommand.type,
          url: validatedCommand.url,
        });
      }
    }
    const doc = await this.repo.create(validatedCommand);
    await this.documentProducer.documentCreated(doc);
    return doc;
  }

  @performanceTracker()
  @cacheGet(300)
  async getDocument(command: GetDocumentCommand): Promise<DocumentState> {
    const validatedCommand = GetDocumentCommandSchema.parse(command);
    const doc = await this.repo.getById(validatedCommand);
    if (!doc) throw DocumentErrors.NOT_FOUND();
    return doc;
  }

  @performanceTracker()
  @cacheGet(120)
  async searchDocument(
    command: SearchDocumentCommand,
  ): Promise<DocumentState[]> {
    const validatedCommand = SearchDocumentCommandSchema.parse(command);
    if (validatedCommand.status === DocumentStatusType.DELETED) {
      throw DocumentErrors.DELETED();
    }
    return this.repo.search(validatedCommand as SearchDocumentCommand);
  }

  @cachePurge(["getDocument", "listVersion"])
  async addVersion(command: AddVersionCommand): Promise<DocumentVersionState> {
    const validatedCommand = AddVersionCommandSchema.parse(command);

    const doc = await this.repo.getById({
      id: validatedCommand.documentId,
    });
    if (!doc) {
      throw DocumentErrors.NOT_FOUND();
    }

    if (doc.status === DocumentStatusType.DELETED) {
      throw DocumentErrors.DELETED();
    }

    if (!doc.active) {
      throw DocumentErrors.ARCHIVED();
    }

    const versions = await this.repo.listVersions({
      documentId: validatedCommand.documentId,
    });
    const nextVersion =
      versions.length === 0
        ? 1
        : Math.max(...versions.map((v) => v.version)) + 1;

    const newVersion = await this.repo.addVersion({
      documentId: validatedCommand.documentId,
      content: validatedCommand.content,
      version: nextVersion,
    });

    await this.documentProducer.versionAdded(newVersion);

    return newVersion;
  }

  @performanceTracker()
  @cacheGet(300)
  async listVersion(
    command: ListVersionCommand,
  ): Promise<DocumentVersionState[]> {
    const validatedCommand = ListVersionCommandSchema.parse(command);
    return this.repo.listVersions(validatedCommand);
  }

  @cachePurge(["getDocument", "listVersion", "searchDocument"])
  async archiveDocument(command: ArchiveDocumentCommand): Promise<void> {
    const validatedCommand = ArchiveDocumentCommandSchema.parse(command);

    const doc = await this.repo.getById({
      id: validatedCommand.documentId,
    });

    if (!doc) {
      throw DocumentErrors.NOT_FOUND({
        documentId: validatedCommand.documentId,
      });
    }

    if (!doc.active) throw DocumentErrors.ARCHIVED();

    await this.repo.archive(validatedCommand);

    await this.documentProducer.documentArchived({
      ...doc,
      active: false,
      status: DocumentStatusType.DRAFT,
    });
  }

  @cachePurge(["getDocument", "listVersion", "searchDocument"])
  async unarchiveDocument(command: UnArchiveDocumentCommand): Promise<void> {
    const validatedCommand = UnArchiveDocumentCommandSchema.parse(command);

    const doc = await this.repo.getById({
      id: validatedCommand.documentId,
    });

    if (!doc) {
      throw DocumentErrors.NOT_FOUND({
        documentId: validatedCommand.documentId,
      });
    }

    if (doc.active) throw DocumentErrors.ALREADY_ACTIVE();

    await this.repo.unarchive(validatedCommand);
    await this.documentProducer.documentUnArchived({
      ...doc,
      active: true,
      status: DocumentStatusType.PUBLISHED,
    });
  }

  @cachePurge(["getDocument", "listVersion", "searchDocument"])
  async softDeleteDocument(command: SoftDeleteDocumentCommand): Promise<void> {
    const validatedCommand = SoftDeleteDocumentCommandSchema.parse(command);

    const doc = await this.repo.getById({
      id: validatedCommand.documentId,
    });
    if (!doc) {
      throw DocumentErrors.NOT_FOUND();
    }
    await this.repo.softDelete(validatedCommand);
    await this.documentProducer.documentDeleted({
      ...doc,
      active: false,
      status: DocumentStatusType.DELETED,
    });
  }
}
