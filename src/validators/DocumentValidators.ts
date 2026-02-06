import z from "zod";
import { DocStatusType, DocType } from "../contracts/states/document.js";

export const CreateDocumentCommandSchema = z.object({
  title: z
    .string()
    .min(1, "title is required")
    .max(200, "title must be less than 200 characters")
    .trim(),

  type: z
    .string()
    .refine(
      (val): val is DocType => Object.values(DocType).includes(val as DocType),
      { message: "Invalid document type" },
    ),
});

export const GetDocumentCommandSchema = z.object({
  id: z.uuid({ message: "invalid document id format" }),
});

export const SearchDocumentCommandSchema = z.object({
  query: z.string().max(100).optional(),
  type: z
    .string()
    .refine((val) => Object.values(DocType).includes(val as DocType), {
      message: "Invalid document type",
    })
    .optional(),
  status: z
    .string()
    .refine(
      (val) => Object.values(DocStatusType).includes(val as DocStatusType),
      { message: "Invalid Document Type" },
    )
    .optional(),
  active: z.boolean().optional(),
  limit: z
    .number()
    .int()
    .positive()
    .max(100, "Limit cannot exceed 100")
    .default(10),
  offset: z.number().int().nonnegative().default(0),
});

export const AddVersionCommandSchema = z.object({
  documentId: z.uuid({ message: "Invalid document ID format" }),
  content: z
    .string()
    .min(1, "cannot be empty")
    .max(50000, "content is too large (max 50,000 characters) "),
});

export const ListVersionCommandSchema = z.object({
  documentId: z.uuid({ message: "Invalid Document Id format" }),
});

export const ArchiveDocumentCommandSchema = z.object({
  documentId: z.uuid({ message: "Invalid Document Id format" }),
});

export const SoftDeleteDocumentCommandSchema = z.object({
  documentId: z.uuid({ message: "Invalid Document Id format" }),
});


export const UpdateDocumentCommandSchema = z.object({
    documentId: z.uuid({ message: "Invalid Document Id format" }),
    title: z
      .string()
      .min(1, "title cannot be empty")
      .max(200, "title must be less than 200 characters")
      .trim()
      .optional(),
    status: z
      .string()
      .refine(
        (val) => Object.values(DocStatusType).includes(val as DocStatusType),
        { message: "Invalid Document Type" },
      )
      .optional(),
    active: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.status !== undefined ||
      data.active !== undefined,
    {
      message: "At least one field (title, status, or active) must be provided",
    },
);

export type SearchDocumentCommandValidated = z.infer<typeof SearchDocumentCommandSchema>