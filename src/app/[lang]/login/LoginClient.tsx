"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import PhoneInput from "@/components/PhoneInput";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";

export default function LoginClient({ initialSettings }: { initialSettings: any }) {
  const router = useRouter();
  const { setUser } = useApp();
  const settings = initialSettings;
  
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "unauthorized") {
      setError("You must be logged in as admin to access that page.");
    } else if (err) {
      setError(err);
    }
  }, [searchParams]);

  // Phone auth states
  const [phoneAuthActive, setPhoneAuthActive] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Clear verification states when toggling phone mode
  useEffect(() => {
    setOtpSent(false);
    setVerificationCode("");
    setConfirmationResult(null);
  }, [phoneAuthActive]);

  const showEmail = settings.enableEmail !== false;
  const showPhone = settings.enablePhone === true;
  const showGoogle = settings.enableGoogle === true;
  const showFacebook = settings.enableFacebook === true;
  const showApple = settings.enableApple === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      setUser({
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
        avatar: data.user.avatar,
        phone: data.user.phone,
        bio: data.user.bio,
        provider: data.user.provider,
        passwordSet: data.user.passwordSet,
      });

      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const initRecaptcha = (auth: any) => {
    if (typeof window === "undefined") return;
    try {
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {
            console.log("Recaptcha solved");
          }
        });
      }
      return (window as any).recaptchaVerifier;
    } catch (e) {
      console.error("Recaptcha init failed:", e);
      return null;
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    setError("");

    // Fallback to mock flow if Firebase config is missing
    if (!settings.firebaseConfig) {
      handleSocialLogin("phone");
      return;
    }

    try {
      const auth = getFirebaseAuth(settings.firebaseConfig);
      if (!auth) throw new Error("Could not initialize authentication client.");

      const verifier = initRecaptcha(auth);
      if (!verifier) throw new Error("Could not initialize verification validation.");

      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send verification code. Please check your phone number format (e.g. +1234567890).");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      return;
    }
    setLoading(true);
    setError("");

    try {
      if (!confirmationResult) throw new Error("No active verification session found.");
      const result = await confirmationResult.confirm(verificationCode);
      const firebaseUser = result.user;

      const res = await fetch("/api/auth/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: firebaseUser.phoneNumber,
          username: `phone_${firebaseUser.phoneNumber?.replace(/[^0-9]/g, "")}`,
          provider: "phone",
          uid: firebaseUser.uid,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Social authentication failed");

      setUser(data.user);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (providerName: string) => {
    setError("");
    setLoading(true);

    // Fallback to Mock Auth if Firebase is not configured
    if (!settings.firebaseConfig) {
      try {
        const res = await fetch("/api/auth/social", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: `mock_${providerName}@snapshop.com`,
            username: `Mock ${providerName.charAt(0).toUpperCase() + providerName.slice(1)} User`,
            provider: providerName,
            uid: `mock_uid_${Date.now()}`,
            phoneNumber: providerName === "phone" ? "+15550199" : undefined
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Mock authentication failed");

        setUser(data.user);
        router.push("/");
      } catch (err: any) {
        setError(err.message || "Failed to sign in");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const auth = getFirebaseAuth(settings.firebaseConfig);
      if (!auth) throw new Error("Could not initialize authentication client.");

      let result;
      if (providerName === "google") {
        const provider = new GoogleAuthProvider();
        result = await signInWithPopup(auth, provider);
      } else if (providerName === "facebook") {
        const provider = new FacebookAuthProvider();
        result = await signInWithPopup(auth, provider);
      } else if (providerName === "apple") {
        const provider = new OAuthProvider("apple.com");
        result = await signInWithPopup(auth, provider);
      } else {
        throw new Error("Invalid provider");
      }

      const firebaseUser = result.user;

      const res = await fetch("/api/auth/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: firebaseUser.email,
          username: firebaseUser.displayName,
          avatar: firebaseUser.photoURL,
          provider: providerName,
          uid: firebaseUser.uid,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Social authentication failed");

      setUser(data.user);
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || `Failed to sign in with ${providerName}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>LOG IN</h1>
        <p style={styles.subtitle}>Welcome back! Access your account.</p>

        {error && (
          <div style={styles.errorAlert}>
            {error}
          </div>
        )}

        {/* Dynamic Loading Message when Firebase Configuration is not set */}
        {!settings.firebaseConfig && (showGoogle || showFacebook || showApple || showPhone) && (
          <div style={styles.demoNotice}>
            <strong>Demo Mode Active:</strong> Firebase Config is empty. Social and Phone buttons will authenticate instantly using mock profiles.
          </div>
        )}


        {phoneAuthActive ? (
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
            <div className="form-group">
              <label className="form-label">{otpSent ? "Enter 6-Digit OTP Code" : "Phone Number"}</label>
              {!otpSent ? (
                <PhoneInput
                  value={phoneNumber}
                  onChange={(val) => setPhoneNumber(val)}
                  disabled={loading}
                  placeholder="612 345 678"
                />
              ) : (
                <input 
                  type="text" 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter code"
                  className="form-input"
                  required
                  disabled={loading}
                />
              )}
            </div>

            <div id="recaptcha-container"></div>

            <button 
              type="submit" 
              style={styles.submitBtn} 
              disabled={loading}
            >
              {loading ? "Processing..." : otpSent ? "Verify Code" : "Send OTP"}
            </button>
            
            <button 
              type="button" 
              onClick={() => setPhoneAuthActive(false)} 
              style={styles.cancelPhoneBtn}
              disabled={loading}
            >
              Cancel Phone Sign-in
            </button>
          </form>
        ) : (
          showEmail ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email or Username</label>
                <input 
                  type="text" 
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="Enter email or username"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: "24px" }}>
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="form-input"
                  required
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                  <Link href="/forgot-password" style={{ color: "var(--secondary)", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <button 
                type="submit" 
                style={styles.submitBtn} 
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Log In"}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "16px 0", fontSize: "14px" }}>
              Email & Password login is disabled. Please choose one of the options below.
            </div>
          )
        )}

        {/* Separator / Social Layout */}
        {(showGoogle || showFacebook || showApple || showPhone) && (
          <>
            <div style={styles.dividerRow}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>OR</span>
              <span style={styles.dividerLine} />
            </div>

            <div style={styles.socialButtonsContainer}>
              {showGoogle && (
                <button type="button" onClick={() => handleSocialLogin("google")} style={styles.socialBtn} disabled={loading}>
                  <svg style={styles.socialIcon} viewBox="0 0 24 24" width="18" height="18">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Continue with Google
                </button>
              )}

              {showFacebook && (
                <button type="button" onClick={() => handleSocialLogin("facebook")} style={styles.socialBtn} disabled={loading}>
                  <svg style={styles.socialIcon} viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </button>
              )}

              {showApple && (
                <button type="button" onClick={() => handleSocialLogin("apple")} style={styles.socialBtn} disabled={loading}>
                  <svg style={styles.socialIcon} viewBox="0 0 24 24" width="18" height="18" fill="#000000">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.74-1.2 1.88-1.05 2.99 1.11.09 2.27-.56 3-1.43z"/>
                  </svg>
                  Continue with Apple
                </button>
              )}

              {showPhone && !phoneAuthActive && (
                <button type="button" onClick={() => setPhoneAuthActive(true)} style={styles.socialBtn} disabled={loading}>
                  <svg style={styles.socialIcon} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                    <line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                  Continue with Phone
                </button>
              )}
            </div>
          </>
        )}

        <p style={styles.footerText}>
          Don't have an account?{" "}
          <Link href="/signup" style={styles.link}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "80px 24px",
    display: "flex",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "var(--radius-lg)",
    padding: "40px",
    boxShadow: "var(--shadow-md)",
    maxWidth: "460px",
    width: "100%",
    border: "1px solid var(--border-color)",
  },
  title: {
    fontSize: "24px",
    fontWeight: "800",
    color: "var(--secondary)",
    textAlign: "center",
    letterSpacing: "1px",
  },
  subtitle: {
    fontSize: "14px",
    color: "var(--text-muted)",
    textAlign: "center",
    marginBottom: "32px",
    marginTop: "4px",
  },
  errorAlert: {
    backgroundColor: "#fef2f2",
    color: "var(--primary)",
    border: "1px solid #fca5a5",
    padding: "12px 16px",
    borderRadius: "var(--radius-md)",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "20px",
  },
  demoNotice: {
    backgroundColor: "#eff6ff",
    color: "#1e40af",
    border: "1px solid #bfdbfe",
    padding: "10px 14px",
    borderRadius: "var(--radius-md)",
    fontSize: "13px",
    lineHeight: "1.4",
    marginBottom: "20px",
  },
  submitBtn: {
    width: "100%",
    height: "48px",
    backgroundColor: "var(--secondary)",
    color: "white",
    borderRadius: "var(--radius-md)",
    fontSize: "14px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    transition: "background-color 0.2s",
    cursor: "pointer",
    border: "none",
  },
  cancelPhoneBtn: {
    width: "100%",
    height: "48px",
    backgroundColor: "#f1f5f9",
    color: "#334155",
    borderRadius: "var(--radius-md)",
    fontSize: "14px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginTop: "10px",
    cursor: "pointer",
    border: "none",
  },
  dividerRow: {
    display: "flex",
    alignItems: "center",
    margin: "24px 0",
    gap: "10px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    fontSize: "12px",
    color: "var(--text-muted)",
    fontWeight: "700",
  },
  socialButtonsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  socialBtn: {
    width: "100%",
    height: "46px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e2e8f0",
    borderRadius: "var(--radius-md)",
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--secondary)",
    backgroundColor: "white",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  socialIcon: {
    marginRight: "10px",
  },
  footerText: {
    fontSize: "14px",
    color: "var(--text-muted)",
    textAlign: "center",
    marginTop: "24px",
  },
  link: {
    color: "var(--secondary)",
    fontWeight: "700",
    textDecoration: "underline",
  },
};
