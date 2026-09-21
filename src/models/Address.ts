import mongoose, { Schema, model, models } from "mongoose";

const AddressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    label: { type: String, default: "Home" },
    fullName: { type: String, default: "" },
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zip: { type: String, default: "" },
    country: { type: String, default: "" },
    phone: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Address = models.Address || model("Address", AddressSchema);
export default Address;
