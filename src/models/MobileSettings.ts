import mongoose, { Schema, model, models } from "mongoose";

const MobileSettingsSchema = new Schema(
  {
    mobileAppName: { type: String, default: "SnapShop" },
    webViewUrl: { type: String, default: "http://10.0.2.2:3000" },
    privacyPolicyLink: { type: String, default: "domain.com" },
    termsOfServiceLink: { type: String, default: "domain.com" },
    rateUsLink: { type: String, default: "domain.com" },
    forceUpdate: { type: Boolean, default: false },
    updateLink: { type: String, default: "domain.com" },
    targetVersionCode: { type: Number, default: 1 },
    enableGooglePlay: { type: Boolean, default: true },
    apiBaseUrl: { type: String, default: "localhost/api/mobile/v1" },
    apiAccessKey: { type: String, default: "snap_ak_jq1gdg3frymuzt5z" },

    adsProvider: { type: String, default: "Google AdMob" },
    admobAppId: { type: String, default: "ca-app-pub-3940256099942544~3347511713" },
    bannerAdEnabled: { type: Boolean, default: true },
    bannerAdUnitId: { type: String, default: "ca-app-pub-3940256099942544/6300978111" },
    interstitialAdEnabled: { type: Boolean, default: false },
    interstitialAdUnitId: { type: String, default: "ca-app-pub-3940256099942544/1033173712" },
    rewardedAdEnabled: { type: Boolean, default: true },
    rewardedAdUnitId: { type: String, default: "ca-app-pub-3940256099942544/5224354917" },
  },
  { timestamps: true }
);

const MobileSettings = models.MobileSettings || model("MobileSettings", MobileSettingsSchema);
export default MobileSettings;
