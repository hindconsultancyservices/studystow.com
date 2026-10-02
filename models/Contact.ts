import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

export type ContactStatus =
  | "new"
  | "contacted"
  | "in-progress"
  | "completed";

export interface IContact extends Document {
  name: string;
  email: string;
  phone: string;
  subject: string;
  orderNumber: string;
  message: string;
  status: ContactStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: 30,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },

    orderNumber: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
      index: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "in-progress",
        "completed",
      ],
      default: "new",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Useful indexes for admin contact search/listing.
 */

ContactSchema.index({
  createdAt: -1,
});

ContactSchema.index({
  status: 1,
  createdAt: -1,
});

ContactSchema.index({
  email: 1,
  createdAt: -1,
});

/*
 * Prevent Mongoose model recompilation
 * during Next.js development / hot reload.
 */

const Contact: Model<IContact> =
  mongoose.models.Contact ||
  mongoose.model<IContact>(
    "Contact",
    ContactSchema
  );

export default Contact;