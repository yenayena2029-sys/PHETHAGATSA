import mongoose, { Document, Schema } from "mongoose";

export interface IEmailSettings extends Document {
  mailMethod: "smtp" | "sendmail";
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  fromName: string;
  encryption: "none" | "ssl" | "tls";
  welcomeEmailTemplate: string;
  orderConfirmationTemplate: string;
  orderProcessingTemplate: string;
  orderShippedTemplate: string;
  orderDeliveredTemplate: string;
  orderCancelledTemplate: string;
  passwordResetTemplate: string;
}

const emailSettingsSchema = new Schema<IEmailSettings>(
  {
    mailMethod: { type: String, enum: ["smtp", "sendmail"], default: "smtp" },
    smtpHost: { type: String, default: "" },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: "" },
    smtpPass: { type: String, default: "" },
    fromEmail: { type: String, default: "noreply@snapshop.com" },
    fromName: { type: String, default: "SnapShop" },
    encryption: { type: String, enum: ["none", "ssl", "tls"], default: "tls" },
    welcomeEmailTemplate: { type: String, default: "" },
    orderConfirmationTemplate: { type: String, default: "" },
    orderProcessingTemplate: { type: String, default: "" },
    orderShippedTemplate: { type: String, default: "" },
    orderDeliveredTemplate: { type: String, default: "" },
    orderCancelledTemplate: { type: String, default: "" },
    passwordResetTemplate: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.EmailSettings || mongoose.model<IEmailSettings>("EmailSettings", emailSettingsSchema);
