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


// ============================================================
// USER INTERFACE
// ============================================================

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;

  phone?: string;

  role: UserRole;
  active: boolean;

  // Password reset fields
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

    // Password is hidden by default.
    // auth.ts uses .select("+password") when login is required.
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


    // --------------------------------------------------------
    // ROLE
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
    // ACCOUNT STATUS
    // --------------------------------------------------------

    active: {
      type: Boolean,
      default: true,
      required: true,
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
  email: 1,
});

UserSchema.index({
  role: 1,
  active: 1,
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
