import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

export interface ICoupon extends Document {
  code: string;
  description?: string;

  type: "percentage" | "fixed";
  value: number;

  minOrderAmount: number;
  maxDiscountAmount?: number;

  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;

  startDate: Date;
  endDate: Date;

  active: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    value: {
      type: Number,
      required: true,
      min: 0,
    },

    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxDiscountAmount: {
      type: Number,
      min: 0,
    },

    usageLimit: {
      type: Number,
      min: 1,
    },

    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    perUserLimit: {
      type: Number,
      min: 1,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ active: 1, startDate: 1, endDate: 1 });
CouponSchema.index({ createdAt: -1 });

// Validation
CouponSchema.pre("validate", function () {
  if (this.type === "percentage" && this.value > 100) {
    throw new Error("Percentage discount cannot be greater than 100");
  }

  if (this.endDate <= this.startDate) {
    throw new Error("End date must be after start date");
  }

  if (
    this.usageLimit !== undefined &&
    this.usageCount > this.usageLimit
  ) {
    throw new Error("Usage count cannot exceed usage limit");
  }
});

const Coupon: Model<ICoupon> =
  mongoose.models.Coupon ||
  mongoose.model<ICoupon>("Coupon", CouponSchema);

export default Coupon;
