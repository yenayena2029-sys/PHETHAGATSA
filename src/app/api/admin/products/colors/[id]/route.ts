import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import Color from "@/models/Color";

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

    const color = await Color.findByIdAndDelete(id);
    if (!color) {
      return NextResponse.json({ error: "Color not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Color deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete color" }, { status: 500 });
  }
}
