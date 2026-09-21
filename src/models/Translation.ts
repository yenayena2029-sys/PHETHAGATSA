import mongoose, { Schema, model, models } from "mongoose";

const TranslationSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    translations: {
      type: Map,
      of: String,
      default: {}
    }
  },
  { timestamps: true }
);

const Translation = models.Translation || model("Translation", TranslationSchema);
export default Translation;
