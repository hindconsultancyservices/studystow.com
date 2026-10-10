
import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

export interface IRole extends Document {
  name: string;
  slug: string;
  description: string;
  permissions: Record<string, Record<string, boolean>>;
  isSystem: boolean;
  isArchived: boolean;
  archivedAt?: Date | null;
  createdBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    permissions: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isSystem: {
      type: Boolean,
      default: false,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Only active roles must have unique slugs.
// Archived roles can share their slug with a new active role.
RoleSchema.index(
  { slug: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isArchived: false,
    },
  }
);

RoleSchema.index({ name: 1 });

RoleSchema.index({
  isSystem: 1,
  createdAt: -1,
});

RoleSchema.index({
  isArchived: 1,
  createdAt: -1,
});

const Role: Model<IRole> =
  mongoose.models.Role ||
  mongoose.model<IRole>("Role", RoleSchema);

export default Role;