import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getSettings } from "@/lib/settings";

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    // Parse key from query parameters or Authorization header
    const { searchParams } = new URL(req.url);
    const keyQuery = searchParams.get("key");
    
    const authHeader = req.headers.get("authorization");
    let keyHeader = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      keyHeader = authHeader.substring(7);
    }
    
    const token = keyQuery || keyHeader;
    
    const settings = await getSettings();
    
    // Authenticate the request
    if (!token || token !== settings.apiAccessKey) {
      return NextResponse.json({ error: "Unauthorized. Invalid API Access Key." }, { status: 401 });
    }
    
    // Return configurations for the Android app
    return NextResponse.json({
      mobileAppName: settings.mobileAppName,
      webViewUrl: settings.webViewUrl,
      websiteLink: settings.websiteLink,
      privacyPolicyLink: settings.privacyPolicyLink,
      termsOfServiceLink: settings.termsOfServiceLink,
      rateUsLink: settings.rateUsLink,
      forceUpdate: settings.forceUpdate,
      updateLink: settings.updateLink,
      targetVersionCode: settings.targetVersionCode,
      enableGooglePlay: settings.enableGooglePlay,
      ads: {
        adsProvider: settings.adsProvider,
        admobAppId: settings.admobAppId,
        bannerAdEnabled: settings.bannerAdEnabled,
        bannerAdUnitId: settings.bannerAdUnitId,
        interstitialAdEnabled: settings.interstitialAdEnabled,
        interstitialAdUnitId: settings.interstitialAdUnitId,
        rewardedAdEnabled: settings.rewardedAdEnabled,
        rewardedAdUnitId: settings.rewardedAdUnitId,
      }
    }, { status: 200 });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch mobile settings" }, { status: 500 });
  }
}
