import mongoose, {
  Document,
  HydratedDocument,
  Model,
  Schema,
} from "mongoose";

import {
  PERMISSION_MODULES,
  PERMISSION_CONFIG,
  type PermissionMap,
  hasPermission,
  isOwnerRole,
  sanitizePermissions,
} from "@/lib/permissions";

// ============================================================
// TYPES
// ============================================================

/**
 * Main application role.
 *
 * Existing StudyStow accounts normally use:
 * - customer
 * - admin
 *
 * owner/super_admin are also accepted here for backward
 * compatibility with older records and authorization code.
 * Custom staff roles MUST continue to live in adminRole/Role.
 */
export type UserRole =
  | "customer"
  | "admin"
  | "owner"
  | "super_admin";

/**
 * Dynamic administrator role slug.
 *
 * There is intentionally no fixed enum because roles are created
 * dynamically from the Role collection.
 */
export type AdminRole =
  | "owner"
  | "super_admin"
  | "manager"
  | "staff"
  | "custom"
  | (string & {});

export type UserStatus =
  | "active"
  | "suspended"
  | "removed";

// ============================================================
// PERMISSION STORAGE TYPES
// ============================================================

/**
 * Compatibility input accepted by the model setter.
 * Older role/invitation routes may send:
 *
 * books: ["view", "edit"]
 *
 * Newer routes store:
 *
 * books: { view: true, edit: true }
 */
type PermissionStorageInput =
  | PermissionMap
  | Record<string, string[]>
  | Record<string, unknown>
  | null
  | undefined;

// ============================================================
// USER INTERFACE
// ============================================================

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;

  phone?: string;

  role: UserRole;

  // ==========================================================
  // ADMIN RBAC
  // ==========================================================

  /** Dynamic Role.slug assigned to the administrator. */
  adminRole?: AdminRole;

  /** Primary relation to Role collection. */
  roleId?: mongoose.Types.ObjectId | null;

  /** Effective permission snapshot for fast authorization. */
  permissions: PermissionMap;

  /**
   * Monotonically increasing access version.
   *
   * Useful for invalidating stale sessions/JWTs after:
   * - role change
   * - permission change
   * - suspension/removal
   */
  accessVersion: number;

  /** Last time the RBAC snapshot was changed. */
  permissionsUpdatedAt?: Date | null;

  /** Last successful login timestamp. */
  lastLoginAt?: Date | null;

  /** Optional security telemetry for the last login. */
  lastLoginIp?: string | null;
  lastLoginUserAgent?: string | null;

  // ==========================================================
  // ACCOUNT STATUS
  // ==========================================================

  status: UserStatus;
  active: boolean;

  // ==========================================================
  // INVITATION / OWNERSHIP
  // ==========================================================

  invitedBy?: mongoose.Types.ObjectId | null;

  invitationToken?: string;
  invitationExpires?: Date;

  // ==========================================================
  // PASSWORD RESET
  // ==========================================================

  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// PERMISSION NORMALIZATION
// ============================================================

/**
 * Convert every permission representation into the canonical
 * boolean PermissionMap stored in MongoDB.
 *
 * This deliberately accepts both old and new formats so existing
 * invitation/role documents do not break during migration.
 */
function normalizePermissionStorage(
  value: PermissionStorageInput
): PermissionMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const source = value as Record<string, unknown>;
  const canonical: Record<string, Record<string, boolean>> = {};

  for (const module of PERMISSION_MODULES) {
    const moduleValue = source[module];

    if (!moduleValue) {
      continue;
    }

    // Legacy/frontend format:
    // books: ["view", "edit"]
    if (Array.isArray(moduleValue)) {
      const actions: Record<string, boolean> = {};

      for (const action of moduleValue) {
        if (typeof action === "string") {
          actions[action] = true;
        }
      }

      canonical[module] = actions;
      continue;
    }

    // Canonical MongoDB format:
    // books: { view: true, edit: true }
    if (typeof moduleValue === "object") {
      const sourceActions = moduleValue as Record<string, unknown>;
      const actions: Record<string, boolean> = {};

      for (const configuredAction of PERMISSION_CONFIG.find(
        (item) => item.module === module
      )?.actions || []) {
        actions[configuredAction] =
          sourceActions[configuredAction] === true;
      }

      canonical[module] = actions;
    }
  }

  return sanitizePermissions(canonical);
}

// ============================================================
// PURE USER ACCESS HELPERS
// ============================================================

/** Whether the account is an administrator-type account. */
export function isUserAdminAccount(
  user: Pick<IUser, "role">
): boolean {
  return (
    user.role === "admin" ||
    user.role === "owner" ||
    user.role === "super_admin"
  );
}

/** Whether the administrator account is currently usable. */
export function isUserActiveAccount(
  user: Pick<IUser, "active" | "status">
): boolean {
  return user.active === true && user.status === "active";
}

/** Owner accounts bypass module/action permissions. */
export function isUserOwnerAccount(
  user: Pick<IUser, "role" | "adminRole">
): boolean {
  return (
    user.role === "owner" ||
    user.role === "super_admin" ||
    isOwnerRole(user.role, user.adminRole)
  );
}

/**
 * Fast permission check against the user's effective permission
 * snapshot. Server authorization code can still re-resolve the Role
 * document when it needs the absolute latest permission state.
 */
export function userHasPermission(
  user: Pick<IUser, "role" | "adminRole" | "permissions" | "active" | "status">,
  module: Parameters<typeof hasPermission>[1],
  action: Parameters<typeof hasPermission>[2]
): boolean {
  if (!isUserActiveAccount(user)) {
    return false;
  }

  if (isUserOwnerAccount(user)) {
    return true;
  }

  if (!isUserAdminAccount(user)) {
    return false;
  }

  return hasPermission(user.permissions, module, action);
}

// ============================================================
// USER SCHEMA
// ============================================================

const UserSchema = new Schema<IUser>(
  {
    // --------------------------------------------------------
    // BASIC INFORMATION
    // --------------------------------------------------------

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 20,
    },

    // --------------------------------------------------------
    // MAIN APPLICATION ROLE
    // --------------------------------------------------------

    role: {
      type: String,
      enum: [
        "customer",
        "admin",
        "owner",
        "super_admin",
      ],
      default: "customer",
      required: true,
      index: true,
    },

    // --------------------------------------------------------
    // DYNAMIC ADMIN ROLE
    // --------------------------------------------------------

    adminRole: {
      type: String,
      trim: true,
      maxlength: 100,
      default: undefined,
    },

    /**
     * Primary Role relation.
     *
     * IMPORTANT:
     * The Role document is authoritative for role definition;
     * permissions on User are the effective snapshot.
     */
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      default: null,
      index: true,
    },

    // --------------------------------------------------------
    // GRANULAR RBAC PERMISSIONS
    // --------------------------------------------------------

    permissions: {
      type: Schema.Types.Mixed,
      default: () => ({}),
      set: (value: PermissionStorageInput) =>
        normalizePermissionStorage(value),
    },

    /**
     * Access version used to detect stale authorization/session
     * state. Incremented automatically whenever authorization-
     * relevant user fields change.
     */
    accessVersion: {
      type: Number,
      default: 1,
      min: 1,
      required: true,
    },

    permissionsUpdatedAt: {
      type: Date,
      default: null,
    },

    // --------------------------------------------------------
    // ACCOUNT STATUS
    // --------------------------------------------------------

    status: {
      type: String,
      enum: [
        "active",
        "suspended",
        "removed",
      ],
      default: "active",
      required: true,
      index: true,
    },

    /** Existing compatibility flag used throughout StudyStow. */
    active: {
      type: Boolean,
      default: true,
      required: true,
      index: true,
    },

    // --------------------------------------------------------
    // SECURITY / LOGIN TELEMETRY
    // --------------------------------------------------------

    lastLoginAt: {
      type: Date,
      default: null,
    },

    lastLoginIp: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },

    lastLoginUserAgent: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },

    // --------------------------------------------------------
    // INVITATION / OWNERSHIP
    // --------------------------------------------------------

    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    invitationToken: {
      type: String,
      default: undefined,
      select: false,
      maxlength: 512,
    },

    invitationExpires: {
      type: Date,
      default: undefined,
      select: false,
      index: true,
    },

    // --------------------------------------------------------
    // PASSWORD RESET
    // --------------------------------------------------------

    resetPasswordToken: {
      type: String,
      default: undefined,
      select: false,
      maxlength: 512,
    },

    resetPasswordExpires: {
      type: Date,
      default: undefined,
      select: false,
      index: true,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

// ============================================================
// INDEXES
// ============================================================

UserSchema.index({
  role: 1,
  active: 1,
});

UserSchema.index({
  adminRole: 1,
  status: 1,
});

UserSchema.index({
  roleId: 1,
  status: 1,
});

UserSchema.index({
  status: 1,
  createdAt: -1,
});

UserSchema.index({
  invitedBy: 1,
  createdAt: -1,
});

UserSchema.index({
  accessVersion: 1,
});

UserSchema.index({
  createdAt: -1,
});

// ============================================================
// VIRTUALS
// ============================================================

UserSchema.virtual("isAdminAccount").get(function (this: IUser) {
  return (
    this.role === "admin" ||
    this.role === "owner" ||
    this.role === "super_admin"
  );
});

UserSchema.virtual("isOwnerAccount").get(function (this: IUser) {
  return isUserOwnerAccount(this);
});

UserSchema.virtual("hasUsableAdminAccess").get(function (this: IUser) {
  return (
    (this.role === "admin" ||
      this.role === "owner" ||
      this.role === "super_admin") &&
    this.active === true &&
    this.status === "active"
  );
});

// ============================================================
// PRE-VALIDATE
// ============================================================

UserSchema.pre("validate", function () {
  // Canonical email normalization.
  if (typeof this.email === "string") {
    this.email = this.email.trim().toLowerCase();
  }

  // Admin role normalization.
  if (typeof this.adminRole === "string") {
    const cleaned = this.adminRole.trim().toLowerCase();
    this.adminRole = cleaned || undefined;
  }

  // Permissions are always canonicalized before validation.
  this.permissions = normalizePermissionStorage(this.permissions);
});

// ============================================================
// PRE-SAVE SECURITY VERSIONING
// ============================================================

UserSchema.pre("save", function () {
  const authorizationChanged =
    this.isNew ||
    this.isModified("role") ||
    this.isModified("adminRole") ||
    this.isModified("roleId") ||
    this.isModified("permissions") ||
    this.isModified("status") ||
    this.isModified("active");

  if (!authorizationChanged) {
    return;
  }

  const currentVersion =
    Number(this.accessVersion || 1);

  // Keep version monotonic and always >= 1.
  this.accessVersion = Math.max(
    currentVersion + (this.isNew ? 0 : 1),
    1
  );

  this.permissionsUpdatedAt = new Date();

  // A suspended/removed account must never remain active.
  if (this.status === "suspended" || this.status === "removed") {
    this.active = false;
  }
});

// ============================================================
// SAFE JSON TRANSFORM
// ============================================================

UserSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    // Never expose secret authentication material through JSON.
    const json = ret as unknown as Record<string, unknown>;
    delete json.password;
    delete json.resetPasswordToken;
    delete json.resetPasswordExpires;
    delete json.invitationToken;
    delete json.invitationExpires;

    return ret;
  },
});

UserSchema.set("toObject", {
  virtuals: true,
});

// ============================================================
// MODEL
// ============================================================

/**
 * Clear stale cached model definitions during Next.js hot reload.
 */
const User: Model<IUser> =
  mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);

export type UserDocument = HydratedDocument<IUser>;

export default User;
