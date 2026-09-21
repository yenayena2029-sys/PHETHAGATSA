import mongoose, { Schema, model, models } from "mongoose";

const CollectionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Collection = models.Collection || model("Collection", CollectionSchema);
export default Collection;
