import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Address from "@/models/Address";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const addresses = await Address.find({ userId: user._id }).sort({ createdAt: -1 });
    return NextResponse.json(addresses, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch addresses" }, { status: 500 });
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

    if (data.isDefault) {
      await Address.updateMany({ userId: user._id }, { isDefault: false });
    }

    const address = await Address.create({ ...data, userId: user._id });
    return NextResponse.json(address, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create address" }, { status: 500 });
  }
}
