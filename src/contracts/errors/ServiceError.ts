import type { IServiceError } from "../states/document.js";

export class ServiceError extends Error implements IServiceError {
  readonly code: string;
  readonly details?: unknown;
  readonly statusCode: number;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: unknown,
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}
