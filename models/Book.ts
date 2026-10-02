import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

import Category from "./Category";

// ============================================================
// BOOK INTERFACE
// ============================================================

export interface IBook extends Document {
  title: string;
  slug: string;
  author: string;
  description?: string;

  category: mongoose.Types.ObjectId;

  price: number;
  compareAtPrice?: number;

  stock: number;
  sku: string;
  isbn?: string;

  image?: string;
  images: string[];

  publisher?: string;
  language?: string;
  pages?: number;

  featured: boolean;
  published: boolean;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// BOOK SCHEMA
// ============================================================

const BookSchema = new Schema<IBook>(
  {
    // --------------------------------------------------------
    // BASIC INFORMATION
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

    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    category: {
      type: Schema.Types.ObjectId,
      ref: Category,
      required: true,
    },

    // --------------------------------------------------------
    // PRICE
    // --------------------------------------------------------

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    compareAtPrice: {
      type: Number,
      min: 0,
    },

    // --------------------------------------------------------
    // INVENTORY
    // --------------------------------------------------------

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 100,
    },

    isbn: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    // --------------------------------------------------------
    // IMAGES
    // --------------------------------------------------------

    image: {
      type: String,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    // --------------------------------------------------------
    // PUBLICATION DETAILS
    // --------------------------------------------------------

    publisher: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    language: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "English",
    },

    pages: {
      type: Number,
      min: 1,
    },

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    featured: {
      type: Boolean,
      default: false,
    },

    published: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// INDEXES
// ============================================================

BookSchema.index({
  title: 1,
});

BookSchema.index({
  author: 1,
});

BookSchema.index({
  category: 1,
  published: 1,
});

BookSchema.index({
  featured: 1,
  published: 1,
});

BookSchema.index({
  published: 1,
  createdAt: -1,
});

BookSchema.index({
  stock: 1,
});

// ============================================================
// MODEL
// ============================================================

const Book: Model<IBook> =
  mongoose.models.Book ||
  mongoose.model<IBook>("Book", BookSchema);

export default Book;