import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  HttpStatus,
  TooManyRequestsError,
} from "@/core/utils";
import { logger } from "@/core/utils";
import { env } from "@/config";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  logger.error("Error caught by handler", err);

  // Handle our custom AppError classes
  if (err instanceof AppError) {
    const response: Record<string, unknown> = {
      success: false,
      error: {
        name: err.name,
        message: err.message,
        code: err.code,
        ...(env.isDevelopment && { stack: err.stack }),
      },
    };

    // Add validation errors array if ValidationError
    if (err instanceof ValidationError) {
      (response.error as Record<string, unknown>).errors = err.errors;
    }

    // Add retry-after header for rate limiting
    if (err instanceof TooManyRequestsError && err.retryAfter) {
      res.setHeader("Retry-After", err.retryAfter);
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    const prismaError = err as Error & { code?: string; meta?: { target?: string[] } };

    if (prismaError.code === "P2002") {
      const conflictErr = new ConflictError(
        `A record with this value already exists`,
        "DUPLICATE_ENTRY"
      );
      res.status(conflictErr.statusCode).json({
        success: false,
        error: {
          name: conflictErr.name,
          message: conflictErr.message,
          code: conflictErr.code,
        },
      });
      return;
    }

    if (prismaError.code === "P2025") {
      const notFoundErr = new NotFoundError("Record not found");
      res.status(notFoundErr.statusCode).json({
        success: false,
        error: {
          name: notFoundErr.name,
          message: notFoundErr.message,
          code: notFoundErr.code,
        },
      });
      return;
    }
  }

  // Handle unknown errors
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      name: "InternalError",
      message: env.isProduction ? "Internal server error" : err.message,
      code: "INTERNAL_ERROR",
      ...(env.isDevelopment && { stack: err.stack }),
    },
  });
};
