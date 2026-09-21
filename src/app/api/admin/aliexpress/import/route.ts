import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import fs from "fs";
import path from "path";
import crypto from "crypto";

async function downloadImage(url: string, prefix: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${prefix}_${crypto.randomBytes(4).toString("hex")}.jpg`;
    const filepath = path.join(process.cwd(), "public", "images", "Products", filename);
    
    // Ensure dir exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filepath, buffer);
    return `/images/Products/${filename}`;
  } catch (err) {
    console.error("Failed to download image:", err);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const productId = body.productId;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    let source = "dummy";
    let realId = productId;

    if (productId.includes("_")) {
        const parts = productId.split("_");
        source = parts[0];
        realId = parts.slice(1).join("_");
    } else {
        if (isNaN(Number(productId))) realId = "1";
    }

    const result = {
      title: "",
      price: "",
      description: "",
      images: [] as string[],
      colors: [] as string[],
      sizes: [] as string[],
    };

    let rawImages = [];

    // --- API 1: DummyJSON ---
    if (source === "dummy") {
      const res = await fetch(`https://dummyjson.com/products/${realId}`);
      if (res.ok) {
        const data = await res.json();
        result.title = data.title;
        result.price = data.price.toString();
        result.description = data.description;
        rawImages = data.images && data.images.length > 0 ? data.images : [data.thumbnail];
        result.colors = ["Default"];
        result.sizes = ["S", "M", "L"];
      }
    } 
    // --- API 2: Platzi ---
    else if (source === "platzi") {
      const res = await fetch(`https://api.escuelajs.co/api/v1/products/${realId}`);
      if (res.ok) {
        const data = await res.json();
        result.title = data.title;
        result.price = data.price.toString();
        result.description = data.description;
        rawImages = data.images ? data.images.map((img: string) => img.replace(/\[|\]|"/g, '')) : [];
        result.colors = ["Standard"];
        result.sizes = ["One Size"];
      }
    }
    // --- API 3: FakeStore ---
    else if (source === "fake") {
      const res = await fetch(`https://fakestoreapi.com/products/${realId}`);
      if (res.ok) {
        const data = await res.json();
        result.title = data.title;
        result.price = data.price.toString();
        result.description = data.description;
        rawImages = [data.image];
        result.colors = ["One Color"];
        result.sizes = ["One Size"];
      }
    }
    // --- API 4: Mock Fallback ---
    else if (source === "mock") {
        result.title = `Imported Product ${realId}`;
        result.price = "39.99";
        result.description = "A premium quality product with guaranteed satisfaction.";
        rawImages = ["https://i.imgur.com/QkIa5tT.jpeg", "https://i.imgur.com/KeqG6r4.jpeg"];
        result.colors = ["Black", "White"];
        result.sizes = ["S", "M", "L", "XL"];
    }

    // Fallback if everything failed
    if (!result.title) {
        result.title = `Product ${realId}`;
        result.price = "19.99";
        result.description = "Product details could not be loaded fully.";
        rawImages = ["https://i.imgur.com/QkIa5tT.jpeg"];
    }

    // Download images locally
    for (let i = 0; i < Math.min(rawImages.length, 5); i++) {
        if (!rawImages[i]) continue;
        const localUrl = await downloadImage(rawImages[i], source);
        if (localUrl) result.images.push(localUrl);
    }

    // Fallback image if download failed
    if (result.images.length === 0) {
        result.images.push("https://i.imgur.com/QkIa5tT.jpeg");
    }

    return NextResponse.json({ product: result });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
