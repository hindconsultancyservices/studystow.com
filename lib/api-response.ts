import { NextResponse } from "next/server";

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: unknown;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Success response
 */
export function successResponse<T>(
  data?: T,
  message = "Request successful",
  status = 200
) {
  const response: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
  };

  return NextResponse.json(response, { status });
}

/**
 * Created response
 */
export function createdResponse<T>(
  data?: T,
  message = "Created successfully"
) {
  return successResponse(data, message, 201);
}

/**
 * Error response
 */
export function errorResponse(
  message = "Something went wrong",
  status = 500,
  error?: unknown
) {
  const response: ApiResponse = {
    success: false,
    message,
    ...(error !== undefined ? { error } : {}),
  };

  return NextResponse.json(response, { status });
}

/**
 * Bad request response - 400
 */
export function badRequestResponse(
  message = "Invalid request",
  error?: unknown
) {
  return errorResponse(message, 400, error);
}

/**
 * Unauthorized response - 401
 */
export function unauthorizedResponse(
  message = "Unauthorized"
) {
  return errorResponse(message, 401);
}

/**
 * Forbidden response - 403
 */
export function forbiddenResponse(
  message = "Forbidden"
) {
  return errorResponse(message, 403);
}

/**
 * Not found response - 404
 */
export function notFoundResponse(
  message = "Resource not found"
) {
  return errorResponse(message, 404);
}

/**
 * Conflict response - 409
 */
export function conflictResponse(
  message = "Resource already exists"
) {
  return errorResponse(message, 409);
}

/**
 * Validation error response - 422
 */
export function validationErrorResponse(
  message = "Validation failed",
  error?: unknown
) {
  return errorResponse(message, 422, error);
}

/**
 * Server error response - 500
 */
export function serverErrorResponse(
  message = "Internal server error",
  error?: unknown
) {
  return errorResponse(message, 500, error);
}

/**
 * Paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message = "Data fetched successfully"
) {
  const totalPages =
    pagination.limit > 0
      ? Math.ceil(pagination.total / pagination.limit)
      : 0;

  const response: ApiResponse<T[]> = {
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
    },
  };

  return NextResponse.json(response, { status: 200 });
}

/**
 * Handle unknown errors safely
 */
export function handleApiError(
  error: unknown,
  fallbackMessage = "Internal server error"
) {
  console.error("[API ERROR]", error);

  if (error instanceof Error) {
    return serverErrorResponse(fallbackMessage, {
      message: error.message,
    });
  }

  return serverErrorResponse(fallbackMessage);
}
