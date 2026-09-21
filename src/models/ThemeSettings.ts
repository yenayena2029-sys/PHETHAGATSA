import mongoose, { Schema, model, models } from "mongoose";

const ThemeSettingsSchema = new Schema(
  {
    selectedTheme: { type: String, default: "light" },
    primaryColor: { type: String, default: "#d31e28" },
  },
  { timestamps: true }
);

const ThemeSettings = models.ThemeSettings || model("ThemeSettings", ThemeSettingsSchema);
export default ThemeSettings;
