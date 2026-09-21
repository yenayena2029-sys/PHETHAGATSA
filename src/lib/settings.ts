import dbConnect from "@/lib/db";
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

function isPlaceholder(value: unknown) {
  if (typeof value !== "string") return !value;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  return (
    normalized.includes("mock") ||
    normalized.includes("placeholder") ||
    normalized.includes("paypal_client") ||
    normalized.includes("paypal_secret")
  );
}

function resolveSettingValue<T>(storedValue: T, envValue?: string) {
  if (envValue && envValue.trim() && isPlaceholder(storedValue)) {
    return envValue as unknown as T;
  }
  return storedValue;
}

export async function getSettings() {
  await dbConnect();

  const [
    general,
    theme,
    language,
    currency,
    tax,
    payment,
    storage,
    mobile,
    ai,
    auth,
    email
  ] = await Promise.all([
    GeneralSettings.findOneAndUpdate({}, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
    ThemeSettings.findOneAndUpdate({}, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
    LanguageSettings.findOneAndUpdate({}, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
    CurrencySettings.findOneAndUpdate({}, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
    TaxSettings.findOneAndUpdate({}, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
    PaymentSettings.findOneAndUpdate({}, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
    StorageSettings.findOneAndUpdate({}, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
    MobileSettings.findOneAndUpdate({}, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
    AiSettings.findOneAndUpdate({}, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
    AuthSettings.findOneAndUpdate({}, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
    EmailSettings.findOneAndUpdate({}, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
  ]);

  const merged = {
    ...general.toObject(),
    ...theme.toObject(),
    ...language.toObject(),
    ...currency.toObject(),
    ...tax.toObject(),
    ...payment.toObject(),
    ...storage.toObject(),
    ...mobile.toObject(),
    ...ai.toObject(),
    ...auth.toObject(),
    ...email.toObject(),
  };

  if (merged.storeName === "Ubuntu Wellness Market") {
    merged.storeName = "PHETHAGATSA SOLUTIONS";
  }

  merged.stripePubKey = resolveSettingValue(merged.stripePubKey, process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY);
  merged.stripeSecretKey = resolveSettingValue(merged.stripeSecretKey, process.env.STRIPE_SECRET_KEY);
  merged.paypalClientId = resolveSettingValue(merged.paypalClientId, process.env.PAYPAL_CLIENT_ID);
  merged.paypalClientSecret = resolveSettingValue(merged.paypalClientSecret, process.env.PAYPAL_CLIENT_SECRET);
  merged.razorpayKeyId = resolveSettingValue(merged.razorpayKeyId, process.env.RAZORPAY_KEY_ID);
  merged.razorpayKeySecret = resolveSettingValue(merged.razorpayKeySecret, process.env.RAZORPAY_KEY_SECRET);

  return merged;
}
