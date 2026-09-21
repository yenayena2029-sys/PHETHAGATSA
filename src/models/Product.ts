import mongoose, { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    images: [{ type: String, required: true }],
    category: { type: String, required: true },
    brand: { type: String, default: "SnapShop" },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    stock: { type: Number, required: true, default: 0 },
    ratings: { type: Number, default: 5 },
    reviewsCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    reviews: [ReviewSchema],
  },
  { timestamps: true }
);

const Product = models.Product || model("Product", ProductSchema);
export default Product;
