import mongoose, { Schema, model, models } from "mongoose";

const SizeSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true }, // e.g. Apparel, Footwear
  },
  { timestamps: true }
);

const Size = models.Size || model("Size", SizeSchema);
export default Size;
