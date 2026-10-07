
import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

// ============================================================
// TYPES
// ============================================================

export type UserRole =
  | "customer"
  | "admin";

/*
 * Custom admin roles are created dynamically from the
 * Roles collection, so this must NOT be restricted to
 * a fixed enum.
 *
 * Examples:
 * owner
 * super_admin
 * manager
 * staff
 * khadija
 * sales_team
 * content_manager
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

  /*
   * Custom role name / slug.
   *
   * Examples:
   * "khadija"
   * "sales-team"
   * "inventory-manager"
   */
  adminRole?: AdminRole;

  /*
   * Primary relation to the Role collection.
   *
   * This should be treated as the main source of truth
   * for custom role assignment.
   */
  roleId?: mongoose.Types.ObjectId | null;

  /*
   * Snapshot / compatibility permissions.
   *
   * Keeps the user's effective permissions available
   * without requiring a Role lookup for every request.
   */
  permissions?: Record<
    string,
    Record<string, boolean>
  >;

  status: UserStatus;

  // Existing compatibility
  active: boolean;

  // Invitation / ownership
  invitedBy?: mongoose.Types.ObjectId | null;

  invitationToken?: string;
  invitationExpires?: Date;

  // Password reset
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  createdAt: Date;
  updatedAt: Date;
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
      maxlength: 15,
    },

    // --------------------------------------------------------
    // MAIN ROLE
    // --------------------------------------------------------

    /*
     * Main application role.
     *
     * Customer:
     * normal storefront user
     *
     * Admin:
     * staff/admin account using RBAC
     */
    role: {
      type: String,
      enum: [
        "customer",
        "admin",
      ],
      default: "customer",
      required: true,
    },

    // --------------------------------------------------------
    // ADMIN RBAC ROLE
    // --------------------------------------------------------

    /*
     * IMPORTANT:
     * No enum here.
     *
     * This allows dynamically-created roles such as:
     * "khadija"
     * "sales-team"
     * "content-manager"
     * "inventory-manager"
     */
    adminRole: {
      type: String,
      trim: true,
      default: undefined,
    },

    /*
     * Main relation to Role collection.
     *
     * Example:
     *
     * User.roleId
     *      ↓
     * Role._id
     *      ↓
     * "Khadija"
     */
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },

    // --------------------------------------------------------
    // GRANULAR PERMISSIONS
    // --------------------------------------------------------

    permissions: {
      type: Schema.Types.Mixed,
      default: {},
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
    },

    // Existing compatibility field
    active: {
      type: Boolean,
      default: true,
      required: true,
    },

    // --------------------------------------------------------
    // INVITATION
    // --------------------------------------------------------

    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    invitationToken: {
      type: String,
      default: undefined,
      select: false,
    },

    invitationExpires: {
      type: Date,
      default: undefined,
      select: false,
    },

    // --------------------------------------------------------
    // PASSWORD RESET
    // --------------------------------------------------------

    resetPasswordToken: {
      type: String,
      default: undefined,
      select: false,
    },

    resetPasswordExpires: {
      type: Date,
      default: undefined,
      select: false,
    },
  },
  {
    timestamps: true,
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
  createdAt: -1,
});

// ============================================================
// MODEL
// ============================================================

const User: Model<IUser> =
  mongoose.models.User ||
  mongoose.model<IUser>(
    "User",
    UserSchema
  );

export default User;
