import React from "react";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { getSettings } from "@/lib/settings";
import ProductDetailClient from "./ProductDetailClient";
import mongoose from "mongoose";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  await dbConnect();
  const { id } = await params;

  let product = null;

  // Try finding by ID if it is a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(id)) {
    try {
      product = await Product.findById(id);
    } catch (e) {
      // Ignore and try slug lookup
    }
  }

  // Fallback: search by slugified product name
  if (!product) {
    try {
      const products = await Product.find({});
      product = products.find((p: any) => {
        const slug = p.name
          .toString()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-")
          .replace(/[^\w\-]+/g, "")
          .replace(/\-\-+/g, "-")
          .replace(/^-+/, "")
          .replace(/-+$/, "");
        return slug === id;
      });
    } catch (e) {
      // Ignore
    }
  }

  if (!product) {
    notFound();
  }

  const settings = await getSettings();

  return (
    <ProductDetailClient
      product={JSON.parse(JSON.stringify(product))}
      currency={settings.currency}
      settings={JSON.parse(JSON.stringify(settings))}
    />
  );
}
