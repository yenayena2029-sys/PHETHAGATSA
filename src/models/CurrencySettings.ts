import { Schema, model, models } from "mongoose";

const CurrencySettingsSchema = new Schema(
  {
    currency: { type: String, default: "R" },
    currencyPos: { type: String, default: "before" },
  },
  { timestamps: true }
);

const CurrencySettings = models.CurrencySettings || model("CurrencySettings", CurrencySettingsSchema);
export default CurrencySettings;
