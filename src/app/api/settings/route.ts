export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
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

export async function GET() {
  try {
    const settings = await getSettings();
    
    // Filter sensitive info for non-admins
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      delete settings.stripeSecretKey;
      delete settings.paypalClientSecret;
      delete settings.razorpayKeySecret;
      delete settings.doSecret;
      delete settings.s3Secret;
      delete settings.gcsSecret;
      delete settings.b2Key;
      delete settings.openaiKey;
      delete settings.groqKey;
      delete settings.geminiKey;
      delete settings.smtpPass;
      delete settings.apiAccessKey;
    }
    
    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const data = await req.json();

    // Map fields to models
    const generalFields = ["storeName", "storeEmail", "websiteLink", "logoUrl", "faviconUrl", "currency", "shippingCost", "promoCode", "promoDiscount", "heroTitle", "heroSubtitle", "heroImageUrl", "heroCountdownDate", "storeCountry", "activeZones", "productUrlFormat"];
    const aiFields = ["activeProvider", "openaiKey", "groqKey", "geminiKey"];
    const themeFields = ["selectedTheme", "primaryColor"];
    const languageFields = ["defaultLanguage", "languages"];
    const currencyFields = ["currency", "currencyPos"];
    const taxFields = ["vatRate"];
    const paymentFields = [
      "enableCod", "enableStripe", "stripeMode", "stripePubKey", "stripeSecretKey",
      "enableRazorpay", "razorpayMode", "razorpayKeyId", "razorpayKeySecret",
      "enablePaypal", "paypalMode", "paypalClientId", "paypalClientSecret",
      "codLogo", "stripeLogo", "razorpayLogo", "paypalLogo"
    ];
    const storageFields = [
      "activeStorageProvider", "doEndpoint", "doRegion", "doKey", "doSecret", "doBucket",
      "s3Bucket", "s3Region", "s3Key", "s3Secret", "gcsBucket", "gcsKey", "gcsSecret",
      "b2Bucket", "b2Endpoint", "b2KeyId", "b2Key"
    ];
    const mobileFields = [
      "mobileAppName", "webViewUrl", "privacyPolicyLink", "termsOfServiceLink", "rateUsLink",
      "forceUpdate", "updateLink", "targetVersionCode", "enableGooglePlay", "apiBaseUrl",
      "apiAccessKey", "adsProvider", "admobAppId", "bannerAdEnabled", "bannerAdUnitId",
      "interstitialAdEnabled", "interstitialAdUnitId", "rewardedAdEnabled", "rewardedAdUnitId"
    ];
    const authFields = ["enableEmail", "enablePhone", "enableGoogle", "enableFacebook", "enableApple", "firebaseConfig"];
    const emailFields = ["mailMethod", "smtpHost", "smtpPort", "smtpUser", "smtpPass", "fromEmail", "fromName", "encryption", "welcomeEmailTemplate", "orderConfirmationTemplate", "orderProcessingTemplate", "orderShippedTemplate", "orderDeliveredTemplate", "orderCancelledTemplate", "passwordResetTemplate"];

    // Helper to filter object
    const filterObject = (fields: string[]) => {
      const obj: any = {};
      fields.forEach(f => {
        if (f in data) obj[f] = data[f];
      });
      return obj;
    };

    const updates = [];

    const generalData = filterObject(generalFields);
    if (Object.keys(generalData).length > 0) {
      updates.push(GeneralSettings.findOneAndUpdate({}, generalData, { upsert: true, returnDocument: 'after', strict: false }));
    }

    const themeData = filterObject(themeFields);
    if (Object.keys(themeData).length > 0) {
      updates.push(ThemeSettings.findOneAndUpdate({}, themeData, { upsert: true, returnDocument: 'after' }));
    }

    const languageData = filterObject(languageFields);
    if (Object.keys(languageData).length > 0) {
      updates.push(LanguageSettings.findOneAndUpdate({}, languageData, { upsert: true, returnDocument: 'after' }));
    }

    const currencyData = filterObject(currencyFields);
    if (Object.keys(currencyData).length > 0) {
      updates.push(CurrencySettings.findOneAndUpdate({}, currencyData, { upsert: true, returnDocument: 'after' }));
    }

    const taxData = filterObject(taxFields);
    if (Object.keys(taxData).length > 0) {
      updates.push(TaxSettings.findOneAndUpdate({}, taxData, { upsert: true, returnDocument: 'after' }));
    }

    const paymentData = filterObject(paymentFields);
    if (Object.keys(paymentData).length > 0) {
      updates.push(PaymentSettings.findOneAndUpdate({}, paymentData, { upsert: true, returnDocument: 'after' }));
    }

    const storageData = filterObject(storageFields);
    if (Object.keys(storageData).length > 0) {
      updates.push(StorageSettings.findOneAndUpdate({}, storageData, { upsert: true, returnDocument: 'after' }));
    }

    const mobileData = filterObject(mobileFields);
    if (Object.keys(mobileData).length > 0) {
      updates.push(MobileSettings.findOneAndUpdate({}, mobileData, { upsert: true, returnDocument: 'after' }));
    }

    const aiData = filterObject(aiFields);
    if (Object.keys(aiData).length > 0) {
      updates.push(AiSettings.findOneAndUpdate({}, aiData, { upsert: true, returnDocument: 'after' }));
    }

    const authData = filterObject(authFields);
    if (Object.keys(authData).length > 0) {
      updates.push(AuthSettings.findOneAndUpdate({}, authData, { upsert: true, returnDocument: 'after' }));
    }

    const emailData = filterObject(emailFields);
    if (Object.keys(emailData).length > 0) {
      updates.push(EmailSettings.findOneAndUpdate({}, emailData, { upsert: true, returnDocument: 'after' }));
    }

    await Promise.all(updates);
    const settings = await getSettings();
    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
  }
}
