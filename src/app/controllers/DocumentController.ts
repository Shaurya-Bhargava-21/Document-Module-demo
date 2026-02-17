import type { FastifyReply, FastifyRequest } from "fastify";
import type { IDocumentService } from "../../contracts/services/IDocumentService.js";
import type {
  AddVersionCommand,
  ArchiveDocumentCommand,
  CreateDocumentCommand,
  GetDocumentCommand,
  ListVersionCommand,
  SearchDocumentCommand,
  SoftDeleteDocumentCommand,
  UnArchiveDocumentCommand,
} from "../../contracts/states/document.js";

export class DocumentController {
  constructor(private service: IDocumentService) {}

  async create(
    req: FastifyRequest<{ Body: CreateDocumentCommand }>,
    reply: FastifyReply,
  ) {
    const doc = await this.service.createDocument(req.body);
    reply.code(201).send(doc);
  }

  async search(
    req: FastifyRequest<{ Querystring: SearchDocumentCommand }>,
    reply: FastifyReply,
  ) {
    const docs = await this.service.searchDocument(req.query);
    reply.send(docs);
  }

  async getById(
    req: FastifyRequest<{ Params: GetDocumentCommand }>,
    reply: FastifyReply,
  ) {
    const doc = await this.service.getDocument(req.params);
    reply.send(doc);
  }

  async addVersion(
    req: FastifyRequest<{
      Params: GetDocumentCommand;
      Body: Pick<AddVersionCommand, "content">;
    }>,
    reply: FastifyReply,
  ) {
    const version = await this.service.addVersion({
      documentId: req.params.id,
      content: req.body.content,
    });
    reply.code(201).send(version);
  }

  async listVersions(
    req: FastifyRequest<{ Params: ListVersionCommand }>,
    reply: FastifyReply,
  ) {
    const versions = await this.service.listVersion(req.params);
    reply.send(versions);
  }

  async archive(
    req: FastifyRequest<{ Params: ArchiveDocumentCommand }>,
    reply: FastifyReply,
  ) {
    await this.service.archiveDocument(req.params);
    reply.send({ message: "Document Archived" });
  }

  async unarchive(
    req: FastifyRequest<{ Params: UnArchiveDocumentCommand }>,
    reply: FastifyReply,
  ) {
    await this.service.unarchiveDocument(req.params);
    reply.send({ message: "Document Unarchived" });
  }

  async softDelete(
    req: FastifyRequest<{ Params: SoftDeleteDocumentCommand }>,
    reply: FastifyReply,
  ) {
    await this.service.softDeleteDocument(req.params);
    reply.send({ message: "Document deleted" });
  }
}
