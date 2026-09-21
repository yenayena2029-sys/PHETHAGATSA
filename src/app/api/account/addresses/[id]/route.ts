import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Address from "@/models/Address";
import { getAuthUser } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const data = await req.json();

    if (data.isDefault) {
      await Address.updateMany({ userId: user._id, _id: { $ne: id } }, { isDefault: false });
    }

    const address = await Address.findOneAndUpdate(
      { _id: id, userId: user._id },
      data,
      { new: true }
    );
    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }
    return NextResponse.json(address, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const address = await Address.findOneAndDelete({ _id: id, userId: user._id });
    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Address deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete address" }, { status: 500 });
  }
}
