import React from "react";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getSettings } from "@/lib/settings";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  await dbConnect();
  const params = await searchParams;

  const category = params.category || "all";
  const sort = params.sort || "newest";
  const minPrice = params.minPrice;
  const maxPrice = params.maxPrice;
  const isOnSale = params.isOnSale === "true";
  const isFeatured = params.isFeatured === "true";
  const size = params.size;
  const color = params.color;
  const brand = params.brand;
  const inStock = params.inStock === "true";
  const collection = params.collection;
  const search = params.search;

  // Build DB Query
  const query: any = {};

  if (search) {
    query.$or = [
      { name: { $regex: new RegExp(search, "i") } },
      { description: { $regex: new RegExp(search, "i") } },
      { brand: { $regex: new RegExp(search, "i") } }
    ];
  }

  if (category && category !== "all") {
    query.category = { $regex: new RegExp(`^${category}$`, "i") };
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (isOnSale) {
    query.isOnSale = true;
  }

  if (isFeatured) {
    query.isFeatured = true;
  }

  if (inStock) {
    query.stock = { $gt: 0 };
  }

  if (size) {
    query.sizes = { $in: size.split(",") };
  }

  if (color) {
    query.colors = { $in: color.split(",") };
  }

  if (brand) {
    query.brand = { $in: brand.split(",") };
  }

  let sortOptions: any = { createdAt: -1 };

  if (collection) {
    if (collection === "new-arrivals") {
      sortOptions = { createdAt: -1 };
    } else if (collection === "best-sellers") {
      query.ratings = { $gte: 4.5 };
    } else if (collection === "winter-clearance" || collection === "sale") {
      query.isOnSale = true;
    } else if (collection === "featured") {
      query.isFeatured = true;
    }
  }

  if (sort === "price_asc") {
    sortOptions = { price: 1 };
  } else if (sort === "price_desc") {
    sortOptions = { price: -1 };
  } else if (sort === "newest" && !collection) {
    sortOptions = { createdAt: -1 };
  }

  const products = await Product.find(query).sort(sortOptions);
  const categories = await Category.find().sort({ name: 1 });
  const settings = await getSettings();

  // Aggregate distinct filter values
  const allBrands = await Product.distinct("brand");
  const allSizes = await Product.distinct("sizes");
  const allColors = await Product.distinct("colors");

  return (
    <ShopClient
      initialProducts={JSON.parse(JSON.stringify(products))}
      categories={JSON.parse(JSON.stringify(categories))}
      currency={settings.currency || "$"}
      availableBrands={allBrands.filter(Boolean)}
      availableSizes={allSizes.filter(Boolean)}
      availableColors={allColors.filter(Boolean)}
    />
  );
}
