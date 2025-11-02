// C:/Project/CoUp/coup/src/lib/utils/errors.js

/**
 * Base custom error class for CoUp application.
 * Extends Error to allow for custom error types and properties.
 */
class CoUpError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    // Capture stack trace for better debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error for when a resource is not found (e.g., 404 Not Found).
 */
export class NotFoundError extends CoUpError {
  constructor(message = 'Resource not found', errorCode = 'NOT_FOUND') {
    super(message, 404, errorCode);
  }
}

/**
 * Error for when a user is unauthorized (e.g., 401 Unauthorized).
 */
export class UnauthorizedError extends CoUpError {
  constructor(message = 'Unauthorized access', errorCode = 'UNAUTHORIZED') {
    super(message, 401, errorCode);
  }
}

/**
 * Error for when a user is forbidden from accessing a resource (e.g., 403 Forbidden).
 */
export class ForbiddenError extends CoUpError {
  constructor(message = 'Access forbidden', errorCode = 'FORBIDDEN') {
    super(message, 403, errorCode);
  }
}

/**
 * Error for invalid input or bad requests (e.g., 400 Bad Request).
 */
export class BadRequestError extends CoUpError {
  constructor(message = 'Bad request', errorCode = 'BAD_REQUEST') {
    super(message, 400, errorCode);
  }
}

/**
 * Error for conflicts, typically when a resource already exists (e.g., 409 Conflict).
 */
export class ConflictError extends CoUpError {
  constructor(message = 'Conflict', errorCode = 'CONFLICT') {
    super(message, 409, errorCode);
  }
}

/**
 * Error for unprocessable entity, typically for validation failures (e.g., 422 Unprocessable Entity).
 */
export class UnprocessableEntityError extends CoUpError {
  constructor(message = 'Unprocessable entity', errorCode = 'UNPROCESSABLE_ENTITY') {
    super(message, 422, errorCode);
  }
}

/**
 * Generic internal server error.
 */
export class InternalServerError extends CoUpError {
  constructor(message = 'Internal server error', errorCode = 'INTERNAL_SERVER_ERROR') {
    super(message, 500, errorCode);
  }
}