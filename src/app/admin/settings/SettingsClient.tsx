"use client";

import React, { useState, useEffect } from "react";
import { Save, Download, Upload, Check, AlertTriangle, Smartphone, Shield, Globe, Landmark, Coins, Plus, Trash2, Search, X, RefreshCw, Mail, Code } from "lucide-react";
import { ALL_LANGUAGES } from "@/lib/languagesList";
import { ALL_CURRENCIES } from "@/lib/currenciesList";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { defaultWelcomeEmail, defaultOrderConfirmationEmail, defaultOrderProcessingEmail, defaultOrderShippedEmail, defaultOrderDeliveredEmail, defaultOrderCancelledEmail, defaultPasswordResetEmail } from "@/lib/defaultEmailTemplates";

interface Settings {
  _id: string;
  storeName: string;
  storeEmail: string;
  websiteLink?: string;
  logoUrl?: string;
  faviconUrl?: string;
  currency: string;
  shippingCost: number;
  promoCode: string;
  promoDiscount: number;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl?: string;
  heroCountdownDate: string;
  productUrlFormat?: string;

  // Theme Settings
  selectedTheme?: string;
  primaryColor?: string;

  // Language Settings
  defaultLanguage?: string;
  languages?: Array<{
    code: string;
    name: string;
    nativeName: string;
    flag: string;
    isActive: boolean;
    isDefault: boolean;
  }>;

  // Currency Position
  currencyPos?: string;

  // Tax Settings
  vatRate?: number;

  // Payment Gateways Settings
  enableCod?: boolean;
  enableStripe?: boolean;
  stripeMode?: string;
  stripePubKey?: string;
  stripeSecretKey?: string;

  enableRazorpay?: boolean;
  razorpayMode?: string;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;

  enablePaypal?: boolean;
  paypalMode?: string;
  paypalClientId?: string;
  paypalClientSecret?: string;

  // Custom Logo Settings
  codLogo?: string;
  stripeLogo?: string;
  razorpayLogo?: string;
  paypalLogo?: string;

  // Storage Settings
  activeStorageProvider?: string;
  doEndpoint?: string;
  doRegion?: string;
  doKey?: string;
  doSecret?: string;
  doBucket?: string;

  s3Bucket?: string;
  s3Region?: string;
  s3Key?: string;
  s3Secret?: string;

  gcsBucket?: string;
  gcsKey?: string;
  gcsSecret?: string;

  b2Bucket?: string;
  b2Endpoint?: string;
  b2KeyId?: string;
  b2Key?: string;

  // Mobile App Settings
  mobileAppName?: string;
  webViewUrl?: string;
  privacyPolicyLink?: string;
  termsOfServiceLink?: string;
  rateUsLink?: string;
  forceUpdate?: boolean;
  updateLink?: string;
  
  // Email Settings
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  fromEmail?: string;
  fromName?: string;
  encryption?: "none" | "ssl" | "tls";
  mailMethod?: "smtp" | "sendmail";
  welcomeEmailTemplate?: string;
  orderConfirmationTemplate?: string;
  orderProcessingTemplate?: string;
  orderShippedTemplate?: string;
  orderDeliveredTemplate?: string;
  orderCancelledTemplate?: string;
  passwordResetTemplate?: string;
  targetVersionCode?: number;

  enableGooglePlay?: boolean;

  apiBaseUrl?: string;
  apiAccessKey?: string;

  adsProvider?: string;
  admobAppId?: string;
  bannerAdEnabled?: boolean;
  bannerAdUnitId?: string;
  interstitialAdEnabled?: boolean;
  interstitialAdUnitId?: string;
  rewardedAdEnabled?: boolean;
  rewardedAdUnitId?: string;

  // AI Settings
  activeProvider?: string;
  openaiKey?: string;
  groqKey?: string;
  geminiKey?: string;

  // Policies
  shippingPolicy?: string;
  returnsPolicy?: string;
  sizeGuideContent?: string;

  // Authentication Settings
  enableEmail?: boolean;
  enablePhone?: boolean;
  enableGoogle?: boolean;
  enableFacebook?: boolean;
  enableApple?: boolean;
  firebaseConfig?: string;
}

interface SettingsClientProps {
  initialSettings: Settings;
  activeTab: string;
}

export default function SettingsClient({ initialSettings, activeTab }: SettingsClientProps) {
  const router = useRouter();
  const { fetchSettings } = useApp();

  // State values (backed by MongoDB Settings)
  const [storeName, setStoreName] = useState(initialSettings.storeName);
  const [storeEmail, setStoreEmail] = useState(initialSettings.storeEmail);
  const [websiteLink, setWebsiteLink] = useState(initialSettings.websiteLink || "snapshop.gadohost.com");
  const [logoUrl, setLogoUrl] = useState(initialSettings.logoUrl || "");
  const [faviconUrl, setFaviconUrl] = useState(initialSettings.faviconUrl || "");
  const [currency, setCurrency] = useState(initialSettings.currency);
  const [shippingCost, setShippingCost] = useState(initialSettings.shippingCost.toString());
  const [promoCode, setPromoCode] = useState(initialSettings.promoCode);
  const [promoDiscount, setPromoDiscount] = useState(initialSettings.promoDiscount.toString());
  const [heroTitle, setHeroTitle] = useState(initialSettings.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(initialSettings.heroSubtitle);
  const [heroImageUrl, setHeroImageUrl] = useState(initialSettings.heroImageUrl || "/hero_botanical.png");
  
  const [shippingPolicy, setShippingPolicy] = useState(initialSettings.shippingPolicy || "");
  const [returnsPolicy, setReturnsPolicy] = useState(initialSettings.returnsPolicy || "");
  const [sizeGuideContent, setSizeGuideContent] = useState(initialSettings.sizeGuideContent || "");
  const [productUrlFormat, setProductUrlFormat] = useState(initialSettings.productUrlFormat || "slug");
  
  const dateObj = new Date(initialSettings.heroCountdownDate);
  const formattedDate = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  const [heroCountdownDate, setHeroCountdownDate] = useState(formattedDate);

  // Theme & Language
  const [selectedTheme, setSelectedTheme] = useState(initialSettings.selectedTheme || "light");
  const [primaryColor, setPrimaryColor] = useState(initialSettings.primaryColor || "#d31e28");

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", selectedTheme);
      document.cookie = `store_theme=${selectedTheme}; path=/; max-age=${60*60*24*365}`;
    }
  }, [selectedTheme]);
  const [defaultLanguage, setDefaultLanguage] = useState(initialSettings.defaultLanguage || "en");
  const [activeLanguages, setActiveLanguages] = useState<any[]>(
    initialSettings.languages || [
      {
        code: "en",
        name: "English",
        nativeName: "English",
        flag: "/images/flags/us.svg",
        isActive: true,
        isDefault: true
      }
    ]
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currencyPos, setCurrencyPos] = useState(initialSettings.currencyPos || "before");
  const [vatRate, setVatRate] = useState((initialSettings.vatRate ?? 20).toString());

  // Payment Gateways
  const [enableCod, setEnableCod] = useState(initialSettings.enableCod ?? true);
  const [enableStripe, setEnableStripe] = useState(initialSettings.enableStripe ?? true);
  const [stripePubKey, setStripePubKey] = useState(initialSettings.stripePubKey || "");
  const [stripeSecretKey, setStripeSecretKey] = useState(initialSettings.stripeSecretKey || "");

  const [enableRazorpay, setEnableRazorpay] = useState(initialSettings.enableRazorpay ?? false);
  const [razorpayKeyId, setRazorpayKeyId] = useState(initialSettings.razorpayKeyId || "");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState(initialSettings.razorpayKeySecret || "");

  const [enablePaypal, setEnablePaypal] = useState(initialSettings.enablePaypal ?? false);
  const [paypalClientId, setPaypalClientId] = useState(initialSettings.paypalClientId || "");
  const [paypalClientSecret, setPaypalClientSecret] = useState(initialSettings.paypalClientSecret || "");

  // Payment Custom Logo States
  const [codLogo, setCodLogo] = useState(initialSettings.codLogo || "");
  const [stripeLogo, setStripeLogo] = useState(initialSettings.stripeLogo || "");
  const [razorpayLogo, setRazorpayLogo] = useState(initialSettings.razorpayLogo || "");
  const [paypalLogo, setPaypalLogo] = useState(initialSettings.paypalLogo || "");

  // Mobile App Settings
  const [mobileAppName, setMobileAppName] = useState(initialSettings.mobileAppName || "SnapShop");
  const [webViewUrl, setWebViewUrl] = useState(initialSettings.webViewUrl || "http://10.0.2.2:3000");
  const [mobileSubTab, setMobileSubTab] = useState("general");
  
  // Mobile General States
  const [privacyPolicyLink, setPrivacyPolicyLink] = useState(initialSettings.privacyPolicyLink || "domain.com");
  const [termsOfServiceLink, setTermsOfServiceLink] = useState(initialSettings.termsOfServiceLink || "domain.com");
  const [rateUsLink, setRateUsLink] = useState(initialSettings.rateUsLink || "domain.com");
  const [forceUpdate, setForceUpdate] = useState(initialSettings.forceUpdate ?? false);
  const [updateLink, setUpdateLink] = useState(initialSettings.updateLink || "domain.com");
  const [targetVersionCode, setTargetVersionCode] = useState((initialSettings.targetVersionCode ?? 1).toString());
  const [enableGooglePlay, setEnableGooglePlay] = useState(initialSettings.enableGooglePlay ?? true);

  // Mobile API Connection States
  const [apiBaseUrl, setApiBaseUrl] = useState(initialSettings.apiBaseUrl || "localhost/api/mobile/v1");
  const [apiAccessKey, setApiAccessKey] = useState(initialSettings.apiAccessKey || "snap_ak_jq1gdg3frymuzt5z");

  // Mobile Ads States
  const [adsProvider, setAdsProvider] = useState(initialSettings.adsProvider || "Google AdMob");
  const [admobAppId, setAdmobAppId] = useState(initialSettings.admobAppId || "ca-app-pub-3940256099942544~3347511713");
  const [bannerAdEnabled, setBannerAdEnabled] = useState(initialSettings.bannerAdEnabled ?? true);
  const [bannerAdUnitId, setBannerAdUnitId] = useState(initialSettings.bannerAdUnitId || "ca-app-pub-3940256099942544/6300978111");
  const [interstitialAdEnabled, setInterstitialAdEnabled] = useState(initialSettings.interstitialAdEnabled ?? false);
  const [interstitialAdUnitId, setInterstitialAdUnitId] = useState(initialSettings.interstitialAdUnitId || "ca-app-pub-3940256099942544/1033173712");
  const [rewardedAdEnabled, setRewardedAdEnabled] = useState(initialSettings.rewardedAdEnabled ?? true);
  const [rewardedAdUnitId, setRewardedAdUnitId] = useState(initialSettings.rewardedAdUnitId || "ca-app-pub-3940256099942544/5224354917");

  const generateAccessKey = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let key = "snap_ak_";
    for (let i = 0; i < 16; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setApiAccessKey(key);
  };

  // Storage states
  const [activeStorageProvider, setActiveStorageProvider] = useState(initialSettings.activeStorageProvider || "local");
  const [doEndpoint, setDoEndpoint] = useState(initialSettings.doEndpoint || "nyc3.digitaloceanspaces.com");
  const [doKey, setDoKey] = useState(initialSettings.doKey || "");
  const [doSecret, setDoSecret] = useState(initialSettings.doSecret || "");
  const [doBucket, setDoBucket] = useState(initialSettings.doBucket || "snapshop-spaces");
  const [doRegion, setDoRegion] = useState(initialSettings.doRegion || "nyc3");

  const [s3Bucket, setS3Bucket] = useState(initialSettings.s3Bucket || "snapshop-bucket");
  const [s3Region, setS3Region] = useState(initialSettings.s3Region || "us-east-1");
  const [s3Key, setS3Key] = useState(initialSettings.s3Key || "");
  const [s3Secret, setS3Secret] = useState(initialSettings.s3Secret || "");

  const [gcsBucket, setGcsBucket] = useState(initialSettings.gcsBucket || "snapshop-gcs");
  const [gcsKey, setGcsKey] = useState(initialSettings.gcsKey || "");
  const [gcsSecret, setGcsSecret] = useState(initialSettings.gcsSecret || "");

  const [b2Bucket, setB2Bucket] = useState(initialSettings.b2Bucket || "snapshop-b2");
  const [b2Endpoint, setB2Endpoint] = useState(initialSettings.b2Endpoint || "s3.us-west-004.backblazeb2.com");
  const [b2KeyId, setB2KeyId] = useState(initialSettings.b2KeyId || "");
  const [b2Key, setB2Key] = useState(initialSettings.b2Key || "");

  // AI Integration & Key States
  const [activeProvider, setActiveProvider] = useState(initialSettings.activeProvider || "gemini");
  const [openaiKey, setOpenaiKey] = useState(initialSettings.openaiKey || "");
  const [groqKey, setGroqKey] = useState(initialSettings.groqKey || "");
  const [geminiKey, setGeminiKey] = useState(initialSettings.geminiKey || "");

  // Authentication settings
  const [enableEmail, setEnableEmail] = useState(initialSettings.enableEmail ?? true);
  const [enablePhone, setEnablePhone] = useState(initialSettings.enablePhone ?? false);
  const [enableGoogle, setEnableGoogle] = useState(initialSettings.enableGoogle ?? false);
  const [enableFacebook, setEnableFacebook] = useState(initialSettings.enableFacebook ?? false);
  const [enableApple, setEnableApple] = useState(initialSettings.enableApple || false);
  const [firebaseConfig, setFirebaseConfig] = useState(initialSettings.firebaseConfig || "");

  // Email Config
  const [mailMethod, setMailMethod] = useState(initialSettings.mailMethod || "smtp");
  const [smtpHost, setSmtpHost] = useState(initialSettings.smtpHost || "");
  const [smtpPort, setSmtpPort] = useState(initialSettings.smtpPort?.toString() || "587");
  const [smtpUser, setSmtpUser] = useState(initialSettings.smtpUser || "");
  const [smtpPass, setSmtpPass] = useState(initialSettings.smtpPass || "");
  const [fromEmail, setFromEmail] = useState(initialSettings.fromEmail || "noreply@snapshop.com");
  const [fromName, setFromName] = useState(initialSettings.fromName || "SnapShop");
  const [encryption, setEncryption] = useState(initialSettings.encryption || "tls");
  const [welcomeEmailTemplate, setWelcomeEmailTemplate] = useState(initialSettings.welcomeEmailTemplate || defaultWelcomeEmail);
  const [orderConfirmationTemplate, setOrderConfirmationTemplate] = useState(initialSettings.orderConfirmationTemplate || defaultOrderConfirmationEmail);
  const [orderProcessingTemplate, setOrderProcessingTemplate] = useState(initialSettings.orderProcessingTemplate || defaultOrderProcessingEmail);
  const [orderShippedTemplate, setOrderShippedTemplate] = useState(initialSettings.orderShippedTemplate || defaultOrderShippedEmail);
  const [orderDeliveredTemplate, setOrderDeliveredTemplate] = useState(initialSettings.orderDeliveredTemplate || defaultOrderDeliveredEmail);
  const [orderCancelledTemplate, setOrderCancelledTemplate] = useState(initialSettings.orderCancelledTemplate || defaultOrderCancelledEmail);
  const [passwordResetTemplate, setPasswordResetTemplate] = useState(initialSettings.passwordResetTemplate || defaultPasswordResetEmail);

  // Loading StatesAI Key Verification testing states
  const [testingAiKey, setTestingAiKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  // AI Translit Modal States
  const [showTranslitModal, setShowTranslitModal] = useState(false);
  const [translatingLanguage, setTranslatingLanguage] = useState<string | null>(null);

  // Manual Translation Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewLanguage, setViewLanguage] = useState<any>(null);
  const [translationsList, setTranslationsList] = useState<any[]>([]);
  const [loadingTranslations, setLoadingTranslations] = useState(false);
  const [translationSearch, setTranslationSearch] = useState("");
  const [manualChanges, setManualChanges] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleLogoUpload = async (name: string, file: File) => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("file", file);

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/upload/payment-logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload logo");

      const cacheBustUrl = `${data.url}?t=${Date.now()}`;
      if (name === "cod") setCodLogo(cacheBustUrl);
      else if (name === "stripe") setStripeLogo(cacheBustUrl);
      else if (name === "razorpay") setRazorpayLogo(cacheBustUrl);
      else if (name === "paypal") setPaypalLogo(cacheBustUrl);

    } catch (err: any) {
      setError(err.message || "Failed to upload logo");
    } finally {
      setLoading(false);
    }
  };

  const testAiKey = async (provider: string, apiKey: string) => {
    setTestingAiKey(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({ success: false, error: data.error || "Failed to verify key" });
      }
    } catch (err: any) {
      setTestResult({ success: false, error: err.message || "Failed to connect to verification API" });
    } finally {
      setTestingAiKey(false);
    }
  };

  const handleSaveAi = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({
      activeProvider,
      openaiKey,
      groqKey,
      geminiKey,
    }, "ai");
  };

  const handleAiTranslate = async (localeCode: string) => {
    setTranslatingLanguage(localeCode);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ai-translate", locale: localeCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI translation failed");
      setSuccess(true);
      alert(`Successfully auto-translated all storefront keywords to ${localeCode.toUpperCase()}!`);
      setShowTranslitModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to run AI translation");
    } finally {
      setTranslatingLanguage(null);
    }
  };

  const handleOpenTranslationView = async (lang: any) => {
    setViewLanguage(lang);
    setShowViewModal(true);
    setLoadingTranslations(true);
    setManualChanges({});
    setTranslationSearch("");
    try {
      const res = await fetch("/api/admin/translations");
      const data = await res.json();
      if (res.ok) {
        setTranslationsList(data);
      } else {
        setError("Failed to load translation keys");
      }
    } catch (err) {
      setError("Failed to load translation keys");
    } finally {
      setLoadingTranslations(false);
    }
  };

  const handleSaveManualTranslations = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const updates = Object.entries(manualChanges).map(([key, val]) => ({
        key,
        translations: { [viewLanguage.code]: val }
      }));
      const res = await fetch("/api/admin/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-manual", updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save overrides");
      setSuccess(true);
      alert("Manual translations updated successfully!");
      setShowViewModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to save manual translations");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (payload: any, category: string = activeTab) => {
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const res = await fetch(`/api/settings/${category}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");

      fetchSettings();
      router.refresh();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultLanguage = async (langCode: string) => {
    const updated = activeLanguages.map(lang => ({
      ...lang,
      isDefault: lang.code === langCode,
      isActive: lang.code === langCode ? true : lang.isActive
    }));
    setActiveLanguages(updated);
    setDefaultLanguage(langCode);
    await saveSettings({ defaultLanguage: langCode, languages: updated }, "languages");
  };

  const handleToggleLanguageActive = async (langCode: string) => {
    const targetLang = activeLanguages.find(l => l.code === langCode);
    if (targetLang?.isDefault) {
      setError("Cannot deactivate the default language.");
      return;
    }
    const updated = activeLanguages.map(lang => ({
      ...lang,
      isActive: lang.code === langCode ? !lang.isActive : lang.isActive
    }));
    setActiveLanguages(updated);
    await saveSettings({ languages: updated }, "languages");
  };

  const handleRemoveLanguage = async (langCode: string) => {
    const targetLang = activeLanguages.find(l => l.code === langCode);
    if (targetLang?.isDefault) {
      setError("Cannot remove the default language.");
      return;
    }
    if (activeLanguages.length <= 1) {
      setError("Cannot remove the only remaining language.");
      return;
    }
    const updated = activeLanguages.filter(lang => lang.code !== langCode);
    setActiveLanguages(updated);
    await saveSettings({ languages: updated }, "languages");
  };

  const handleAddLanguage = async (langItem: any) => {
    const newLang = {
      code: langItem.code,
      name: langItem.name,
      nativeName: langItem.nativeName,
      flag: langItem.flag,
      isActive: true,
      isDefault: false
    };
    const updated = [...activeLanguages, newLang];
    setActiveLanguages(updated);
    setShowAddModal(false);
    setSearchQuery("");
    await saveSettings({ languages: updated }, "languages");
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({
      storeName,
      storeEmail,
      websiteLink,
      logoUrl,
      faviconUrl,
      currency,
      shippingCost: Number(shippingCost),
      heroTitle,
      heroSubtitle,
      heroImageUrl,
      heroCountdownDate: new Date(heroCountdownDate).toISOString(),
      shippingPolicy,
      returnsPolicy,
      sizeGuideContent,
      productUrlFormat,
    }, "general");
  };

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({ selectedTheme, primaryColor }, "theme");
  };

  const handleSaveLanguages = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({ defaultLanguage, languages: activeLanguages }, "languages");
  };

  const handleSaveCurrencies = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({ currency, currencyPos }, "currencies");
  };

  const handleSaveTax = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({ vatRate: Number(vatRate) }, "tax");
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({
      enableCod,
      enableStripe,
      stripeMode: "live",
      stripePubKey,
      stripeSecretKey,
      enableRazorpay,
      razorpayMode: "live",
      razorpayKeyId,
      razorpayKeySecret,
      enablePaypal,
      paypalMode: "live",
      paypalClientId,
      paypalClientSecret,
      codLogo,
      stripeLogo,
      razorpayLogo,
      paypalLogo,
    }, "payment");
  };

  const handleSaveStorage = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({
      activeStorageProvider,
      doEndpoint,
      doRegion,
      doKey,
      doSecret,
      doBucket,
      s3Bucket,
      s3Region,
      s3Key,
      s3Secret,
      gcsBucket,
      gcsKey,
      gcsSecret,
      b2Bucket,
      b2Endpoint,
      b2KeyId,
      b2Key,
    }, "storage");
  };

  const handleSaveMobile = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({
      mobileAppName,
      webViewUrl,
      privacyPolicyLink,
      termsOfServiceLink,
      rateUsLink,
      forceUpdate,
      updateLink,
      targetVersionCode: Number(targetVersionCode),
      enableGooglePlay,
      apiBaseUrl,
      apiAccessKey,
      adsProvider,
      admobAppId,
      bannerAdEnabled,
      bannerAdUnitId,
      interstitialAdEnabled,
      interstitialAdUnitId,
      rewardedAdEnabled,
      rewardedAdUnitId,
    }, "mobile");
  };

  const handleUploadImage = async (file: File, oldUrl: string, setUrl: (url: string) => void, uploadType?: string) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (oldUrl) {
        formData.append("oldUrl", oldUrl);
      }
      if (uploadType) {
        formData.append("uploadType", uploadType);
      }

      const res = await fetch("/api/upload/settings", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setUrl(data.url);
      } else {
        alert(data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload.");
    }
  };

  const handleSaveAuth = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({
      enableEmail,
      enablePhone,
      enableGoogle,
      enableFacebook,
      enableApple,
      firebaseConfig,
    }, "auth");
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({
      mailMethod,
      smtpHost,
      smtpPort: Number(smtpPort),
      smtpUser,
      smtpPass,
      fromEmail,
      fromName,
      encryption,
      welcomeEmailTemplate,
      orderConfirmationTemplate,
      orderProcessingTemplate,
      orderShippedTemplate,
      orderDeliveredTemplate,
      orderCancelledTemplate,
      passwordResetTemplate
    }, "email");
  };

  // Backup Data Download
  const handleExportData = async () => {
    try {
      const resProducts = await fetch("/api/products");
      const products = await resProducts.json();
      const resSettings = await fetch("/api/settings");
      const settings = await resSettings.json();

      const backupData = {
        exportedAt: new Date().toISOString(),
        products,
        settings,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `snapshop-backup-${new Date().toISOString().slice(0,10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export database backup.");
    }
  };

  // Restore Data Upload
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.products || !json.settings) {
          throw new Error("Invalid backup file format");
        }

        setLoading(true);
        // Loop products and push to server
        for (const prod of json.products) {
          delete prod._id; // Remove old mongo ids to create new ones
          await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(prod),
          });
        }

        // Push settings
        await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(json.settings),
        });

        alert("Data restored successfully!");
        window.location.reload();
      } catch (err: any) {
        alert(err.message || "Failed to restore backup.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const renderActiveTabForm = () => {
    switch (activeTab) {
      case "theme":
        const themes = [
          { id: "light", name: "Classic Light", desc: "Clean & bright default experience", primary: "#d31e28", bg: "#ffffff", text: "#222222" },
          { id: "dark", name: "Sleek Dark", desc: "Easy on the eyes at night", primary: "#ef4444", bg: "#0f172a", text: "#e2e8f0" },
          { id: "glass", name: "Glassmorphism", desc: "Modern frosted glass effect", primary: "#8b5cf6", bg: "rgba(255,255,255,0.6)", text: "#1e1b4b" },
          { id: "vibrant", name: "Vibrant", desc: "Warm & energetic amber tones", primary: "#f59e0b", bg: "#fffbeb", text: "#431407" },
          { id: "minimal", name: "Minimal", desc: "Clean, simple & focused", primary: "#3b82f6", bg: "#ffffff", text: "#334155" },
          { id: "midnight", name: "Midnight", desc: "Deep blue dark elegance", primary: "#06b6d4", bg: "#020617", text: "#cbd5e1" },
          { id: "nature", name: "Nature", desc: "Fresh & natural green vibes", primary: "#22c55e", bg: "#f0fdf4", text: "#052e16" },
        ];
        return (
          <form onSubmit={handleSaveTheme} style={styles.form}>
            <h3 style={styles.sectionTitle}>Theme settings</h3>
            <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}>
              Choose a skin theme for your store. Preview updates in real time.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
              {themes.map((t) => {
                const isActive = selectedTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTheme(t.id)}
                    style={{
                      ...styles.themeCard,
                      outline: isActive ? `3px solid ${t.primary}` : "3px solid transparent",
                      border: isActive ? "2px solid #0f172a" : "2px solid #e2e8f0",
                    }}
                  >
                    <div style={{
                      ...styles.themePreview,
                      backgroundColor: t.bg,
                      border: `1px solid ${t.id === "glass" ? "rgba(0,0,0,0.1)" : "#e2e8f0"}`,
                      backdropFilter: t.id === "glass" ? "blur(10px)" : undefined,
                    }}>
                      <div style={{
                        display: "flex",
                        gap: "4px",
                        marginBottom: "8px",
                      }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#f59e0b" }} />
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
                      </div>
                      <div style={{
                        width: "100%",
                        height: "6px",
                        borderRadius: "3px",
                        backgroundColor: t.primary,
                        marginBottom: "6px",
                      }} />
                      <div style={{
                        width: "70%",
                        height: "4px",
                        borderRadius: "2px",
                        backgroundColor: t.text,
                        opacity: 0.3,
                        marginBottom: "4px",
                      }} />
                      <div style={{
                        width: "50%",
                        height: "4px",
                        borderRadius: "2px",
                        backgroundColor: t.text,
                        opacity: 0.2,
                      }} />
                    </div>
                    <div style={{ padding: "10px 0 0" }}>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginBottom: "2px" }}>{t.name}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{t.desc}</div>
                    </div>
                    {isActive && (
                      <div style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        backgroundColor: t.primary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <Check size={13} color="#fff" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{
              padding: "20px",
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              marginBottom: "24px",
            }}>
              <label className="form-label" style={{ marginBottom: "12px" }}>Primary Brand Accent Color</label>
              <div style={styles.colorPickerContainer}>
                <input 
                  type="color" 
                  value={primaryColor} 
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  style={styles.colorPicker}
                />
                <input
                  type="text"
                  value={primaryColor.toUpperCase()}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (val && !val.startsWith("#")) val = "#" + val;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                      setPrimaryColor(val);
                    }
                  }}
                  onBlur={(e) => {
                    let val = e.target.value;
                    if (!/^#[0-9A-Fa-f]{6}$/.test(val)) {
                      setPrimaryColor("#d31e28");
                    }
                  }}
                  placeholder="#HEX"
                  style={{
                    ...styles.colorCodeText,
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    width: "110px",
                    outline: "none",
                    backgroundColor: "#ffffff",
                  }}
                />
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: primaryColor,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.05)",
                }} />
              </div>
            </div>

            <button type="submit" style={styles.saveBtn} disabled={loading}>
              <Save size={16} style={{ marginRight: 8 }} />
              {loading ? "Saving Theme..." : "Save Theme Settings"}
            </button>
          </form>
        );

      case "languages":
        return (
          (() => {
            const availableLanguages = ALL_LANGUAGES.filter(
              lang => !activeLanguages.some(al => al.code === lang.code)
            );

            const filteredAvailable = availableLanguages.filter(
              lang =>
                lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lang.code.toLowerCase().includes(searchQuery.toLowerCase())
            );

            return (
              <div style={styles.form}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h3 style={{ ...styles.sectionTitle, marginBottom: "4px" }}>Languages Management</h3>
                    <p style={{ ...styles.sectionDesc, marginBottom: 0 }}>
                      Manage the languages available on your storefront. Set a default language or add new ones.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setShowTranslitModal(true)}
                      style={{ ...styles.addButton, backgroundColor: "#4f46e5" }}
                    >
                      <RefreshCw size={16} style={{ marginRight: 6 }} />
                      AI Translit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setShowAddModal(true);
                      }}
                      style={styles.addButton}
                    >
                      <Plus size={16} style={{ marginRight: 6 }} />
                      Add Language
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={styles.langTable}>
                    <thead>
                      <tr>
                        <th style={styles.langTableHeader}>Language</th>
                        <th style={styles.langTableHeader}>Code</th>
                        <th style={styles.langTableHeader}>Default</th>
                        <th style={styles.langTableHeader}>Status</th>
                        <th style={{ ...styles.langTableHeader, textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeLanguages.map((lang) => (
                        <tr key={lang.code}>
                          <td style={styles.langTableCell}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <img src={lang.flag} alt={`${lang.name} flag`} style={styles.flagImg} />
                              <div>
                                <div style={{ fontWeight: "600", color: "#0f172a" }}>{lang.name}</div>
                                <div style={{ fontSize: "12px", color: "#64748b" }}>{lang.nativeName}</div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.langTableCell}>
                            <span style={{ fontFamily: "monospace", fontWeight: "600", color: "#475569" }}>{lang.code}</span>
                          </td>
                          <td style={styles.langTableCell}>
                            {lang.isDefault ? (
                              <span style={{ ...styles.langBadge, ...styles.defaultBadge }}>Default</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetDefaultLanguage(lang.code)}
                                style={{
                                  fontSize: "12px",
                                  backgroundColor: "transparent",
                                  border: "none",
                                  color: "var(--primary)",
                                  cursor: "pointer",
                                  fontWeight: "600",
                                  padding: 0
                                }}
                              >
                                Set as Default
                              </button>
                            )}
                          </td>
                          <td style={styles.langTableCell}>
                            <button
                              type="button"
                              onClick={() => handleToggleLanguageActive(lang.code)}
                              style={{
                                border: "none",
                                background: "none",
                                padding: 0,
                                cursor: "pointer"
                              }}
                            >
                              {lang.isActive ? (
                                <span style={{ ...styles.langBadge, ...styles.activeBadge }}>Active</span>
                              ) : (
                                <span style={{ ...styles.langBadge, ...styles.inactiveBadge }}>Disabled</span>
                              )}
                            </button>
                          </td>
                          <td style={{ ...styles.langTableCell, textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                onClick={() => handleOpenTranslationView(lang)}
                                style={{ ...styles.iconBtn, borderColor: "#cbd5e1", color: "#3b82f6" }}
                                title="View & Edit Translations"
                              >
                                <Search size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveLanguage(lang.code)}
                                disabled={lang.isDefault || activeLanguages.length <= 1}
                                style={{
                                  ...styles.iconBtn,
                                  ...(lang.isDefault || activeLanguages.length <= 1
                                    ? { opacity: 0.4, cursor: "not-allowed" }
                                    : { borderColor: "#fecaca", color: "#dc2626" })
                                }}
                                title={lang.isDefault ? "Cannot delete default language" : "Delete language"}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Language Modal */}
                {showAddModal && (
                  <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                    <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                      <div style={styles.modalHeader}>
                        <h4 style={styles.modalTitle}>Add Language</h4>
                        <button
                          type="button"
                          onClick={() => setShowAddModal(false)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div style={styles.searchContainer}>
                        <Search size={18} style={styles.searchIcon} />
                        <input
                          type="text"
                          placeholder="Search languages by name or code..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={styles.searchInput}
                          autoFocus
                        />
                      </div>

                      <div style={styles.langList}>
                        {filteredAvailable.length > 0 ? (
                          filteredAvailable.map((lang) => (
                            <div
                              key={lang.code}
                              onClick={() => handleAddLanguage(lang)}
                              style={styles.langListItem}
                              className="lang-list-item-hover"
                            >
                              <div style={styles.langInfo}>
                                <img src={lang.flag} alt={lang.name} style={styles.flagImg} />
                                <div>
                                  <span style={{ fontWeight: "600", color: "#0f172a" }}>{lang.name}</span>
                                  <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "8px" }}>({lang.nativeName})</span>
                                </div>
                              </div>
                              <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                                {lang.code.toUpperCase()}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: "14px" }}>
                            No more languages found.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Translit Modal */}
                {showTranslitModal && (
                  <div style={styles.modalOverlay} onClick={() => setShowTranslitModal(false)}>
                    <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                      <div style={styles.modalHeader}>
                        <h4 style={styles.modalTitle}>AI Translit Engine</h4>
                        <button
                          type="button"
                          onClick={() => setShowTranslitModal(false)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
                        Select one of your added languages to automatically translate all storefront UI labels using your active AI API provider.
                      </p>
                      <div style={styles.langList}>
                        {activeLanguages
                          .filter((l) => l.code !== "en")
                          .map((lang) => (
                            <div
                              key={lang.code}
                              onClick={() => {
                                if (translatingLanguage) return;
                                handleAiTranslate(lang.code);
                              }}
                              style={{
                                ...styles.langListItem,
                                opacity: translatingLanguage ? 0.6 : 1,
                                cursor: translatingLanguage ? "not-allowed" : "pointer"
                              }}
                            >
                              <div style={styles.langInfo}>
                                <img src={lang.flag} alt={lang.name} style={styles.flagImg} />
                                <div>
                                  <span style={{ fontWeight: "600", color: "#0f172a" }}>{lang.name}</span>
                                  {translatingLanguage === lang.code && (
                                    <span style={{ fontSize: "12px", color: "#4f46e5", marginLeft: "12px", fontWeight: "600" }}>
                                      Translating...
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                                {lang.code.toUpperCase()}
                              </span>
                            </div>
                          ))}
                        {activeLanguages.filter((l) => l.code !== "en").length === 0 && (
                          <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                            No other languages added. Add a language first.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* View Manual Translations Modal */}
                {showViewModal && viewLanguage && (
                  <div style={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
                    <div style={{ ...styles.modalCard, maxWidth: "680px", width: "90%" }} onClick={(e) => e.stopPropagation()}>
                      <div style={styles.modalHeader}>
                        <div>
                          <h4 style={styles.modalTitle}>Translations Manager ({viewLanguage.name})</h4>
                          <p style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                            Review, translate, or override dictionary phrases manually.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowViewModal(false)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div style={styles.searchContainer}>
                        <Search size={18} style={styles.searchIcon} />
                        <input
                          type="text"
                          placeholder="Search keywords..."
                          value={translationSearch}
                          onChange={(e) => setTranslationSearch(e.target.value)}
                          style={styles.searchInput}
                        />
                      </div>

                      {loadingTranslations ? (
                        <div style={{ textAlign: "center", padding: "40px" }}>
                          <p style={{ color: "#64748b" }}>Loading translations registry...</p>
                        </div>
                      ) : (
                        <div style={{ overflowY: "auto", flex: 1, maxHeight: "400px", paddingRight: "8px" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                                <th style={{ textAlign: "left", padding: "8px", fontSize: "12px", color: "#475569" }}>English Key</th>
                                <th style={{ textAlign: "left", padding: "8px", fontSize: "12px", color: "#475569" }}>{viewLanguage.name} Translation</th>
                              </tr>
                            </thead>
                            <tbody>
                              {translationsList
                                .filter(item => 
                                  item.key.toLowerCase().includes(translationSearch.toLowerCase()) ||
                                  (item.translations[viewLanguage.code] || "").toLowerCase().includes(translationSearch.toLowerCase())
                                )
                                .map((item) => {
                                  const currentVal = manualChanges[item.key] !== undefined 
                                    ? manualChanges[item.key] 
                                    : (item.translations[viewLanguage.code] || "");
                                  return (
                                    <tr key={item.key} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                      <td style={{ padding: "8px", fontSize: "13px", color: "#0f172a", width: "40%" }}>{item.key}</td>
                                      <td style={{ padding: "8px" }}>
                                        <input
                                          type="text"
                                          value={currentVal}
                                          onChange={(e) => setManualChanges({ ...manualChanges, [item.key]: e.target.value })}
                                          style={{
                                            width: "100%",
                                            padding: "6px 10px",
                                            border: "1px solid #cbd5e1",
                                            borderRadius: "6px",
                                            fontSize: "13px",
                                            outline: "none"
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
                        <button
                          type="button"
                          onClick={() => setShowViewModal(false)}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "white",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveManualTranslations}
                          style={{
                            padding: "8px 20px",
                            backgroundColor: "#0f172a",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        );

      case "currencies":
        return (
          <form onSubmit={handleSaveCurrencies} style={styles.form}>
            <h3 style={styles.sectionTitle}>Currencies and Exchange</h3>
            <div className="form-group">
              <label className="form-label">Primary Currency Symbol</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="form-input"
                required
              >
                {ALL_CURRENCIES.map((cur) => (
                  <option key={cur.code} value={cur.symbol}>
                    {cur.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Symbol Alignment</label>
              <select 
                value={currencyPos} 
                onChange={(e) => setCurrencyPos(e.target.value)} 
                className="form-input"
              >
                <option value="before">Before price (e.g. $100.00)</option>
                <option value="after">After price (e.g. 100.00 MAD)</option>
              </select>
            </div>
            <button type="submit" style={styles.saveBtn} disabled={loading}>
              <Save size={16} style={{ marginRight: 8 }} />
              Save Currency Settings
            </button>
          </form>
        );

      case "ai":
        return (
          <form onSubmit={handleSaveAi} style={styles.form}>
            <h3 style={styles.sectionTitle}>AI API Integration & Keys</h3>
            <p style={styles.sectionDesc}>Configure your AI models (OpenAI, Groq, or Gemini 2.0 Flash) for automated storefront localization and keyword translation.</p>

            <div className="form-group">
              <label className="form-label">Active AI Translation Provider</label>
              <select 
                value={activeProvider} 
                onChange={(e) => setActiveProvider(e.target.value)} 
                className="form-input"
              >
                <option value="gemini">Google Gemini 3.5 Flash</option>
                <option value="openai">OpenAI GPT-4o Mini</option>
                <option value="groq">Groq Llama 3.3 70B</option>
              </select>
            </div>

            <hr style={styles.divider} />

            {activeProvider === "openai" && (
              <div className="form-group">
                <label className="form-label">OpenAI API Key</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <input 
                    type="password" 
                    value={openaiKey} 
                    onChange={(e) => setOpenaiKey(e.target.value)} 
                    className="form-input" 
                    placeholder="sk-proj-..."
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    onClick={() => testAiKey("openai", openaiKey)}
                    className="btn btn-secondary"
                    style={styles.actionBtn}
                    disabled={testingAiKey || !openaiKey}
                  >
                    {testingAiKey ? "Testing..." : "Test Key"}
                  </button>
                </div>
              </div>
            )}

            {activeProvider === "groq" && (
              <div className="form-group">
                <label className="form-label">Groq API Key</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <input 
                    type="password" 
                    value={groqKey} 
                    onChange={(e) => setGroqKey(e.target.value)} 
                    className="form-input" 
                    placeholder="gsk_..."
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    onClick={() => testAiKey("groq", groqKey)}
                    className="btn btn-secondary"
                    style={styles.actionBtn}
                    disabled={testingAiKey || !groqKey}
                  >
                    {testingAiKey ? "Testing..." : "Test Key"}
                  </button>
                </div>
              </div>
            )}

            {activeProvider === "gemini" && (
              <div className="form-group">
                <label className="form-label">Google Gemini API Key</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <input 
                    type="password" 
                    value={geminiKey} 
                    onChange={(e) => setGeminiKey(e.target.value)} 
                    className="form-input" 
                    placeholder="AIzaSy..."
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    onClick={() => testAiKey("gemini", geminiKey)}
                    className="btn btn-secondary"
                    style={styles.actionBtn}
                    disabled={testingAiKey || !geminiKey}
                  >
                    {testingAiKey ? "Testing..." : "Test Key"}
                  </button>
                </div>
              </div>
            )}

            {testResult && (
              <div style={{
                marginTop: "12px",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                backgroundColor: testResult.success ? "#ecfdf5" : "#fef2f2",
                color: testResult.success ? "#047857" : "#ef4444",
                border: `1px solid ${testResult.success ? "#a7f3d0" : "#fca5a5"}`
              }}>
                {testResult.success ? testResult.message : testResult.error}
              </div>
            )}

            <button type="submit" style={{ ...styles.saveBtn, marginTop: "24px" }} disabled={loading}>
              <Save size={16} style={{ marginRight: 8 }} />
              {loading ? "Saving AI Settings..." : "Save AI Settings"}
            </button>
          </form>
        );

      case "tax":
        return (
          <form onSubmit={handleSaveTax} style={styles.form}>
            <h3 style={styles.sectionTitle}>Tax Rates (VAT)</h3>
            <div className="form-group">
              <label className="form-label">Standard Value Added Tax (VAT) %</label>
              <input 
                type="number" 
                value={vatRate} 
                onChange={(e) => setVatRate(e.target.value)} 
                className="form-input" 
              />
            </div>
            <button type="submit" style={styles.saveBtn} disabled={loading}>
              <Save size={16} style={{ marginRight: 8 }} />
              Save Tax Rates
            </button>
          </form>
        );

      case "gateways":
        return (
          <form onSubmit={handleSavePayment} style={styles.form}>
            <h3 style={styles.sectionTitle}>Payment Gateways</h3>
            <p style={styles.sectionDesc}>Enable or disable payment methods and enter your Live API credentials.</p>

            {/* Cash on Delivery */}
            <div style={styles.gatewayConfigCard}>
              <div style={styles.configHeader}>
                <h4 style={styles.configTitle}>Cash on Delivery (COD)</h4>
                <button 
                  type="button" 
                  onClick={() => setEnableCod(!enableCod)}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: enableCod ? "var(--primary)" : "#cbd5e1",
                  }}
                >
                  {enableCod ? "Enabled" : "Disabled"}
                </button>
              </div>
              <p style={{ fontSize: "12px", color: "#64748b", marginTop: "-10px" }}>
                Allows customers to pay in cash upon receiving their physical package.
              </p>
            </div>

            <hr style={styles.divider} />

            {/* Stripe Gateway */}
            <div style={styles.gatewayConfigCard}>
              <div style={styles.configHeader}>
                <h4 style={styles.configTitle}>Stripe — Credit Card / Debit Card</h4>
                <button 
                  type="button" 
                  onClick={() => setEnableStripe(!enableStripe)}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: enableStripe ? "var(--primary)" : "#cbd5e1",
                  }}
                >
                  {enableStripe ? "Enabled" : "Disabled"}
                </button>
              </div>
              <p style={{ fontSize: "12px", color: "#64748b", marginTop: "-10px" }}>
                Live mode. Pay securely with Visa, MasterCard, Amex, or Apple Pay.
              </p>
              
              {enableStripe && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                  <div style={styles.formRow}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label className="form-label">Publishable Key</label>
                      <input 
                        type="text" 
                        value={stripePubKey} 
                        onChange={(e) => setStripePubKey(e.target.value)} 
                        className="form-input" 
                        placeholder="pk_live_..."
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label className="form-label">Secret Key</label>
                      <input 
                        type="password" 
                        value={stripeSecretKey} 
                        onChange={(e) => setStripeSecretKey(e.target.value)} 
                        className="form-input" 
                        placeholder="sk_live_..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <hr style={styles.divider} />

            {/* Razorpay Gateway */}
            <div style={styles.gatewayConfigCard}>
              <div style={styles.configHeader}>
                <h4 style={styles.configTitle}>Razorpay — UPI / Netbanking</h4>
                <button 
                  type="button" 
                  onClick={() => setEnableRazorpay(!enableRazorpay)}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: enableRazorpay ? "var(--primary)" : "#cbd5e1",
                  }}
                >
                  {enableRazorpay ? "Enabled" : "Disabled"}
                </button>
              </div>
              <p style={{ fontSize: "12px", color: "#64748b", marginTop: "-10px" }}>
                Live mode. Support instant UPI payments and cards.
              </p>
              
              {enableRazorpay && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                  <div style={styles.formRow}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label className="form-label">Key ID</label>
                      <input 
                        type="text" 
                        value={razorpayKeyId} 
                        onChange={(e) => setRazorpayKeyId(e.target.value)} 
                        className="form-input" 
                        placeholder="rzp_live_..."
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label className="form-label">Key Secret</label>
                      <input 
                        type="password" 
                        value={razorpayKeySecret} 
                        onChange={(e) => setRazorpayKeySecret(e.target.value)} 
                        className="form-input" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <hr style={styles.divider} />

            {/* PayPal Gateway */}
            <div style={styles.gatewayConfigCard}>
              <div style={styles.configHeader}>
                <h4 style={styles.configTitle}>PayPal — Secure Checkout</h4>
                <button 
                  type="button" 
                  onClick={() => setEnablePaypal(!enablePaypal)}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: enablePaypal ? "var(--primary)" : "#cbd5e1",
                  }}
                >
                  {enablePaypal ? "Enabled" : "Disabled"}
                </button>
              </div>
              <p style={{ fontSize: "12px", color: "#64748b", marginTop: "-10px" }}>
                Live mode. Pay using your PayPal wallet balance or linked bank accounts.
              </p>
              
              {enablePaypal && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                  <div style={styles.formRow}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label className="form-label">Client ID</label>
                      <input 
                        type="text" 
                        value={paypalClientId} 
                        onChange={(e) => setPaypalClientId(e.target.value)} 
                        className="form-input" 
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label className="form-label">Client Secret</label>
                      <input 
                        type="password" 
                        value={paypalClientSecret} 
                        onChange={(e) => setPaypalClientSecret(e.target.value)} 
                        className="form-input" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <hr style={styles.divider} />

            {/* Logo Uploads */}
            <h3 style={styles.sectionTitle}>Payment Logos</h3>
            <p style={styles.sectionDesc}>Upload custom logos for each payment method.</p>
            <div style={styles.logoUploadGrid}>
              {[
                { name: "cod", label: "Cash on Delivery", state: codLogo, setter: setCodLogo },
                { name: "stripe", label: "Stripe", state: stripeLogo, setter: setStripeLogo },
                { name: "razorpay", label: "Razorpay", state: razorpayLogo, setter: setRazorpayLogo },
                { name: "paypal", label: "PayPal", state: paypalLogo, setter: setPaypalLogo },
              ].map((gateway) => (
                <div key={gateway.name} style={styles.logoUploadCard}>
                  <div style={styles.logoCardHeader}>
                    <span style={styles.logoCardTitle}>{gateway.label} Logo</span>
                  </div>
                  <div style={styles.logoPreviewContainer}>
                    {gateway.state ? (
                      <img src={gateway.state} alt={`${gateway.label} custom logo`} style={styles.logoPreviewImage} />
                    ) : (
                      <div style={styles.logoPlaceholder}>
                        <span style={styles.placeholderText}>No Custom Logo</span>
                      </div>
                    )}
                  </div>
                  <div style={styles.uploadBtnWrapper}>
                    <input 
                      type="file" accept="image/*" 
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) handleLogoUpload(gateway.name, file); }} 
                      id={`upload-logo-${gateway.name}`}
                      style={{ display: "none" }}
                    />
                    <label htmlFor={`upload-logo-${gateway.name}`} style={styles.logoUploadBtn}>
                      <Upload size={14} style={{ marginRight: 6 }} />
                      Upload Logo
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <hr style={styles.divider} />

            <button type="submit" style={styles.saveBtn} disabled={loading}>
              <Save size={16} style={{ marginRight: 8 }} />
              {loading ? "Saving..." : "Save Payment Gateways"}
            </button>
          </form>
        );

      case "storage":
        return (
          <form onSubmit={handleSaveStorage} style={styles.form}>
            <h3 style={styles.sectionTitle}>Active Storage Provider</h3>
            
            <div style={styles.storageProviders}>
              {[
                { id: "local", label: "Local Server" },
                { id: "digitalocean", label: "DigitalOcean" },
                { id: "s3", label: "Amazon S3" },
                { id: "google", label: "Google Cloud" },
                { id: "backblaze", label: "Backblaze B2" },
              ].map((provider) => (
                <label 
                  key={provider.id}
                  style={{
                    ...styles.providerCard,
                    borderColor: activeStorageProvider === provider.id ? "var(--secondary)" : "var(--border-color)",
                    backgroundColor: activeStorageProvider === provider.id ? "#fcfcfd" : "transparent"
                  }}
                >
                  <input 
                    type="radio" 
                    name="storageProvider" 
                    value={provider.id}
                    checked={activeStorageProvider === provider.id}
                    onChange={() => setActiveStorageProvider(provider.id)}
                    style={{ marginRight: "10px", accentColor: "var(--secondary)" }}
                  />
                  <strong>{provider.label}</strong>
                </label>
              ))}
            </div>

            <hr style={styles.divider} />

            {/* DigitalOcean Spaces */}
            <div style={styles.providerConfigCard}>
              <div style={styles.configHeader}>
                <h4 style={styles.configTitle}>DigitalOcean Spaces Configuration</h4>
                <a href="https://cloud.digitalocean.com" target="_blank" rel="noopener noreferrer" style={styles.getKeysLink}>
                  GET KEYS
                </a>
              </div>
              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Spaces Endpoint</label>
                  <input type="text" value={doEndpoint} onChange={(e) => setDoEndpoint(e.target.value)} className="form-input" placeholder="nyc3.digitaloceanspaces.com" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Spaces Region</label>
                  <input type="text" value={doRegion} onChange={(e) => setDoRegion(e.target.value)} className="form-input" placeholder="nyc3" />
                </div>
              </div>
              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Spaces Key</label>
                  <input type="text" value={doKey} onChange={(e) => setDoKey(e.target.value)} className="form-input" placeholder="DO00..." />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Spaces Secret</label>
                  <input type="password" value={doSecret} onChange={(e) => setDoSecret(e.target.value)} className="form-input" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Bucket Name</label>
                <input type="text" value={doBucket} onChange={(e) => setDoBucket(e.target.value)} className="form-input" />
              </div>
            </div>

            <hr style={styles.divider} />

            {/* Amazon S3 */}
            <div style={styles.providerConfigCard}>
              <div style={styles.configHeader}>
                <h4 style={styles.configTitle}>Amazon S3 Configuration</h4>
                <a href="https://console.aws.amazon.com" target="_blank" rel="noopener noreferrer" style={styles.getKeysLink}>
                  GET KEYS
                </a>
              </div>
              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">S3 Bucket Name</label>
                  <input type="text" value={s3Bucket} onChange={(e) => setS3Bucket(e.target.value)} className="form-input" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">S3 Region</label>
                  <input type="text" value={s3Region} onChange={(e) => setS3Region(e.target.value)} className="form-input" placeholder="us-east-1" />
                </div>
              </div>
              <div style={{ ...styles.formRow, marginBottom: 0 }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Access Key ID</label>
                  <input type="text" value={s3Key} onChange={(e) => setS3Key(e.target.value)} className="form-input" />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Secret Access Key</label>
                  <input type="password" value={s3Secret} onChange={(e) => setS3Secret(e.target.value)} className="form-input" />
                </div>
              </div>
            </div>

            <hr style={styles.divider} />

            {/* Google Cloud */}
            <div style={styles.providerConfigCard}>
              <div style={styles.configHeader}>
                <h4 style={styles.configTitle}>Google Cloud Storage Configuration (S3 HMAC)</h4>
                <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" style={styles.getKeysLink}>
                  GET KEYS
                </a>
              </div>
              <div className="form-group">
                <label className="form-label">GCS Bucket Name</label>
                <input type="text" value={gcsBucket} onChange={(e) => setGcsBucket(e.target.value)} className="form-input" />
              </div>
              <div style={{ ...styles.formRow, marginBottom: 0 }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">GCS HMAC Access Key</label>
                  <input type="text" value={gcsKey} onChange={(e) => setGcsKey(e.target.value)} className="form-input" />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">GCS HMAC Secret Key</label>
                  <input type="password" value={gcsSecret} onChange={(e) => setGcsSecret(e.target.value)} className="form-input" />
                </div>
              </div>
            </div>

            <hr style={styles.divider} />

            {/* Backblaze B2 */}
            <div style={{ ...styles.providerConfigCard, marginBottom: "32px" }}>
              <div style={styles.configHeader}>
                <h4 style={styles.configTitle}>Backblaze B2 (S3 API) Configuration</h4>
                <a href="https://secure.backblaze.com" target="_blank" rel="noopener noreferrer" style={styles.getKeysLink}>
                  GET KEYS
                </a>
              </div>
              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">B2 Bucket Name</label>
                  <input type="text" value={b2Bucket} onChange={(e) => setB2Bucket(e.target.value)} className="form-input" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">B2 S3 Endpoint</label>
                  <input type="text" value={b2Endpoint} onChange={(e) => setB2Endpoint(e.target.value)} className="form-input" placeholder="s3.us-west-004.backblazeb2.com" />
                </div>
              </div>
              <div style={{ ...styles.formRow, marginBottom: 0 }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">B2 Application Key ID</label>
                  <input type="text" value={b2KeyId} onChange={(e) => setB2KeyId(e.target.value)} className="form-input" />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">B2 Application Key</label>
                  <input type="password" value={b2Key} onChange={(e) => setB2Key(e.target.value)} className="form-input" />
                </div>
              </div>
            </div>

            <button type="submit" style={styles.saveBtn} disabled={loading}>
              <Save size={16} style={{ marginRight: 8 }} />
              Save Storage Settings
            </button>
          </form>
        );

      case "backup":
        return (
          <div style={styles.form}>
            <h3 style={styles.sectionTitle}>Backup & Restore</h3>
            <p style={styles.sectionDesc}>Download database collections as a backup JSON file or upload one to restore data.</p>
            
            <div style={styles.backupActions}>
              <button onClick={handleExportData} style={styles.exportBtn} type="button">
                <Download size={18} style={{ marginRight: 8 }} />
                Export Backup JSON
              </button>
              
              <div style={styles.importWrapper}>
                <label style={styles.importLabel}>
                  <Upload size={18} style={{ marginRight: 8 }} />
                  Upload & Restore Backup
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImportData} 
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>
          </div>
        );

      case "mobile":
        return (
          <div style={{ ...styles.form, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", textAlign: "center" }}>
            <div style={{ padding: "20px", borderRadius: "50%", backgroundColor: "#f1f5f9", marginBottom: "24px" }}>
              <Smartphone size={48} color="#64748b" />
            </div>
            <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>Mobile App Integration</h3>
            <p style={{ fontSize: "15px", color: "#64748b", maxWidth: "400px", lineHeight: "1.6", margin: "0 auto" }}>
              Native Android and iOS applications are currently under development and will be available in an upcoming update!
            </p>
            <div style={{ marginTop: "32px", padding: "8px 16px", borderRadius: "20px", backgroundColor: "#e0e7ff", color: "#4f46e5", fontWeight: "600", fontSize: "14px" }}>
              Coming Soon
            </div>
          </div>
        );

      case "auth":
        return (
          <form onSubmit={handleSaveAuth} style={styles.form}>
            <h3 style={styles.sectionTitle}>Authentication Configuration</h3>
            <p style={styles.sectionDesc}>Configure active sign-in methods for storefront customer authentication and link your Firebase configuration.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Email Switch */}
              <div style={styles.authProviderRow}>
                <div style={styles.adInfo}>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Email & Password Authentication</span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Allow users to sign up and log in using an email and password.</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setEnableEmail(!enableEmail)}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: enableEmail ? "var(--primary)" : "#cbd5e1",
                  }}
                >
                  {enableEmail ? "Enabled" : "Disabled"}
                </button>
              </div>

              {/* Phone Switch */}
              <div style={styles.authProviderRow}>
                <div style={styles.adInfo}>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Phone Number Authentication</span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Allow users to sign up and log in using their phone number with OTP verification.</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setEnablePhone(!enablePhone)}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: enablePhone ? "var(--primary)" : "#cbd5e1",
                  }}
                >
                  {enablePhone ? "Enabled" : "Disabled"}
                </button>
              </div>

              {/* Google Switch */}
              <div style={styles.authProviderRow}>
                <div style={styles.adInfo}>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Google Single Sign-On (SSO)</span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Enable OAuth login using Google Accounts.</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setEnableGoogle(!enableGoogle)}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: enableGoogle ? "var(--primary)" : "#cbd5e1",
                  }}
                >
                  {enableGoogle ? "Enabled" : "Disabled"}
                </button>
              </div>

              {/* Facebook Switch */}
              <div style={styles.authProviderRow}>
                <div style={styles.adInfo}>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Facebook Login</span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Enable OAuth login using Facebook profiles.</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setEnableFacebook(!enableFacebook)}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: enableFacebook ? "var(--primary)" : "#cbd5e1",
                  }}
                >
                  {enableFacebook ? "Enabled" : "Disabled"}
                </button>
              </div>

              {/* Apple Switch */}
              <div style={styles.authProviderRow}>
                <div style={styles.adInfo}>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Sign in with Apple</span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Enable OAuth login using Apple IDs.</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setEnableApple(!enableApple)}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: enableApple ? "var(--primary)" : "#cbd5e1",
                  }}
                >
                  {enableApple ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>

            <hr style={styles.divider} />

            <div style={styles.authFlexLayout}>
              {/* Config Form Card */}
              <div style={styles.authConfigLeftCard}>
                <h4 style={styles.subSectionTitle}>Firebase Configuration</h4>
                <p style={styles.subSectionDesc}>Required for Authentication to work. Paste your web config object below.</p>
                
                <div className="form-group">
                  <label className="form-label">Config Object</label>
                  <textarea
                    rows={8}
                    value={firebaseConfig}
                    onChange={(e) => setFirebaseConfig(e.target.value)}
                    placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "...",\n  projectId: "...",\n  storageBucket: "...",\n  messagingSenderId: "...",\n  appId: "..."\n};`}
                    style={{ ...styles.textareaCode, width: "100%", height: "180px", fontFamily: "monospace" }}
                  />
                </div>
              </div>

              {/* Setup Instructions Card */}
              <div style={styles.authConfigRightCard}>
                <h4 style={styles.subSectionTitle}>Setup Instructions</h4>
                
                <div style={styles.instructionsContainer}>
                  <div style={styles.instructionStep}>
                    <div style={styles.stepNum}>1</div>
                    <div>
                      <h5 style={styles.stepTitle}>Firebase Setup</h5>
                      <ul style={styles.stepList}>
                        <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" style={styles.instructionLink}>Firebase Console</a>.</li>
                        <li>Create or select your project.</li>
                        <li>Add a Web App and copy the <code>firebaseConfig</code> object to the box on the left.</li>
                        <li>Go to <strong>Authentication &gt; Sign-in method</strong> to enable the sign-in providers you selected above.</li>
                        <li><strong>For Phone Auth:</strong> You must also go to <strong>Authentication &gt; Settings &gt; SMS Region</strong> and explicitly allow the countries where you will send SMS codes (otherwise you will get an <code>auth/operation-not-allowed</code> error).</li>
                      </ul>
                    </div>
                  </div>

                  <div style={styles.instructionStep}>
                    <div style={styles.stepNum}>2</div>
                    <div>
                      <h5 style={styles.stepTitle}>Domain Authorization</h5>
                      <p style={styles.stepText}>
                        You must authorize your domain in the settings of Facebook, Apple, and Google OAuth consoles so they trust authentication requests from your website:
                      </p>
                      <ul style={styles.stepList}>
                        <li><strong>Facebook Developer Portal:</strong> Add your domain to the App Domains list and configure Facebook Login redirect URIs.</li>
                        <li><strong>Google Cloud Console OAuth page:</strong> Add your domain to the "Authorized JavaScript origins" and "Authorized redirect URIs" list.</li>
                        <li><strong>Apple Developer Portal:</strong> Register your website under Services IDs and verify domains with the Apple validation files.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" style={{ ...styles.saveBtn, marginTop: "24px" }} disabled={loading}>
              <Save size={16} style={{ marginRight: 8 }} />
              {loading ? "Saving Authentication Settings..." : "Save Authentication Settings"}
            </button>
          </form>
        );

      case "email":
        const renderVar = (v: string) => (
          <span style={{ backgroundColor: "#e2e8f0", color: "#475569", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", marginRight: "6px", fontFamily: "monospace", display: "inline-block", marginBottom: "4px" }}>
            {v}
          </span>
        );
        const codeEditorStyle: React.CSSProperties = {
          resize: "vertical", 
          fontFamily: "'Fira Code', 'Courier New', Courier, monospace", 
          backgroundColor: "#0f172a", 
          color: "#e2e8f0", 
          padding: "16px", 
          borderRadius: "8px", 
          border: "1px solid #1e293b", 
          fontSize: "13px", 
          lineHeight: "1.6",
          width: "100%",
          outline: "none"
        };
        return (
          <form onSubmit={handleSaveEmail} style={styles.form}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{ backgroundColor: "#d31e2815", padding: "10px", borderRadius: "10px", color: "#d31e28" }}>
                <Mail size={24} />
              </div>
              <h3 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Email Configuration</h3>
            </div>
            <p style={{ ...styles.sectionDesc, marginBottom: "24px" }}>Configure how transactional emails are sent to your customers.</p>
            
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px", marginBottom: "32px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Mail Delivery Method</label>
                <select 
                  value={mailMethod} 
                  onChange={(e) => setMailMethod(e.target.value as any)} 
                  className="form-select"
                  style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1" }}
                >
                  <option value="smtp">SMTP Server (Recommended - Requires Login Credentials)</option>
                  <option value="sendmail">Sendmail (Server default auto-send)</option>
                </select>
              </div>

              {mailMethod === "smtp" && (
                <div style={{ backgroundColor: "#f8fafc", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#334155", marginTop: 0, marginBottom: "16px" }}>SMTP Credentials</h4>
                  <div style={styles.row}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">SMTP Host</label>
                      <input 
                        type="text" 
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        className="form-input" 
                        placeholder="e.g. smtp.gmail.com"
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">SMTP Port</label>
                      <input 
                        type="number" 
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(e.target.value)}
                        className="form-input" 
                        placeholder="e.g. 587"
                      />
                    </div>
                  </div>

                  <div style={styles.row}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">SMTP Username</label>
                      <input 
                        type="text" 
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        className="form-input" 
                        placeholder="e.g. hello@snapshop.com"
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">SMTP Password</label>
                      <input 
                        type="password" 
                        value={smtpPass}
                        onChange={(e) => setSmtpPass(e.target.value)}
                        className="form-input" 
                        placeholder="••••••••••••"
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Encryption Protocol</label>
                    <select 
                      value={encryption} 
                      onChange={(e) => setEncryption(e.target.value as any)} 
                      className="form-select"
                    >
                      <option value="none">None</option>
                      <option value="ssl">SSL (Port 465)</option>
                      <option value="tls">TLS (Port 587)</option>
                    </select>
                  </div>
                </div>
              )}

              <div style={styles.row}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Sender Name (From Name)</label>
                  <input 
                    type="text" 
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    className="form-input" 
                    placeholder="e.g. SnapShop Support"
                  />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Sender Email (From Email)</label>
                  <input 
                    type="email" 
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="form-input" 
                    placeholder="e.g. noreply@snapshop.com"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "40px", marginBottom: "8px" }}>
              <div style={{ backgroundColor: "#0f172a15", padding: "10px", borderRadius: "10px", color: "#0f172a" }}>
                <Code size={24} />
              </div>
              <h3 style={{ ...styles.sectionTitle, marginBottom: 0 }}>HTML Templates Editor</h3>
            </div>
            <p style={{ ...styles.sectionDesc, marginBottom: "24px" }}>Fully customize the raw HTML sent to your customers. Our powerful editor supports dynamic variables to personalize every email.</p>

            <div style={{ display: "grid", gap: "24px" }}>
              {/* Welcome Email */}
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>Welcome Email</h4>
                </div>
                <div style={{ padding: "20px" }}>
                  <textarea 
                    value={welcomeEmailTemplate}
                    onChange={(e) => setWelcomeEmailTemplate(e.target.value)}
                    placeholder="Enter HTML template here..."
                    rows={12}
                    style={codeEditorStyle}
                  />
                  <div style={{ marginTop: "12px" }}>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "8px" }}>Available Variables:</span>
                    <div>{renderVar("{{username}}")}{renderVar("{{storeName}}")}{renderVar("{{storeUrl}}")}</div>
                  </div>
                </div>
              </div>

              {/* Order Confirmation */}
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>Order Confirmation</h4>
                </div>
                <div style={{ padding: "20px" }}>
                  <textarea 
                    value={orderConfirmationTemplate}
                    onChange={(e) => setOrderConfirmationTemplate(e.target.value)}
                    placeholder="Enter HTML template here..."
                    rows={12}
                    style={codeEditorStyle}
                  />
                  <div style={{ marginTop: "12px" }}>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "8px" }}>Available Variables:</span>
                    <div>{renderVar("{{orderId}}")}{renderVar("{{storeName}}")}{renderVar("{{storeUrl}}")}{renderVar("{{itemsHtml}}")}{renderVar("{{customerName}}")}{renderVar("{{customerAddress}}")}{renderVar("{{customerCity}}")}{renderVar("{{customerPostalCode}}")}</div>
                  </div>
                </div>
              </div>

              {/* Order Processing */}
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>Order Status: Processing</h4>
                </div>
                <div style={{ padding: "20px" }}>
                  <textarea 
                    value={orderProcessingTemplate}
                    onChange={(e) => setOrderProcessingTemplate(e.target.value)}
                    placeholder="Enter HTML template here..."
                    rows={12}
                    style={codeEditorStyle}
                  />
                  <div style={{ marginTop: "12px" }}>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "8px" }}>Available Variables:</span>
                    <div>{renderVar("{{orderId}}")}{renderVar("{{status}}")}{renderVar("{{storeName}}")}{renderVar("{{storeUrl}}")}</div>
                  </div>
                </div>
              </div>

              {/* Order Shipped */}
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>Order Status: Shipped</h4>
                </div>
                <div style={{ padding: "20px" }}>
                  <textarea 
                    value={orderShippedTemplate}
                    onChange={(e) => setOrderShippedTemplate(e.target.value)}
                    placeholder="Enter HTML template here..."
                    rows={12}
                    style={codeEditorStyle}
                  />
                  <div style={{ marginTop: "12px" }}>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "8px" }}>Available Variables:</span>
                    <div>{renderVar("{{orderId}}")}{renderVar("{{status}}")}{renderVar("{{storeName}}")}{renderVar("{{storeUrl}}")}{renderVar("{{trackingNumber}}")}</div>
                  </div>
                </div>
              </div>

              {/* Order Delivered */}
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>Order Status: Delivered</h4>
                </div>
                <div style={{ padding: "20px" }}>
                  <textarea 
                    value={orderDeliveredTemplate}
                    onChange={(e) => setOrderDeliveredTemplate(e.target.value)}
                    placeholder="Enter HTML template here..."
                    rows={12}
                    style={codeEditorStyle}
                  />
                  <div style={{ marginTop: "12px" }}>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "8px" }}>Available Variables:</span>
                    <div>{renderVar("{{orderId}}")}{renderVar("{{status}}")}{renderVar("{{storeName}}")}{renderVar("{{storeUrl}}")}</div>
                  </div>
                </div>
              </div>

              {/* Order Cancelled */}
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>Order Status: Cancelled</h4>
                </div>
                <div style={{ padding: "20px" }}>
                  <textarea 
                    value={orderCancelledTemplate}
                    onChange={(e) => setOrderCancelledTemplate(e.target.value)}
                    placeholder="Enter HTML template here..."
                    rows={12}
                    style={codeEditorStyle}
                  />
                  <div style={{ marginTop: "12px" }}>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "8px" }}>Available Variables:</span>
                    <div>{renderVar("{{orderId}}")}{renderVar("{{status}}")}{renderVar("{{storeName}}")}{renderVar("{{storeUrl}}")}</div>
                  </div>
                </div>
              </div>

              {/* Password Reset */}
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>Password Reset</h4>
                </div>
                <div style={{ padding: "20px" }}>
                  <textarea 
                    value={passwordResetTemplate}
                    onChange={(e) => setPasswordResetTemplate(e.target.value)}
                    placeholder="Enter HTML template here..."
                    rows={12}
                    style={codeEditorStyle}
                  />
                  <div style={{ marginTop: "12px" }}>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "8px" }}>Available Variables:</span>
                    <div>{renderVar("{{resetUrl}}")}{renderVar("{{storeName}}")}{renderVar("{{storeUrl}}")}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ position: "sticky", bottom: "20px", zIndex: 10, marginTop: "40px", backgroundColor: "white", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
              <button type="submit" style={{ ...styles.saveBtn, width: "100%", margin: 0 }} disabled={loading}>
                <Save size={18} style={{ marginRight: 8 }} />
                {loading ? "Saving Email Settings..." : "Save Email Configuration"}
              </button>
            </div>
          </form>
        );

      case "general":
      default:
        return (
          <form onSubmit={handleSaveGeneral} style={styles.form}>
            <h3 style={styles.sectionTitle}>General configurations</h3>
            
            <div className="form-group" style={{ marginBottom: "18px" }}>
              <label className="form-label">Website Link</label>
              <input 
                type="text" 
                value={websiteLink}
                onChange={(e) => setWebsiteLink(e.target.value)}
                className="form-input" 
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: "18px" }}>
              <label className="form-label">Product URL Format</label>
              <select 
                value={productUrlFormat}
                onChange={(e) => setProductUrlFormat(e.target.value)}
                className="form-input" 
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "#fff" }}
              >
                <option value="id">Product Database ID (e.g. /product/6a31...)</option>
                <option value="slug">Product Name / Slug (e.g. /product/classic-shirt-dress)</option>
              </select>
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Store Name</label>
                <input 
                  type="text" 
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="form-input" 
                  required 
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Contact Email</label>
                <input 
                  type="email" 
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  className="form-input" 
                  required 
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Website Logo</label>
                <div style={{ position: 'relative', width: '100%', height: '140px', border: '2px dashed #cbd5e1', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', transition: 'all 0.2s', overflow: 'hidden' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUploadImage(e.target.files[0], logoUrl, setLogoUrl, "logo");
                      }
                    }}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10, width: '100%', height: '100%' }}
                  />
                  {logoUrl ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 5 }}>
                      <img src={logoUrl} alt="Logo" style={{ height: '60px', objectFit: 'contain' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
                        <RefreshCw size={14} /> Click to replace logo
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Upload size={20} color="#64748b" />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#334155' }}>Click to upload logo</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>SVG, PNG, JPG (Max 2MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Website Favicon</label>
                <div style={{ position: 'relative', width: '100%', height: '140px', border: '2px dashed #cbd5e1', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', transition: 'all 0.2s', overflow: 'hidden' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUploadImage(e.target.files[0], faviconUrl, setFaviconUrl, "favicon");
                      }
                    }}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10, width: '100%', height: '100%' }}
                  />
                  {faviconUrl ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 5 }}>
                      <img src={faviconUrl} alt="Favicon" style={{ height: '60px', objectFit: 'contain' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
                        <RefreshCw size={14} /> Click to replace favicon
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Upload size={20} color="#64748b" />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#334155' }}>Click to upload favicon</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Square format SVG, PNG, ICO (Max 1MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Currency Symbol (e.g. $, MAD)</label>
                <input 
                  type="text" 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="form-input" 
                  required 
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Shipping Cost</label>
                <input 
                  type="number" 
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  className="form-input" 
                  required 
                />
              </div>
            </div>

            <hr style={styles.divider} />

            <h3 style={styles.sectionTitle}>Promotions & Countdown</h3>



            <div className="form-group">
              <label className="form-label">Hero Banner Title</label>
              <input 
                type="text" 
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="form-input" 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hero Banner Subtitle</label>
              <textarea 
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="form-input" 
                style={{ height: "70px", resize: "vertical" }}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hero Banner Image</label>
              <div style={{ position: 'relative', width: '100%', height: '180px', border: '2px dashed #cbd5e1', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', transition: 'all 0.2s', overflow: 'hidden' }}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleUploadImage(e.target.files[0], heroImageUrl || "", setHeroImageUrl, "heroBanner");
                    }
                  }}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10, width: '100%', height: '100%' }}
                />
                {heroImageUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 5 }}>
                    <img src={heroImageUrl} alt="Hero Banner" style={{ height: '100px', objectFit: 'contain', borderRadius: '8px' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
                      <RefreshCw size={14} /> Click to replace hero image
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload size={20} color="#64748b" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#334155' }}>Click to upload hero image</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>SVG, PNG, JPG (Max 5MB)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label">Hero Countdown Target Date & Time</label>
              <input 
                type="datetime-local" 
                value={heroCountdownDate}
                onChange={(e) => setHeroCountdownDate(e.target.value)}
                className="form-input" 
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label">Store Shipping Policy</label>
              <textarea 
                value={shippingPolicy}
                onChange={(e) => setShippingPolicy(e.target.value)}
                className="form-input" 
                style={{ height: "80px", resize: "vertical" }}
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label">Store Returns Policy</label>
              <textarea 
                value={returnsPolicy}
                onChange={(e) => setReturnsPolicy(e.target.value)}
                className="form-input" 
                style={{ height: "80px", resize: "vertical" }}
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: "32px" }}>
              <label className="form-label">Store Size Guide Content</label>
              <textarea 
                value={sizeGuideContent}
                onChange={(e) => setSizeGuideContent(e.target.value)}
                className="form-input" 
                style={{ height: "100px", resize: "vertical" }}
                required 
              />
            </div>

            <button 
              type="submit" 
              style={styles.saveBtn}
              disabled={loading}
            >
              <Save size={16} style={{ marginRight: 8 }} />
              {loading ? "Updating Settings..." : "Save Configurations"}
            </button>
          </form>
        );
    }
  };

  return (
    <div style={styles.container}>
      <div>
        <h2 style={styles.title}>System Settings</h2>
        <p style={styles.subtitle}>Configure store parameters, branding, promotional campaigns, and countdown details.</p>
      </div>

      {success && (
        <div style={styles.successAlert} className="fade-in">
          <Check size={16} style={{ marginRight: 8 }} />
          Settings updated successfully!
        </div>
      )}

      {error && (
        <div style={styles.errorAlert} className="fade-in">
          <AlertTriangle size={16} style={{ marginRight: 8 }} />
          {error}
        </div>
      )}

      <div style={styles.card}>
        {renderActiveTabForm()}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    maxWidth: "800px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
    textTransform: "uppercase",
    marginBottom: "16px",
    letterSpacing: "0.5px",
  },
  sectionDesc: {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "20px",
    lineHeight: "1.4",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  formRow: {
    display: "flex",
    gap: "16px",
  },
  divider: {
    border: 0,
    borderTop: "1px solid #e2e8f0",
    margin: "24px 0",
  },
  successAlert: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    color: "#047857",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #a7f3d0",
    fontSize: "14px",
    fontWeight: "600",
  },
  errorAlert: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #fca5a5",
    fontSize: "14px",
    fontWeight: "600",
  },
  saveBtn: {
    height: "48px",
    backgroundColor: "#0f172a",
    color: "white",
    fontSize: "14px",
    fontWeight: "700",
    borderRadius: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    transition: "background-color 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  themeCard: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    padding: "16px",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left",
    width: "100%",
    border: "2px solid #e2e8f0",
  },
  themePreview: {
    width: "100%",
    height: "80px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: "12px",
    overflow: "hidden",
  },
  colorPickerContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  colorPicker: {
    width: "48px",
    height: "40px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    cursor: "pointer",
    padding: 0,
    backgroundColor: "transparent",
  },
  colorCodeText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
    fontFamily: "monospace",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#334155",
    cursor: "pointer",
    marginBottom: "10px",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    accentColor: "#0f172a",
  },
  backupActions: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    marginTop: "10px",
  },
  exportBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background-color 0.15s ease",
  },
  importWrapper: {
    position: "relative",
  },
  importLabel: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    border: "2px solid #0f172a",
    padding: "10px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  storageProviders: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },
  providerCard: {
    display: "flex",
    alignItems: "center",
    border: "1px solid var(--border-color)",
    padding: "12px 14px",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    transition: "all 0.2s",
    fontSize: "13px",
  },
  providerConfigCard: {
    padding: "20px",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    backgroundColor: "var(--bg-light)",
  },
  configHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  configTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  getKeysLink: {
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--primary)",
    textDecoration: "underline",
    cursor: "pointer",
  },
  subTabContainer: {
    display: "flex",
    gap: "20px",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "10px",
    marginBottom: "0px",
  },
  subTabButton: {
    fontSize: "14px",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    padding: "6px 4px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  subSectionTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0f172a",
  },
  subSectionDesc: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "4px",
    marginBottom: "16px",
    lineHeight: "1.4",
  },
  actionBtn: {
    padding: "0 18px",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  adRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "#f8fafc",
  },
  adInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  toggleBtn: {
    color: "white",
    fontSize: "12px",
    fontWeight: "700",
    padding: "8px 16px",
    borderRadius: "20px",
    textTransform: "uppercase",
    minWidth: "100px",
    textAlign: "center",
    transition: "background-color 0.2s",
  },
  gatewayConfigCard: {
    padding: "20px",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    backgroundColor: "var(--bg-light)",
  },
  modeSelect: {
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "600",
    borderRadius: "6px",
    border: "1px solid var(--border-color)",
    backgroundColor: "white",
    outline: "none",
  },
  addButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#0f172a",
    color: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  langTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "16px",
  },
  langTableHeader: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid #e2e8f0",
    fontSize: "13px",
    fontWeight: "700",
    color: "#475569",
  },
  langTableCell: {
    padding: "12px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "14px",
    verticalAlign: "middle",
  },
  flagImg: {
    width: "24px",
    height: "16px",
    borderRadius: "2px",
    objectFit: "cover",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  langBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "600",
  },
  defaultBadge: {
    backgroundColor: "#ecfdf5",
    color: "#047857",
    border: "1px solid #a7f3d0",
  },
  activeBadge: {
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
  },
  inactiveBadge: {
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "1px solid #cbd5e1",
  },
  iconBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    backgroundColor: "white",
    cursor: "pointer",
    transition: "all 0.2s",
    color: "#475569",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    width: "100%",
    maxWidth: "480px",
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
  },
  searchContainer: {
    position: "relative",
    marginBottom: "16px",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
  },
  searchInput: {
    width: "100%",
    padding: "10px 12px 10px 40px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
  },
  langList: {
    overflowY: "auto",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingRight: "4px",
  },
  langListItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  langInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoUploadGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
    marginTop: "8px",
    marginBottom: "24px",
  },
  logoUploadCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "16px",
    backgroundColor: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  logoCardHeader: {
    marginBottom: "12px",
  },
  logoCardTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
  },
  logoPreviewContainer: {
    width: "100%",
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    border: "1px dashed #cbd5e1",
    borderRadius: "8px",
    marginBottom: "12px",
    overflow: "hidden",
    padding: "8px",
  },
  logoPreviewImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
  logoPlaceholder: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: "500",
  },
  uploadBtnWrapper: {
    width: "100%",
  },
  logoUploadBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "8px 12px",
    backgroundColor: "white",
    color: "#0f172a",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  authProviderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "#f8fafc",
  },
  authFlexLayout: {
    display: "flex",
    gap: "24px",
    marginTop: "24px",
    flexWrap: "wrap",
  },
  authConfigLeftCard: {
    flex: "1 1 340px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#f8fafc",
  },
  authConfigRightCard: {
    flex: "1 1 340px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#f8fafc",
  },
  textareaCode: {
    padding: "10px 14px",
    fontSize: "13px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    outline: "none",
    resize: "vertical",
  },
  instructionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  instructionStep: {
    display: "flex",
    gap: "12px",
  },
  stepNum: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#0f172a",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    flexShrink: 0,
  },
  stepTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 6px 0",
  },
  stepList: {
    margin: 0,
    paddingLeft: "20px",
    fontSize: "13px",
    color: "#475569",
    lineHeight: "1.6",
  },
  stepText: {
    fontSize: "13px",
    color: "#475569",
    margin: "0 0 8px 0",
    lineHeight: "1.5",
  },
  instructionLink: {
    color: "#6366f1",
    textDecoration: "underline",
    fontWeight: "600",
  },
};
