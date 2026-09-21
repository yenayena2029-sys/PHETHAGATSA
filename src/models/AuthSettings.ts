import mongoose, { Schema, model, models } from "mongoose";

const AuthSettingsSchema = new Schema(
  {
    enableEmail: { type: Boolean, default: true },
    enablePhone: { type: Boolean, default: false },
    enableGoogle: { type: Boolean, default: false },
    enableFacebook: { type: Boolean, default: false },
    enableApple: { type: Boolean, default: false },
    firebaseConfig: { type: String, default: "" },
  },
  { timestamps: true }
);

const AuthSettings = models.AuthSettings || model("AuthSettings", AuthSettingsSchema);
export default AuthSettings;
