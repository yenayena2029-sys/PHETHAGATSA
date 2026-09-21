import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import { isAdmin } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 500 });
  }
}
