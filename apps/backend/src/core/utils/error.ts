export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
  NO_CONTENT = 204,
}

export abstract class AppError extends Error {
  public abstract readonly statusCode: HttpStatus;
  public abstract readonly isOperational: boolean;
  public readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      isOperational: this.isOperational,
    };
  }
}

export class BadRequestError extends AppError {
  public readonly statusCode = HttpStatus.BAD_REQUEST;
  public readonly isOperational = true;

  constructor(message: string = "Bad request", code: string = "BAD_REQUEST") {
    super(message, code);
  }
}

export class UnauthorizedError extends AppError {
  public readonly statusCode = HttpStatus.UNAUTHORIZED;
  public readonly isOperational = true;

  constructor(message: string = "Unauthorized", code: string = "UNAUTHORIZED") {
    super(message, code);
  }
}

export class ForbiddenError extends AppError {
  public readonly statusCode = HttpStatus.FORBIDDEN;
  public readonly isOperational = true;

  constructor(message: string = "Forbidden", code: string = "FORBIDDEN") {
    super(message, code);
  }
}

export class NotFoundError extends AppError {
  public readonly statusCode = HttpStatus.NOT_FOUND;
  public readonly isOperational = true;

  constructor(message: string = "Resource not found", code: string = "NOT_FOUND") {
    super(message, code);
  }
}

export class ConflictError extends AppError {
  public readonly statusCode = HttpStatus.CONFLICT;
  public readonly isOperational = true;

  constructor(message: string = "Resource already exists", code: string = "CONFLICT") {
    super(message, code);
  }
}

export class ValidationError extends AppError {
  public readonly statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
  public readonly isOperational = true;
  public readonly errors: string[];

  constructor(errors: string | string[], code: string = "VALIDATION_ERROR") {
    const errorArray = Array.isArray(errors) ? errors : [errors];
    super(errorArray.join(", "), code);
    this.errors = errorArray;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors,
    };
  }
}

export class TooManyRequestsError extends AppError {
  public readonly statusCode = HttpStatus.TOO_MANY_REQUESTS;
  public readonly isOperational = true;
  public readonly retryAfter?: number;

  constructor(message: string = "Too many requests", retryAfter?: number) {
    super(message, "TOO_MANY_REQUESTS");
    this.retryAfter = retryAfter;
  }
}

export class InternalError extends AppError {
  public readonly statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  public readonly isOperational = false;

  constructor(message: string = "Internal server error", code: string = "INTERNAL_ERROR") {
    super(message, code);
  }
}

export class ServiceUnavailableError extends AppError {
  public readonly statusCode = HttpStatus.SERVICE_UNAVAILABLE;
  public readonly isOperational = true;

  constructor(
    message: string = "Service temporarily unavailable",
    code: string = "SERVICE_UNAVAILABLE"
  ) {
    super(message, code);
  }
}
