import mongoose, { Schema, model, models } from "mongoose";

const CustomPageSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    content: { type: String, required: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

if (models.CustomPage) {
  delete (models as any).CustomPage;
}
const CustomPage = model("CustomPage", CustomPageSchema);
export default CustomPage;
