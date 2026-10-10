import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

import "./Book";

export interface IReview extends Document {
  book: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;

  rating: number;
  title?: string;
  comment: string;

  status: "pending" | "approved" | "rejected";

  verifiedPurchase: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    book: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number between 1 and 5",
      },
    },

    title: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 3000,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
      index: true,
    },

    verifiedPurchase: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * One user can submit only one review
 * for the same book.
 */
ReviewSchema.index(
  { book: 1, user: 1 },
  { unique: true }
);

/*
 * Useful for admin review listing.
 */
ReviewSchema.index({
  status: 1,
  createdAt: -1,
});

/*
 * Useful for displaying approved
 * reviews of a particular book.
 */
ReviewSchema.index({
  book: 1,
  status: 1,
  createdAt: -1,
});

/*
 * Useful for finding reviews by user.
 */
ReviewSchema.index({
  user: 1,
  createdAt: -1,
});

const Review: Model<IReview> =
  mongoose.models.Review ||
  mongoose.model<IReview>("Review", ReviewSchema);

export default Review;