import mongoose, { Schema, model, models } from "mongoose";

const AiSettingsSchema = new Schema(
  {
    activeProvider: { type: String, default: "gemini" }, // "openai" | "groq" | "gemini"
    openaiKey: { type: String, default: "" },
    groqKey: { type: String, default: "" },
    geminiKey: { type: String, default: "" },
  },
  { timestamps: true }
);

const AiSettings = models.AiSettings || model("AiSettings", AiSettingsSchema);
export default AiSettings;
