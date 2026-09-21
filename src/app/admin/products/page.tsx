import React from "react";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getSettings } from "@/lib/settings";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await dbConnect();
  
  const products = await Product.find().sort({ createdAt: -1 });
  const categories = await Category.find().sort({ name: 1 });
  const settings = await getSettings();

  return (
    <ProductsClient
      initialProducts={JSON.parse(JSON.stringify(products))}
      categories={JSON.parse(JSON.stringify(categories))}
      currency={settings.currency}
    />
  );
}
