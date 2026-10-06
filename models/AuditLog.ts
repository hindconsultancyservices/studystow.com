import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

export type AuditLogResult =
  | "success"
  | "failed";

export interface IAuditLog extends Document {
  actor?: Types.ObjectId | null;

  action: string;

  resource: string;

  resourceId?: string | null;

  metadata: Record<string, any>;

  ipAddress?: string;

  userAgent?: string;

  result: AuditLogResult;

  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema =
  new Schema<IAuditLog>(
    {
      actor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true,
      },

      action: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
        index: true,
      },

      resource: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        index: true,
      },

      resourceId: {
        type: String,
        trim: true,
        default: "",
        maxlength: 150,
        index: true,
      },

      metadata: {
        type: Schema.Types.Mixed,
        default: {},
      },

      ipAddress: {
        type: String,
        trim: true,
        default: "",
        maxlength: 100,
      },

      userAgent: {
        type: String,
        trim: true,
        default: "",
        maxlength: 1000,
      },

      result: {
        type: String,
        enum: ["success", "failed"],
        default: "success",
        index: true,
      },
    },
    {
      timestamps: true,
    }
  );

/**
 * Recent logs for an actor.
 */
AuditLogSchema.index({
  actor: 1,
  createdAt: -1,
});

/**
 * Filter logs by resource.
 */
AuditLogSchema.index({
  resource: 1,
  createdAt: -1,
});

/**
 * Filter logs by action.
 */
AuditLogSchema.index({
  action: 1,
  createdAt: -1,
});

/**
 * Filter successful/failed operations.
 */
AuditLogSchema.index({
  result: 1,
  createdAt: -1,
});

/**
 * Main admin audit-log listing query.
 */
AuditLogSchema.index({
  createdAt: -1,
});

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>(
    "AuditLog",
    AuditLogSchema
  );

export default AuditLog;