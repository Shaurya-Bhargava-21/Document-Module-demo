import { ServiceError } from "./ServiceError.js";

export const DocumentErrors = {
  NOT_FOUND: (details?: unknown) =>
    new ServiceError("DOCUMENT_NOT_FOUND", "Document Not Found", 404, details),

  DELETED: () =>
    new ServiceError("DOCUMENT_DELETED", "Document does not exist", 400),

  ARCHIVED: () =>
    new ServiceError("DOCUMENT_ARCHIVED", "Document is archived", 400),

  VERSION_NOT_ALLOWED: () =>
    new ServiceError(
      "VERSION_NOT_ALLOWED",
      "Cannot add version to this document",
      400,
    ),

  ALREADY_ACTIVE: () =>
    new ServiceError(
      "DOCUMENT_ALREADY_ACTIVE",
      "Document is already active",
      400,
    ),
  INVALID_FILE_TYPE: (details?: unknown) =>
    new ServiceError(
      "INVALID_FILE_TYPE",
      "File type does not match document type",
      400,
      details,
    ),
};
