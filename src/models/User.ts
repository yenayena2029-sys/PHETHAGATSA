import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordSet: {
      type: Boolean,
      default: true,
    },
    provider: {
      type: String,
      default: "credentials",
    },
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },
    phone: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    preferredCurrency: {
      type: String,
      default: "USD",
    },
    theme: {
      type: String,
      enum: ["light", "dark", "auto"],
      default: "light",
    },
    newsletter: {
      type: Boolean,
      default: true,
    },
    orderUpdates: {
      type: Boolean,
      default: true,
    },
    promotionalOffers: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);
export default User;
