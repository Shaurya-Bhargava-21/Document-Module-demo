import { type FastifyPluginAsync } from "fastify";
import { DocumentService } from "../../app/services/DocumentService.js";
import type { IDocumentService } from "../../contracts/services/IDocumentService.js";
import { InMemoryDocService } from "../../app/services/InMemoryDocService.js";
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

export const documentRoutes: FastifyPluginAsync = async (app) => {
  let service: IDocumentService = new DocumentService();
  //   service = new InMemoryDocService();

  //create document
  app.post<{
    Body: CreateDocumentCommand;
  }>(
    "/",
    {
      schema: {
        body: CreateDocumentCommandSchema,
      },
    },
    async (req, reply) => {
      const doc = await service.createDocument(req.body);
      reply.code(201).send(doc);
    },
  );

  //search document
  app.get<{
    Querystring: SearchDocumentCommand;
  }>(
    "/",
    {
      schema: {
        querystring: SearchDocumentCommandSchema,
      },
    },
    async (req) => {
      return service.searchDocument(req.query);
    },
  );

  //get document
  app.get<{
    Params: GetDocumentCommand;
  }>(
    "/:id",
    {
      schema: {
        params: GetDocumentCommandSchema,
      },
    },
    async (req) => {
      return service.getDocument(req.params);
    },
  );

  //add version
  app.post<{
    Params: GetDocumentCommand;
    Body: Pick<AddVersionCommand, "content">;
  }>(
    "/:id/versions",
    {
      schema: {
        params: GetDocumentCommandSchema,
        body: AddVersionCommandSchema.pick({ content: true }),
      },
    },
    async (req, reply) => {
      const version = await service.addVersion({
        documentId: req.params.id,
        content: req.body.content,
      });

      reply.code(201).send(version);
    },
  );

  //list versions
  app.get<{
    Params: ListVersionCommand;
  }>(
    "/:documentId/versions",
    {
      schema: {
        params: ListVersionCommandSchema,
      },
    },
    async (req) => {
      return service.listVersion(req.params);
    },
  );

  //archive document
  app.patch<{
    Params: ArchiveDocumentCommand;
  }>(
    "/:documentId/archive",
    {
      schema: {
        params: ArchiveDocumentCommandSchema,
      },
    },
    async (req) => {
      await service.archiveDocument(req.params);
      return { message: "Document Archived" };
    },
  );

  //unarchive document
  app.patch<{
    Params: UnArchiveDocumentCommand;
  }>(
    "/:documentId/unarchive",
    {
      schema: {
        params: UnArchiveDocumentCommandSchema,
      },
    },
    async (req) => {
      await service.unarchiveDocument(req.params);
      return { message: "Document Unarchived" };
    },
  );

  //soft delete document
  app.delete<{
    Params: SoftDeleteDocumentCommand;
  }>(
    "/:documentId",
    {
      schema: {
        params: SoftDeleteDocumentCommandSchema,
      },
    },
    async (req) => {
      await service.softDeleteDocument(req.params);
      return { message: "Document deleted" };
    },
  );
};
