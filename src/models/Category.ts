import mongoose, { Schema, model, models } from "mongoose";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
  },
  { timestamps: true }
);

const Category = models.Category || model("Category", CategorySchema);
export default Category;
