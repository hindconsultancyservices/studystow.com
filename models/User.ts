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

export type AdminRole =
  | "owner"
  | "super_admin"
  | "manager"
  | "staff"
  | "custom";

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

  // Admin RBAC
  adminRole?: AdminRole;

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

    adminRole: {
      type: String,
      enum: [
        "owner",
        "super_admin",
        "manager",
        "staff",
        "custom",
      ],
      default: undefined,
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