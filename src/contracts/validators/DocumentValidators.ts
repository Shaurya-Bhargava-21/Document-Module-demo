import z from "zod";
import { DocStatusType, DocType } from "../../contracts/states/document.js";

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
      {
        message: `Invalid document type. Valid types are: ${Object.values(DocType).join(", ")}`,
      },
    ),
});

export const GetDocumentCommandSchema = z.object({
  id: z.uuid({ message: "invalid document id format" }),
});

export const SearchDocumentCommandSchema = z.object({
  query: z.string().max(100).optional(),
  type: z
    .string()
    .transform((v) => v.toUpperCase())
    .refine((val) => Object.values(DocType).includes(val as DocType), {
      message: `Invalid document type. Valid types are: ${Object.values(DocType).join(", ")}`,
    })
    .optional(),
  status: z
    .string()
    .transform((v) => v.toUpperCase())
    .refine(
      (val) => Object.values(DocStatusType).includes(val as DocStatusType),
      {
        message: `Invalid document type. Valid types are: ${Object.values(DocStatusType).join(", ")}`,
      },
    )
    .optional(),
  active: z
    .union([
      z.boolean(),
      z.enum(["true", "false"]).transform((v) => v === "true"),
    ])
    .optional(),
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
    message: `Invalid document type. Valid types are: ${Object.values(DocType).join(", ")}`,
  }),
});

export const ArchiveDocumentCommandSchema = z.object({
  documentId: z.uuid({
    message: `Invalid document type. Valid types are: ${Object.values(DocType).join(", ")}`,
  }),
});
export const UnArchiveDocumentCommandSchema = z.object({
  documentId: z.uuid({
    message: `Invalid document type. Valid types are: ${Object.values(DocType).join(", ")}`,
  }),
});

export const SoftDeleteDocumentCommandSchema = z.object({
  documentId: z.uuid({
    message: `Invalid document type. Valid types are: ${Object.values(DocType).join(", ")}`,
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
      .optional(),
    status: z
      .string()
      .refine(
        (val) => Object.values(DocStatusType).includes(val as DocStatusType),
        {
          message: `Invalid document type. Valid types are: ${Object.values(DocType).join(", ")}`,
        },
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