import mongoose, { Schema, model, models } from "mongoose";

const TaxSettingsSchema = new Schema(
  {
    vatRate: { type: Number, default: 20 },
  },
  { timestamps: true }
);

const TaxSettings = models.TaxSettings || model("TaxSettings", TaxSettingsSchema);
export default TaxSettings;
