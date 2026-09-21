import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({
      preferredCurrency: user.preferredCurrency || "USD",
      theme: user.theme || "light",
      newsletter: user.newsletter ?? true,
      orderUpdates: user.orderUpdates ?? true,
      promotionalOffers: user.promotionalOffers ?? false,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch preferences" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await req.json();
    const updated = await User.findByIdAndUpdate(
      user._id,
      { $set: { 
          preferredCurrency: data.preferredCurrency, 
          theme: data.theme,
          newsletter: data.newsletter,
          orderUpdates: data.orderUpdates,
          promotionalOffers: data.promotionalOffers
        } 
      },
      { new: true }
    ).select("-password");
    return NextResponse.json({
      preferredCurrency: updated.preferredCurrency || "USD",
      theme: updated.theme || "light",
      newsletter: updated.newsletter ?? true,
      orderUpdates: updated.orderUpdates ?? true,
      promotionalOffers: updated.promotionalOffers ?? false,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save preferences" }, { status: 500 });
  }
}
