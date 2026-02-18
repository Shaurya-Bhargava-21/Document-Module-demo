import z from "zod";
import { DocumentStatusType, DocumentType } from "../../contracts/states/document.js";

const DocumentTypeValues = Object.values(DocumentType) as [DocumentType, ...DocumentType[]];
const docStatusValues = Object.values(DocumentStatusType) as [
  DocumentStatusType,
  ...DocumentStatusType[],
];

export const CreateDocumentCommandSchema = z.object({
  title: z
    .string()
    .min(1, "title is required")
    .max(200, "title must be less than 200 characters")
    .trim(),

  type: z.enum(DocumentTypeValues, {
    error: `Invalid document type. Valid types are: ${Object.values(DocumentType).join(", ")}`,
  }),
});

export const GetDocumentCommandSchema = z.object({
  id: z.uuid({ message: "invalid document id format" }),
});

export const SearchDocumentCommandSchema = z.object({
  query: z.string().max(100).nullable().default(null),
  type: z
    .enum(DocumentTypeValues, {
      error: `Invalid document type. Valid types are: ${Object.values(DocumentType).join(", ")}`,
    })
    .nullable()
    .default(null),
  status: z
    .enum(docStatusValues, {
      error: `Invalid status. Valid statuses are: ${Object.values(DocumentStatusType).join(", ")}`,
    })
    .nullable()
    .default(null),
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
  documentId: z.uuid({ message: "Invalid document ID format" }),
  content: z
    .string()
    .min(1, "cannot be empty")
    .max(50000, "content is too large (max 50,000 characters) "),
});

export const ListVersionCommandSchema = z.object({
  documentId: z.uuid({
    message: `Invalid document type. Valid types are: ${Object.values(DocumentType).join(", ")}`,
  }),
});

export const ArchiveDocumentCommandSchema = z.object({
  documentId: z.uuid({
    message: `Invalid document type. Valid types are: ${Object.values(DocumentType).join(", ")}`,
  }),
});
export const UnArchiveDocumentCommandSchema = z.object({
  documentId: z.uuid({
    message: `Invalid document type. Valid types are: ${Object.values(DocumentType).join(", ")}`,
  }),
});

export const SoftDeleteDocumentCommandSchema = z.object({
  documentId: z.uuid({
    message: `Invalid document type. Valid types are: ${Object.values(DocumentType).join(", ")}`,
  }),
});

export const UpdateDocumentCommandSchema = z
  .object({
    documentId: z.uuid({ message: "Invalid Document Id format" }),
    title: z
      .string()
      .min(1, "title cannot be empty")
      .max(200, "title must be less than 200 characters")
      .trim()
      .nullable()
      .default(null),
    status: z
      .enum(docStatusValues, {
        error: `Invalid status. Valid statuses are: ${Object.values(DocumentStatusType).join(", ")}`,
      })
      .nullable()
      .default(null),
    active: z.boolean().nullable().default(null),
  })
  .refine(
    (data) =>
      data.title !== null ||
      data.status !== null ||
      data.active !== null,
    {
      message: "At least one field (title, status, or active) must be provided",
    },
  );
