import mongoose, { Schema, model, models } from "mongoose";

const OrderSchema = new Schema(
  {
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String },
    },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        size: { type: String },
        color: { type: String },
        image: { type: String },
      },
    ],
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    promoCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      default: "COD",
    },
    isAdminSeen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

delete models.Order;
const Order = models.Order || model("Order", OrderSchema);
export default Order;
