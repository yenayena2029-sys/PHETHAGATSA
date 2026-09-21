import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export function getFirebaseAuth(configStr: string) {
  if (!configStr || !configStr.trim()) return null;
  try {
    // Clean up JS assignment styles if present, e.g., "const firebaseConfig = { ... };"
    let cleanConfig = configStr.trim();
    if (cleanConfig.includes("firebaseConfig =")) {
      cleanConfig = cleanConfig.split("firebaseConfig =")[1].trim();
    }
    if (cleanConfig.endsWith(";")) {
      cleanConfig = cleanConfig.substring(0, cleanConfig.length - 1).trim();
    }
    
    // Safely parse JS object literal on the client side
    const config = new Function(`return ${cleanConfig}`)();
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    return getAuth(app);
  } catch (e) {
    console.error("Firebase initialization failed:", e);
    return null;
  }
}
