import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

export type PageStatus = "published" | "draft";

export type PageType =
  | "homepage"
  | "static"
  | "legal"
  | "policy"
  | "support"
  | "custom";

export interface IPage extends Document {
  title: string;
  slug: string;
  type: PageType;
  content: string;

  status: PageStatus;

  seoTitle?: string;
  seoDescription?: string;
  noIndex: boolean;

  author?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
    },

    type: {
      type: String,
      enum: [
        "homepage",
        "static",
        "legal",
        "policy",
        "support",
        "custom",
      ],
      default: "custom",
      required: true,
    },

    content: {
      type: String,
      default: "",
      maxlength: 50000,
    },

    status: {
      type: String,
      enum: ["published", "draft"],
      default: "draft",
      required: true,
      index: true,
    },

    seoTitle: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    seoDescription: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    noIndex: {
      type: Boolean,
      default: false,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

PageSchema.index({
  status: 1,
  updatedAt: -1,
});

PageSchema.index({
  type: 1,
  status: 1,
});

PageSchema.index({
  title: 1,
});

const Page: Model<IPage> =
  mongoose.models.Page ||
  mongoose.model<IPage>("Page", PageSchema);

export default Page;