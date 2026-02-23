import z from "zod";
import {
  DocumentStatusType,
  DocumentType,
} from "../../contracts/states/document.js";

const DocumentTypeValues = Object.values(DocumentType) as [
  DocumentType,
  ...DocumentType[],
];
const docStatusValues = Object.values(DocumentStatusType) as [
  DocumentStatusType,
  ...DocumentStatusType[],
];

const INVALID_DOCUMENT_ID_ERROR = "Invalid document ID format";
const INVALID_DOCUMENT_TYPE_ERROR = `Invalid document type. Valid types are: ${Object.values(DocumentType).join(", ")}`;
const INVALID_STATUS_ERROR = `Invalid status. Valid statuses are: ${Object.values(DocumentStatusType).join(", ")}`;

const documentId = z.uuid({ message: INVALID_DOCUMENT_ID_ERROR });
const documentType = z.enum(DocumentTypeValues, {
  error: INVALID_DOCUMENT_TYPE_ERROR,
});
const documentStatus = z.enum(docStatusValues, { error: INVALID_STATUS_ERROR });
const documentTitle = z
  .string()
  .min(1, "title is required")
  .max(200, "title must be less than 200 characters")
  .trim();
const documentUrl = z.url({ message: "Invalid URL format" });
export const CreateDocumentCommandSchema = z.object({
  title: documentTitle,
  type: documentType,
  url: documentUrl,
});

export const GetDocumentCommandSchema = z.object({
  id: documentId,
});

export const SearchDocumentCommandSchema = z.object({
  query: z.string().max(100).nullable().default(null),
  type: documentType.nullable().default(null),
  status: documentStatus.nullable().default(null),
  active: z
    .union([
      z.boolean(),
      z.enum(["true", "false"]).transform((v) => v === "true"),
    ])
    .nullable()
    .default(null),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100, "Limit cannot exceed 100")
    .default(10),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export const AddVersionCommandSchema = z.object({
  documentId,
  content: z
    .string()
    .min(1, "cannot be empty")
    .max(50000, "content is too large (max 50,000 characters)"),
});

export const ListVersionCommandSchema = z.object({ documentId });
export const ArchiveDocumentCommandSchema = z.object({ documentId });
export const UnArchiveDocumentCommandSchema = z.object({ documentId });
export const SoftDeleteDocumentCommandSchema = z.object({ documentId });

export const UpdateDocumentCommandSchema = z
  .object({
    documentId,
    title: documentTitle.nullable().default(null),
    status: documentStatus.nullable().default(null),
    active: z.boolean().nullable().default(null),
  })
  .refine(
    (data) =>
      data.title !== null || data.status !== null || data.active !== null,
    {
      message: "At least one field (title, status, or active) must be provided",
    },
  );
