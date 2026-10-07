
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import AuditLog from "@/models/AuditLog";

export type AuditResult = "success" | "failed";

export type AuditLogInput = {
  actor?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
  result?: AuditResult;
};

/**
 * Create an audit log record.
 *
 * IMPORTANT:
 * - Audit logging must never break the main business operation.
 * - Invalid/missing actor IDs are handled safely.
 * - MongoDB connection is created automatically.
 */
export async function createAuditLog(
  input: AuditLogInput,
) {
  try {
    await connectDB();

    let actor: mongoose.Types.ObjectId | null = null;

    if (
      input.actor &&
      mongoose.Types.ObjectId.isValid(input.actor)
    ) {
      actor = new mongoose.Types.ObjectId(
        input.actor,
      );
    }

    const log = await AuditLog.create({
      actor,

      action: String(input.action || "").trim(),

      resource: String(
        input.resource || "",
      ).trim(),

      resourceId:
        input.resourceId !== undefined &&
        input.resourceId !== null
          ? String(input.resourceId)
          : "",

      metadata:
        input.metadata &&
        typeof input.metadata === "object"
          ? input.metadata
          : {},

      ipAddress:
        input.ipAddress
          ?.toString()
          .trim() || "",

      userAgent:
        input.userAgent
          ?.toString()
          .trim() || "",

      result:
        input.result === "failed"
          ? "failed"
          : "success",
    });

    return {
      success: true,
      id: String(log._id),
    };
  } catch (error) {
    /**
     * NEVER allow audit logging failure
     * to break the actual admin operation.
     */
    console.error(
      "Audit log creation failed:",
      error,
    );

    return {
      success: false,
      id: null,
    };
  }
}

/**
 * Extract the client IP address from a request.
 *
 * Supports:
 * - x-forwarded-for
 * - x-real-ip
 * - cf-connecting-ip
 */
export function getRequestIp(
  request: Request,
): string {
  try {
    const headers = request.headers;

    const forwardedFor =
      headers.get("x-forwarded-for");

    if (forwardedFor) {
      return (
        forwardedFor
          .split(",")[0]
          ?.trim() || ""
      );
    }

    const realIp =
      headers.get("x-real-ip");

    if (realIp) {
      return realIp.trim();
    }

    const cloudflareIp =
      headers.get("cf-connecting-ip");

    if (cloudflareIp) {
      return cloudflareIp.trim();
    }

    return "";
  } catch (error) {
    console.error(
      "Failed to read request IP:",
      error,
    );

    return "";
  }
}

/**
 * Get the request user-agent.
 */
export function getRequestUserAgent(
  request: Request,
): string {
  try {
    return (
      request.headers.get(
        "user-agent",
      ) || ""
    );
  } catch (error) {
    console.error(
      "Failed to read request user-agent:",
      error,
    );

    return "";
  }
}

/**
 * Create an audit log directly from
 * a server request.
 */
export async function auditRequest(
  request: Request,
  input: Omit<
    AuditLogInput,
    "ipAddress" | "userAgent"
  >,
) {
  return createAuditLog({
    ...input,

    ipAddress:
      getRequestIp(request),

    userAgent:
      getRequestUserAgent(request),
  });
}

/**
 * Log a successful admin action.
 */
export async function logSuccess(
  request: Request,
  input: Omit<
    AuditLogInput,
    "ipAddress" | "userAgent" | "result"
  >,
) {
  return auditRequest(request, {
    ...input,
    result: "success",
  });
}

/**
 * Log a failed admin action.
 */
export async function logFailure(
  request: Request,
  input: Omit<
    AuditLogInput,
    "ipAddress" | "userAgent" | "result"
  >,
) {
  return auditRequest(request, {
    ...input,
    result: "failed",
  });
}
