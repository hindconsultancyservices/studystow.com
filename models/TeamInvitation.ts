import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

export type TeamInvitationStatus =
  | "pending"
  | "accepted"
  | "sent"
  | "expired"
  | "cancelled";

export interface ITeamInvitation extends Document {
  email: string;
  name: string;

  role: Types.ObjectId;
  roleId: Types.ObjectId;

  permissions: Record<
    string,
    Record<string, boolean>
  >;

  tokenHash: string;

  expiresAt: Date;

  invitedBy: Types.ObjectId;

  status: TeamInvitationStatus;

  acceptedAt?: Date | null;

  passwordSetAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const TeamInvitationSchema =
  new Schema<ITeamInvitation>(
    {
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 254,
        index: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      role: {
        type: Schema.Types.ObjectId,
        ref: "Role",
        required: true,
      },

      roleId: {
        type: Schema.Types.ObjectId,
        ref: "Role",
        required: true,
      },

      permissions: {
        type: Schema.Types.Mixed,
        default: {},
      },

      tokenHash: {
        type: String,
        required: true,
        unique: true,
        index: true,
        select: false,
      },

      expiresAt: {
        type: Date,
        required: true,
        index: true,
      },

      invitedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "sent",
          "accepted",
          "expired",
          "cancelled",
        ],
        default: "pending",
        index: true,
      },

      acceptedAt: {
        type: Date,
        default: null,
      },

      passwordSetAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    },
  );

/**
 * Find invitations by email and status.
 */
TeamInvitationSchema.index({
  email: 1,
  status: 1,
  createdAt: -1,
});

/**
 * Find invitations created by an admin.
 */
TeamInvitationSchema.index({
  invitedBy: 1,
  createdAt: -1,
});

/**
 * Find expired invitations efficiently.
 */
TeamInvitationSchema.index({
  expiresAt: 1,
});

/**
 * Prevent more than one pending invitation
 * for the same email.
 */
TeamInvitationSchema.index(
  {
    email: 1,
    status: 1,
  },
  {
    partialFilterExpression: {
      status: "pending",
    },
  },
);

const TeamInvitation: Model<ITeamInvitation> =
  mongoose.models.TeamInvitation ||
  mongoose.model<ITeamInvitation>(
    "TeamInvitation",
    TeamInvitationSchema,
  );

export default TeamInvitation;
