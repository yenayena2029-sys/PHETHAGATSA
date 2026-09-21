import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Collection from "@/models/Collection";
import Brand from "@/models/Brand";
import Size from "@/models/Size";
import Color from "@/models/Color";
import ProductTemplate from "@/models/ProductTemplate";
import GeneralSettings from "@/models/GeneralSettings";
import ThemeSettings from "@/models/ThemeSettings";
import LanguageSettings from "@/models/LanguageSettings";
import CurrencySettings from "@/models/CurrencySettings";
import TaxSettings from "@/models/TaxSettings";
import PaymentSettings from "@/models/PaymentSettings";
import StorageSettings from "@/models/StorageSettings";
import MobileSettings from "@/models/MobileSettings";
import { ensureDefaultStorefrontTranslations } from "@/lib/translationSeed";
import { southAfricaSeed } from "@/lib/southAfricaSeed";

export async function GET() {
  try {
    await dbConnect();

    await Promise.all([
      Category.deleteMany({}), Product.deleteMany({}), Collection.deleteMany({}),
      Brand.deleteMany({}), Size.deleteMany({}), Color.deleteMany({}),
      ProductTemplate.deleteMany({}),
    ]);

    const seededCategories = await Category.insertMany(southAfricaSeed.categories);
    const seededCollections = await Collection.insertMany(southAfricaSeed.collections);
    const seededBrands = await Brand.insertMany(southAfricaSeed.brands);
    const seededSizes = await Size.insertMany(southAfricaSeed.sizes);
    const seededColors = await Color.insertMany(southAfricaSeed.colors);
    const seededTemplates = await ProductTemplate.insertMany(southAfricaSeed.templates);
    const seededProducts = await Product.insertMany(southAfricaSeed.products);

    // Settings are updated on every local seed so an existing database gets the SA defaults too.
    await GeneralSettings.findOneAndUpdate({}, {
      $set: southAfricaSeed.settings.general,
    }, { upsert: true, setDefaultsOnInsert: true });
    await Promise.all([
      ThemeSettings.findOneAndUpdate({}, {}, { upsert: true, setDefaultsOnInsert: true }),
      LanguageSettings.findOneAndUpdate({}, {}, { upsert: true, setDefaultsOnInsert: true }),
      CurrencySettings.findOneAndUpdate({}, { $set: southAfricaSeed.settings.currency }, { upsert: true, setDefaultsOnInsert: true }),
      TaxSettings.findOneAndUpdate({}, {}, { upsert: true, setDefaultsOnInsert: true }),
      PaymentSettings.findOneAndUpdate({}, {}, { upsert: true, setDefaultsOnInsert: true }),
      StorageSettings.findOneAndUpdate({}, {}, { upsert: true, setDefaultsOnInsert: true }),
      MobileSettings.findOneAndUpdate({}, {}, { upsert: true, setDefaultsOnInsert: true }),
    ]);

    const translationSeed = await ensureDefaultStorefrontTranslations();
    return NextResponse.json({
      message: "South African wellness catalogue seeded successfully!",
      categoriesCount: seededCategories.length,
      collectionsCount: seededCollections.length,
      brandsCount: seededBrands.length,
      sizesCount: seededSizes.length,
      colorsCount: seededColors.length,
      templatesCount: seededTemplates.length,
      productsCount: seededProducts.length,
      translationsSeeded: translationSeed.insertedCount > 0,
      translationsInserted: translationSeed.insertedCount,
    });
  } catch (error: unknown) {
    console.error("Seeding error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to seed database",
    }, { status: 500 });
  }
}
