import mongoose, { Schema, model, models } from "mongoose";

const BundleSchema = new Schema(
  {
    name: { type: String, required: true },
    discount: { type: Number, required: true },
    itemsCount: { type: Number, default: 2 },
    status: { type: String, enum: ["Active", "Draft"], default: "Active" },
    price: { type: Number, default: 0 },
  },
  { timestamps: true }
);

delete models.Bundle;
const Bundle = models.Bundle || model("Bundle", BundleSchema);
export default Bundle;
