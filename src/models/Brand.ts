import mongoose, { Schema, model, models } from "mongoose";

const BrandSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Brand = models.Brand || model("Brand", BrandSchema);
export default Brand;
