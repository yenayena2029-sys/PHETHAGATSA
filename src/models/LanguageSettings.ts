import mongoose, { Schema, model, models } from "mongoose";

const LanguageItemSchema = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  nativeName: { type: String, required: true },
  flag: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false }
});

const LanguageSettingsSchema = new Schema(
  {
    defaultLanguage: { type: String, default: "en" },
    languages: {
      type: [LanguageItemSchema],
      default: [
        {
          code: "en",
          name: "English",
          nativeName: "English",
          flag: "/images/flags/us.svg",
          isActive: true,
          isDefault: true
        }
      ]
    }
  },
  { timestamps: true }
);

const LanguageSettings = models.LanguageSettings || model("LanguageSettings", LanguageSettingsSchema);
export default LanguageSettings;
