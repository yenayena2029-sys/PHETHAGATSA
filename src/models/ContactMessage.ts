import mongoose, { Schema, model, models } from "mongoose";

const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ContactMessage = models.ContactMessage || model("ContactMessage", ContactMessageSchema);
export default ContactMessage;
