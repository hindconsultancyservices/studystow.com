import connectDB from "@/lib/db";
import AuditLog from "@/models/AuditLog";

export type AuditResult = "success" | "failed";

export type AuditLogInput = {
  actor?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: Record<string, any>;
  ipAddress?: string | null;
  userAgent?: string | null;
  result?: AuditResult;
};

/**
 * Create an audit log.
 *
 * Audit logs are stored in MongoDB and should be used
 * for sensitive admin/RBAC actions.
 */
export async function createAuditLog(
  input: AuditLogInput
) {
  try {
    await connectDB();

    const log = await AuditLog.create({
      actor: input.actor || null,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId || null,
      metadata: input.metadata || {},
      ipAddress: input.ipAddress || "",
      userAgent: input.userAgent || "",
      result: input.result || "success",
    });

    return {
      success: true,
      id: String(log._id),
    };
  } catch (error) {
    /**
     * Audit logging must never break the main
     * business operation.
     */
    console.error(
      "Audit log creation failed:",
      error
    );

    return {
      success: false,
      id: null,
    };
  }
}

/**
 * Extract client IP address from a request.
 */
export function getRequestIp(
  request: Request
): string {
  const headers = request.headers;

  const forwardedFor =
    headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor
      .split(",")[0]
      .trim();
  }

  const realIp =
    headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim();
  }

  const connectingIp =
    headers.get("cf-connecting-ip");

  if (connectingIp) {
    return connectingIp.trim();
  }

  return "";
}

/**
 * Get the request user-agent.
 */
export function getRequestUserAgent(
  request: Request
): string {
  return (
    request.headers.get(
      "user-agent"
    ) || ""
  );
}

/**
 * Create an audit log directly from a request.
 */
export async function auditRequest(
  request: Request,
  input: Omit<
    AuditLogInput,
    "ipAddress" | "userAgent"
  >
) {
  return createAuditLog({
    ...input,
    ipAddress: getRequestIp(request),
    userAgent: getRequestUserAgent(request),
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
  >
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
  >
) {
  return auditRequest(request, {
    ...input,
    result: "failed",
  });
}