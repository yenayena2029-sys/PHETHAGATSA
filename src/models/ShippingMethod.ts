import mongoose, { Schema, model, models } from "mongoose";

const ShippingMethodSchema = new Schema(
  {
    name: { type: String, required: true },
    cost: { type: Number, required: true, default: 0 },
    deliveryTime: { type: String, default: "3-5 business days" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

if (models.ShippingMethod) {
  delete (models as any).ShippingMethod;
}
const ShippingMethod = model("ShippingMethod", ShippingMethodSchema);
export default ShippingMethod;
