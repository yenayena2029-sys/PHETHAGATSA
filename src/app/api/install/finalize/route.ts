import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import GeneralSettings from "@/models/GeneralSettings";
import Category from "@/models/Category";
import Collection from "@/models/Collection";
import Brand from "@/models/Brand";
import Size from "@/models/Size";
import Color from "@/models/Color";
import ProductTemplate from "@/models/ProductTemplate";
import Product from "@/models/Product";
import Bundle from "@/models/Bundle";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { revalidatePath } from "next/cache";
import { southAfricaSeed } from "@/lib/southAfricaSeed";

export async function POST(req: Request) {
  try {
    const { storeName, websiteLink, username, email, password } = await req.json();
    
    if (!storeName || !websiteLink || !username || !email || !password) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    await dbConnect();

    // Check if an admin already exists to prevent re-installation
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return NextResponse.json({ success: false, message: "Installation already completed." }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Admin User
    const adminUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "admin",
      passwordSet: true,
    });

    // Create General Settings
    await GeneralSettings.create({
      storeName,
      websiteLink,
      storeEmail: email,
      currency: southAfricaSeed.settings.general.currency,
      storeCountry: southAfricaSeed.settings.general.storeCountry,
      activeZones: [...southAfricaSeed.settings.general.activeZones],
    });

    // --- Create Default Entries ---
    
    // (Models are now statically imported at the top)

    // Categories
    await Category.create(southAfricaSeed.categories);

    // Collections
    await Collection.create(southAfricaSeed.collections);

    // Brands
    await Brand.create(southAfricaSeed.brands);

    // Sizes
    await Size.create(southAfricaSeed.sizes);

    // Colors
    await Color.create(southAfricaSeed.colors);

    // Product Templates
    await ProductTemplate.create(southAfricaSeed.templates);
    await Product.create(southAfricaSeed.products);

    // Bundles
    await Bundle.create([
      { name: "Welcome Pack", discount: 10, itemsCount: 2, status: "Active" },
      { name: "Summer Special", discount: 20, itemsCount: 3, status: "Active" }
    ]);
    
    // ------------------------------

    // Sign JWT Token
    const jwtSecret = process.env.JWT_SECRET || "fallback_secret";
    const token = jwt.sign(
      { id: adminUser._id, role: adminUser.role },
      jwtSecret,
      { expiresIn: "7d" }
    );

    // Set cookie response
    const response = NextResponse.json({ success: true, message: "Installation completed successfully!" });
    
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    // Revalidate the root layout so it stops redirecting to /install
    revalidatePath("/", "layout");

    return response;
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Installation failed",
    }, { status: 500 });
  }
}
