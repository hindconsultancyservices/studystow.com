import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

// ============================================================
// TYPES
// ============================================================

export type PageStatus =
  | "draft"
  | "published";


// ============================================================
// PAGE INTERFACE
// ============================================================

export interface IPage extends Document {
  title: string;
  slug: string;
  content: string;

  excerpt?: string;

  featuredImage?: string;

  metaTitle?: string;
  metaDescription?: string;

  status: PageStatus;

  featured: boolean;
  sortOrder: number;

  createdAt: Date;
  updatedAt: Date;
}


// ============================================================
// PAGE SCHEMA
// ============================================================

const PageSchema = new Schema<IPage>(
  {
    // --------------------------------------------------------
    // BASIC PAGE INFORMATION
    // --------------------------------------------------------

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
      maxlength: 120,
    },

    content: {
      type: String,
      required: true,
    },

    excerpt: {
      type: String,
      trim: true,
      maxlength: 500,
    },


    // --------------------------------------------------------
    // IMAGE
    // --------------------------------------------------------

    featuredImage: {
      type: String,
      trim: true,
    },


    // --------------------------------------------------------
    // SEO
    // --------------------------------------------------------

    metaTitle: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    metaDescription: {
      type: String,
      trim: true,
      maxlength: 500,
    },


    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    status: {
      type: String,
      enum: [
        "draft",
        "published",
      ],
      default: "draft",
      required: true,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },

  {
    timestamps: true,
  }
);


// ============================================================
// INDEXES
// ============================================================

PageSchema.index({
  status: 1,
  sortOrder: 1,
});

PageSchema.index({
  featured: 1,
  status: 1,
});

PageSchema.index({
  status: 1,
  createdAt: -1,
});


// ============================================================
// MODEL
// ============================================================

const Page: Model<IPage> =
  mongoose.models.Page ||
  mongoose.model<IPage>(
    "Page",
    PageSchema
  );

export default Page;
