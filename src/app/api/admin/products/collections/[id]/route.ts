import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import Collection from "@/models/Collection";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();
    const data = await req.json();

    const collection = await Collection.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    return NextResponse.json(collection, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update collection" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const collection = await Collection.findByIdAndDelete(id);
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Collection deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete collection" }, { status: 500 });
  }
}
