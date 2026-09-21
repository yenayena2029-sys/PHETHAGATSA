import mongoose, { Schema, model, models } from "mongoose";

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    discountValue: { type: Number, required: true },
    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

if (models.Coupon) {
  delete (models as any).Coupon;
}
const Coupon = model("Coupon", CouponSchema);
export default Coupon;
