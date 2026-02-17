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
import { DocumentController } from "../../app/controllers/DocumentController.js";

export const documentRoutes: FastifyPluginAsync = async (app) => {
  let service:IDocumentService= new DocumentService();
    // service = new InMemoryDocService();
  const controller = new DocumentController(service);

  // create document
  app.post<{ Body: CreateDocumentCommand }>(
    "/",
    { schema: { body: CreateDocumentCommandSchema } },
    (req, reply) => controller.create(req, reply),
  );

  // search documents
  app.get<{ Querystring: SearchDocumentCommand }>(
    "/",
    { schema: { querystring: SearchDocumentCommandSchema } },
    (req, reply) => controller.search(req, reply),
  );

  // get document by id
  app.get<{ Params: GetDocumentCommand }>(
    "/:id",
    { schema: { params: GetDocumentCommandSchema } },
    (req, reply) => controller.getById(req, reply),
  );

  // add version
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
    (req, reply) => controller.addVersion(req, reply),
  );

  // list versions
  app.get<{ Params: ListVersionCommand }>(
    "/:documentId/versions",
    { schema: { params: ListVersionCommandSchema } },
    (req, reply) => controller.listVersions(req, reply),
  );

  // archive document
  app.patch<{ Params: ArchiveDocumentCommand }>(
    "/:documentId/archive",
    { schema: { params: ArchiveDocumentCommandSchema } },
    (req, reply) => controller.archive(req, reply),
  );

  // unarchive document
  app.patch<{ Params: UnArchiveDocumentCommand }>(
    "/:documentId/unarchive",
    { schema: { params: UnArchiveDocumentCommandSchema } },
    (req, reply) => controller.unarchive(req, reply),
  );

  // soft delete document
  app.delete<{ Params: SoftDeleteDocumentCommand }>(
    "/:documentId",
    { schema: { params: SoftDeleteDocumentCommandSchema } },
    (req, reply) => controller.softDelete(req, reply),
  );
  
};
