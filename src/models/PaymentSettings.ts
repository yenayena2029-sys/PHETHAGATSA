import mongoose, { Schema, model, models } from "mongoose";

const PaymentSettingsSchema = new Schema(
  {
    enableCod: { type: Boolean, default: true },
    
    enableStripe: { type: Boolean, default: true },
    stripeMode: { type: String, default: "sandbox" },
    stripePubKey: { type: String, default: "pk_test_mock_keys_12345" },
    stripeSecretKey: { type: String, default: "sk_test_mock_keys_54321" },

    enableRazorpay: { type: Boolean, default: false },
    razorpayMode: { type: String, default: "sandbox" },
    razorpayKeyId: { type: String, default: "rzp_test_mock_keys_123" },
    razorpayKeySecret: { type: String, default: "rzp_sec_mock_keys_456" },

    enablePaypal: { type: Boolean, default: false },
    paypalMode: { type: String, default: "sandbox" },
    paypalClientId: { type: String, default: "paypal_client_mock_123" },
    paypalClientSecret: { type: String, default: "paypal_secret_mock_456" },

    codLogo: { type: String, default: "" },
    stripeLogo: { type: String, default: "" },
    razorpayLogo: { type: String, default: "" },
    paypalLogo: { type: String, default: "" },
  },
  { timestamps: true }
);

if (models.PaymentSettings) {
  delete (models as any).PaymentSettings;
}
const PaymentSettings = model("PaymentSettings", PaymentSettingsSchema);
export default PaymentSettings;
