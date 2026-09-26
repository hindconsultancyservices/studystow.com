import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

// ============================================================
// TYPES
// ============================================================

export type PaymentMethod =
  | "cod"
  | "razorpay";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";


// ============================================================
// ORDER ITEM
// ============================================================

export interface IOrderItem {
  book: mongoose.Types.ObjectId;

  title: string;
  quantity: number;
  price: number;

  image?: string;
}


// ============================================================
// ADDRESS
// ============================================================

export interface IAddress {
  name: string;
  phone: string;

  addressLine1: string;
  addressLine2?: string;

  city: string;
  state: string;
  pincode: string;
  country: string;
}


// ============================================================
// ORDER INTERFACE
// ============================================================

export interface IOrder extends Document {
  orderNumber: string;

  customer?: mongoose.Types.ObjectId;

  items: IOrderItem[];

  shippingAddress: IAddress;
  billingAddress?: IAddress;

  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;

  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}


// ============================================================
// ORDER ITEM SCHEMA
// ============================================================

const OrderItemSchema = new Schema<IOrderItem>(
  {
    book: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  }
);


// ============================================================
// ADDRESS SCHEMA
// ============================================================

const AddressSchema = new Schema<IAddress>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine1: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    addressLine2: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
      default: "India",
    },
  },
  {
    _id: false,
  }
);


// ============================================================
// ORDER SCHEMA
// ============================================================

const OrderSchema = new Schema<IOrder>(
  {
    // --------------------------------------------------------
    // ORDER NUMBER
    // --------------------------------------------------------

    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },


    // --------------------------------------------------------
    // CUSTOMER
    // --------------------------------------------------------

    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },


    // --------------------------------------------------------
    // ITEMS
    // --------------------------------------------------------

    items: {
      type: [OrderItemSchema],
      required: true,

      validate: {
        validator: function (
          items: IOrderItem[]
        ) {
          return items.length > 0;
        },

        message:
          "Order must contain at least one item",
      },
    },


    // --------------------------------------------------------
    // SHIPPING ADDRESS
    // --------------------------------------------------------

    shippingAddress: {
      type: AddressSchema,
      required: true,
    },


    // --------------------------------------------------------
    // BILLING ADDRESS
    // --------------------------------------------------------

    billingAddress: {
      type: AddressSchema,
      required: false,
    },


    // --------------------------------------------------------
    // PRICE BREAKDOWN
    // --------------------------------------------------------

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shipping: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },


    // --------------------------------------------------------
    // PAYMENT
    // --------------------------------------------------------

    paymentMethod: {
      type: String,
      enum: [
        "cod",
        "razorpay",
      ],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "pending",
      required: true,
    },


    // --------------------------------------------------------
    // ORDER STATUS
    // --------------------------------------------------------

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      required: true,
    },


    // --------------------------------------------------------
    // RAZORPAY
    // --------------------------------------------------------

    razorpayOrderId: {
      type: String,
      trim: true,
      sparse: true,
    },

    razorpayPaymentId: {
      type: String,
      trim: true,
      sparse: true,
    },

    razorpaySignature: {
      type: String,
      trim: true,
    },


    // --------------------------------------------------------
    // NOTES
    // --------------------------------------------------------

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },

  {
    timestamps: true,
  }
);


// ============================================================
// INDEXES
// ============================================================

OrderSchema.index({
  customer: 1,
  createdAt: -1,
});

OrderSchema.index({
  orderStatus: 1,
  createdAt: -1,
});

OrderSchema.index({
  paymentStatus: 1,
  createdAt: -1,
});

OrderSchema.index({
  paymentMethod: 1,
});

OrderSchema.index({
  razorpayOrderId: 1,
});

OrderSchema.index({
  razorpayPaymentId: 1,
});

OrderSchema.index({
  createdAt: -1,
});


// ============================================================
// MODEL
// ============================================================

const Order: Model<IOrder> =
  mongoose.models.Order ||
  mongoose.model<IOrder>(
    "Order",
    OrderSchema
  );

export default Order;
