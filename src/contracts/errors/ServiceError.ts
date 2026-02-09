import type { IServiceError } from "../states/document.js";

export class ServiceError extends Error implements IServiceError {
  readonly code: string;
  readonly details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
