import mongoose, { Schema, model, models } from "mongoose";

const ColorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String, required: true, trim: true }, // HEX color code e.g. #ef4444
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Color = models.Color || model("Color", ColorSchema);
export default Color;
