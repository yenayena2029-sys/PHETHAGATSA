import mongoose, { Schema, model, models } from "mongoose";

const ProductTemplateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    attributes: [{ type: String }],
    usage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ProductTemplate = models.ProductTemplate || model("ProductTemplate", ProductTemplateSchema);
export default ProductTemplate;
