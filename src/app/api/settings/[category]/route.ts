export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import GeneralSettings from "@/models/GeneralSettings";
import ThemeSettings from "@/models/ThemeSettings";
import LanguageSettings from "@/models/LanguageSettings";
import CurrencySettings from "@/models/CurrencySettings";
import TaxSettings from "@/models/TaxSettings";
import PaymentSettings from "@/models/PaymentSettings";
import StorageSettings from "@/models/StorageSettings";
import MobileSettings from "@/models/MobileSettings";
import AiSettings from "@/models/AiSettings";
import AuthSettings from "@/models/AuthSettings";
import EmailSettings from "@/models/EmailSettings";

function getModelForCategory(category: string) {
  switch (category) {
    case "general":
      return GeneralSettings;
    case "theme":
      return ThemeSettings;
    case "languages":
      return LanguageSettings;
    case "currencies":
      return CurrencySettings;
    case "tax":
      return TaxSettings;
    case "payment":
    case "gateways":
      return PaymentSettings;
    case "storage":
      return StorageSettings;
    case "mobile":
      return MobileSettings;
    case "ai":
      return AiSettings;
    case "auth":
    case "authentication":
      return AuthSettings;
    case "email":
      return EmailSettings;
    default:
      return null;
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ category: string }> }) {
  try {
    await dbConnect();
    const { category } = await params;
    const Model = getModelForCategory(category) as any;
    if (!Model) {
      return NextResponse.json({ error: "Invalid settings category" }, { status: 400 });
    }

    let settings = await Model.findOne();
    if (!settings) {
      settings = await Model.findOneAndUpdate({}, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ category: string }> }) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const { category } = await params;
    const Model = getModelForCategory(category) as any;
    if (!Model) {
      return NextResponse.json({ error: "Invalid settings category" }, { status: 400 });
    }

    const data = await req.json();

    let settings = await Model.findOne();
    if (!settings) {
      settings = await Model.create(data);
    } else {
      settings = await Model.findByIdAndUpdate(settings._id, data, { returnDocument: 'after', runValidators: true });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
  }
}
