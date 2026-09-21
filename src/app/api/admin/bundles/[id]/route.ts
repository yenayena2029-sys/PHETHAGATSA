import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Bundle from "@/models/Bundle";
import { isAdmin } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const data = await req.json();

    const updatedBundle = await Bundle.findByIdAndUpdate(id, data, { new: true });
    if (!updatedBundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBundle, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update bundle" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;

    const deletedBundle = await Bundle.findByIdAndDelete(id);
    if (!deletedBundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete bundle" }, { status: 500 });
  }
}
