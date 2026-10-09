
import mongoose, { Schema, Model } from "mongoose";

export type ExpenseStatus =
  | "pending"
  | "approved"
  | "paid"
  | "rejected";

export type ExpensePriority =
  | "normal"
  | "high"
  | "urgent";

export interface IExpense {
  title: string;
  category: string;
  vendor?: string;
  paymentMethod?: string;
  date: Date;
  amount: number;
  status: ExpenseStatus;
  priority: ExpensePriority;
  reference?: string;
  notes?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    vendor: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    paymentMethod: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "paid", "rejected"],
      default: "pending",
      required: true,
    },
    priority: {
      type: String,
      enum: ["normal", "high", "urgent"],
      default: "normal",
      required: true,
    },
    reference: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ status: 1, date: -1 });
ExpenseSchema.index({ category: 1 });

const Expense: Model<IExpense> =
  (mongoose.models.Expense as Model<IExpense>) ||
  mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;