import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { isAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const isOnSale = searchParams.get("isOnSale");
    const isFeatured = searchParams.get("isFeatured");
    const sort = searchParams.get("sort");

    const query: any = {};

    if (category && category !== "all") {
      // Find case-insensitive or exact category slug/name
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (isOnSale === "true") {
      query.isOnSale = true;
    }

    if (isFeatured === "true") {
      query.isFeatured = true;
    }

    let sortOptions: any = { createdAt: -1 };
    if (sort === "price_asc") {
      sortOptions = { price: 1 };
    } else if (sort === "price_desc") {
      sortOptions = { price: -1 };
    } else if (sort === "newest") {
      sortOptions = { createdAt: -1 };
    }

    const products = await Product.find(query).sort(sortOptions);
    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const data = await req.json();

    const product = await Product.create(data);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
