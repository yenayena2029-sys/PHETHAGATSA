"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ALL_CURRENCIES } from "@/lib/currenciesList";
import { COUNTRIES } from "@/lib/countries";
import {
  User, Package, MapPin, RotateCcw, CreditCard, Settings, Heart,
  ChevronRight, Camera, Trash2, Eye, EyeOff, Save, Plus, Edit3, X,
  Clock, CheckCircle, Truck, AlertCircle, Star, ShoppingBag, Loader2
} from "lucide-react";

/* ──────────────────────────── types ──────────────────────────── */
type Tab = "profile" | "orders" | "addresses" | "returns" | "refunds" | "preferences" | "wishlist";

interface Order {
  _id: string;
  items: { name: string; quantity: number; price: number; image?: string }[];
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

interface Address {
  _id?: string;
  id?: string;
  label: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const validTabs: Tab[] = ["profile", "orders", "addresses", "returns", "refunds", "preferences", "wishlist"];

interface AccountClientProps {
  initialTab?: Tab;
}

/* ──────────────────────────── component ──────────────────────── */
export default function AccountClient({ initialTab = "profile" }: AccountClientProps) {
  const { user, logout, t, settings, loading, getProductLink, setUser } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab && validTabs.includes(initialTab) ? initialTab : "profile");

  useEffect(() => {
    if (initialTab && validTabs.includes(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tabKey: Tab) => {
    setActiveTab(tabKey);
    let localePrefix = "";
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.split("/");
      const firstPart = parts[1];
      const locales = [
        "en", "ar", "fr", "es", "de", "it", "pt", "ru", "zh", "ja", "ko", "tr", "nl",
        "hi", "bn", "pa", "vi", "pl", "uk", "ro", "el", "cs", "hu", "sv", "id", "ms",
        "th", "fa", "he", "no", "da", "fi", "sk", "bg", "hr", "sr", "lt", "lv", "et",
        "sl", "ga", "mt", "is", "al", "ge", "am", "az", "kk", "uz", "tl", "ur"
      ];
      if (locales.includes(firstPart)) {
        localePrefix = `/${firstPart}`;
      }
    }
    router.push(`${localePrefix}/account/${tabKey}`);
  };

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddr, setEditingAddr] = useState<string | null>(null);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addrForm, setAddrForm] = useState<Address | null>(null);
  const [addrSaving, setAddrSaving] = useState(false);

  // Preferences state
  const [newsletter, setNewsletter] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [currency, setCurrencyPref] = useState("USD");
  const [theme, setTheme] = useState("light");
  const [prefSaving, setPrefSaving] = useState(false);

  // Wishlist state
  const [wishlist, setWishlist] = useState<any[]>([]);

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [saveMsg, setSaveMsg] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const isSocialAccountWithoutPassword =
    user?.passwordSet === false ||
    ["google", "facebook", "apple", "phone", "social"].includes((user?.provider || "").toLowerCase());

  useEffect(() => {
    if (user) {
      setDisplayName(user.username || "");
      setPhone(user.phone || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatar || null);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "orders" && user) {
      setOrdersLoading(true);
      fetch("/api/account/orders")
        .then((r) => r.ok ? r.json() : r.text().then(t => { throw new Error(t) }))
        .then((data) => {
          setOrders(Array.isArray(data) ? data : data.orders || []);
        })
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === "addresses" && user) {
      setAddressesLoading(true);
      fetch("/api/account/addresses")
        .then((r) => r.ok ? r.json() : r.text().then(t => { throw new Error(t) }))
        .then((data) => {
          setAddresses(Array.isArray(data) ? data : []);
        })
        .catch(() => setAddresses([]))
        .finally(() => setAddressesLoading(false));
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === "preferences" && user) {
      fetch("/api/account/preferences")
        .then((r) => r.ok ? r.json() : r.text().then(t => { throw new Error(t) }))
        .then((data) => {
          if (data.preferredCurrency) setCurrencyPref(data.preferredCurrency);
          if (data.theme) {
            setTheme(data.theme);
            if (typeof document !== "undefined") {
              document.documentElement.setAttribute("data-theme", data.theme);
              document.cookie = `store_theme=${data.theme}; path=/; max-age=${60*60*24*365}`;
            }
          }
          if (data.newsletter !== undefined) setNewsletter(data.newsletter);
          if (data.orderUpdates !== undefined) setOrderUpdates(data.orderUpdates);
          if (data.promotionalOffers !== undefined) setPromotions(data.promotionalOffers);
        })
        .catch(() => {});
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === "wishlist") {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("wishlist");
        if (stored) {
          try {
            setWishlist(JSON.parse(stored));
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  }, [activeTab]);

  // Show loading spinner if app state is loading user session
  if (loading) {
    return (
      <div style={{ ...s.emptyState, minHeight: "50vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Loader2 className="animate-spin" size={40} style={{ color: "var(--secondary)" }} />
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return (
      <div style={s.emptyState}>
        <User size={56} style={{ color: "var(--text-muted)", marginBottom: 16 }} />
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Please Sign In</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>You need to be logged in to access your account.</p>
        <button onClick={() => router.push("/login")} style={s.primaryBtn}>Go to Login</button>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profile", icon: <User size={18} /> },
    { key: "orders", label: "Orders", icon: <Package size={18} /> },
    { key: "addresses", label: "Addresses", icon: <MapPin size={18} /> },
    { key: "returns", label: "Returns", icon: <RotateCcw size={18} /> },
    { key: "refunds", label: "Refunds", icon: <CreditCard size={18} /> },
    { key: "preferences", label: "Preferences", icon: <Settings size={18} /> },
    { key: "wishlist", label: "Wishlist", icon: <Heart size={18} /> },
  ];

  const flash = (msg: string) => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const saveProfile = async () => {
    if (!displayName.trim()) {
      flash("Display name is required");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: displayName, phone, bio }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile");
      }
      if (data?.user) {
        setUser({
          id: data.user._id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role,
          avatar: data.user.avatar,
          phone: data.user.phone,
          bio: data.user.bio,
          provider: data.user.provider,
          passwordSet: data.user.passwordSet,
        });
      }
      flash("Profile saved successfully!");
    } catch (e: any) {
      flash(e.message || "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      flash("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      flash("Passwords do not match");
      return;
    }
    if (!isSocialAccountWithoutPassword && !oldPassword) {
      flash("Current password is required");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: isSocialAccountWithoutPassword ? undefined : oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
      if (user) setUser({ ...user, passwordSet: true });
      flash("Password updated!");
    } catch (e: any) {
      flash(e.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/upload/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setAvatarUrl(data.url);
        if (user) setUser({ ...user, avatar: data.url });
        flash("Profile photo updated!");
      } else {
        flash(data.error || "Upload failed");
      }
    } catch {
      flash("Upload failed. Please try again.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarUploading(true);
    try {
      await fetch("/api/upload/avatar", { method: "DELETE" });
      setAvatarUrl(null);
      if (user) setUser({ ...user, avatar: "" });
      flash("Profile photo removed.");
    } catch {
      flash("Could not remove photo.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered" || s === "completed") return "#10b981";
    if (s === "shipped" || s === "processing") return "#3b82f6";
    if (s === "pending") return "#f59e0b";
    if (s === "cancelled" || s === "canceled") return "#ef4444";
    return "var(--text-muted)";
  };

  const getStatusIcon = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered" || s === "completed") return <CheckCircle size={14} />;
    if (s === "shipped") return <Truck size={14} />;
    if (s === "processing") return <Clock size={14} />;
    if (s === "pending") return <AlertCircle size={14} />;
    return <Package size={14} />;
  };

  const initial = user.username?.charAt(0)?.toUpperCase() || "U";

  /* ────────────── Tab Content Renderers ────────────── */

  const renderProfile = () => (
    <div>
      <h2 style={s.tabTitle}>Profile Details</h2>
      <p style={s.tabDesc}>Manage your personal information and account settings.</p>

      {/* Avatar Section */}
      <div style={s.avatarSection}>
        <div style={s.avatarCircle}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" style={s.avatarImg} />
          ) : (
            <span style={s.avatarInitial}>{initial}</span>
          )}
        </div>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{user.username}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 12 }}>{user.email}</p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{ ...s.uploadBtn, opacity: avatarUploading ? 0.6 : 1, cursor: avatarUploading ? "not-allowed" : "pointer" }}>
              <Camera size={14} style={{ marginRight: 6 }} />
              {avatarUploading ? "Uploading..." : "Upload Photo"}
              <input type="file" accept="image/*" hidden onChange={handleAvatarUpload} disabled={avatarUploading} />
            </label>
            {avatarUrl && (
              <button onClick={handleAvatarRemove} disabled={avatarUploading} style={s.removeBtn}>
                <Trash2 size={14} style={{ marginRight: 4 }} /> Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div style={s.formGrid}>
        <div style={s.formGroup}>
          <label style={s.label}>Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={s.input}
            placeholder="Your display name"
          />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Email Address</label>
          <input type="email" value={user.email} disabled style={{ ...s.input, opacity: 0.6, cursor: "not-allowed" }} />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={s.input}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div style={{ ...s.formGroup, gridColumn: "1 / -1" }}>
          <label style={s.label}>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{ ...s.input, minHeight: 80, resize: "vertical" }}
            placeholder="Tell us a little about yourself..."
          />
        </div>
      </div>

      {/* Password Section */}
      <div style={s.passwordSection}>
        <button onClick={() => setShowPasswordSection(!showPasswordSection)} style={s.changePassBtn}>
          {showPasswordSection ? "Cancel Password Change" : isSocialAccountWithoutPassword ? "Set Password" : "Change Password"}
        </button>
        {showPasswordSection && (
          <div style={{ ...s.formGrid, marginTop: 16 }}>
            {!isSocialAccountWithoutPassword ? (
              <div style={s.formGroup}>
                <label style={s.label}>Current Password</label>
                <div style={s.passWrap}>
                  <input
                    type={showOld ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    style={{ ...s.input, paddingRight: 40 }}
                  />
                  <button onClick={() => setShowOld(!showOld)} style={s.eyeBtn}>
                    {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ) : (
              <div style={s.formGroup}>
                <label style={s.label}>Password Setup</label>
                <input
                  value="First password for social login account"
                  disabled
                  style={{ ...s.input, opacity: 0.6, cursor: "not-allowed" }}
                />
              </div>
            )}
            <div style={s.formGroup}>
              <label style={s.label}>New Password</label>
              <div style={s.passWrap}>
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ ...s.input, paddingRight: 40 }}
                />
                <button onClick={() => setShowNew(!showNew)} style={s.eyeBtn}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={s.input}
              />
            </div>
            <div style={{ ...s.formGroup, gridColumn: "1 / -1" }}>
              <button
                onClick={savePassword}
                disabled={savingPassword}
                style={{ ...s.primaryBtn, opacity: savingPassword ? 0.7 : 1 }}
              >
                {savingPassword ? "Saving..." : "Update Password"}
              </button>
            </div>
          </div>
        )}
      </div>

      <button onClick={saveProfile} disabled={savingProfile} style={{ ...s.primaryBtn, opacity: savingProfile ? 0.7 : 1 }}>
        <Save size={16} style={{ marginRight: 8 }} /> {savingProfile ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );

  const renderOrders = () => (
    <div>
      <h2 style={s.tabTitle}>My Orders</h2>
      <p style={s.tabDesc}>Track and manage your recent purchases.</p>

      {ordersLoading ? (
        <div style={s.emptyCard}>
          <div style={s.spinner} />
          <p style={{ marginTop: 12, color: "var(--text-muted)" }}>Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={s.emptyCard}>
          <ShoppingBag size={48} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No Orders Yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Start shopping to see your orders here.</p>
          <button onClick={() => router.push("/shop")} style={{ ...s.primaryBtn, marginTop: 16 }}>Browse Shop</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((order) => (
            <div key={order._id} style={s.orderCard}>
              <div style={s.orderHeader}>
                <div>
                  <span style={s.orderId}>#{order._id.slice(-8).toUpperCase()}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 12 }}>
                    {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <span style={{ ...s.statusBadge, backgroundColor: getStatusColor(order.status) + "18", color: getStatusColor(order.status) }}>
                  {getStatusIcon(order.status)}
                  <span style={{ marginLeft: 4 }}>{order.status}</span>
                </span>
              </div>
              <div style={s.orderItems}>
                {order.items.slice(0, 3).map((item, i) => (
                  <div key={i} style={s.orderItemRow}>
                    <div style={s.orderItemThumb}>
                      {item.image ? <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Package size={18} style={{ color: "var(--text-muted)" }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Qty: {item.quantity}</p>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{settings?.currency || "$"}{item.price.toFixed(2)}</p>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p style={{ fontSize: 12, color: "var(--text-muted)", paddingTop: 6 }}>+{order.items.length - 3} more item{order.items.length - 3 > 1 ? "s" : ""}</p>
                )}
              </div>
              <div style={s.orderFooter}>
                <div>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Total: </span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{settings?.currency || "$"}{order.total.toFixed(2)}</span>
                </div>
                <button onClick={() => router.push(`/orders/${order._id}`)} style={s.viewBtn}>
                  View Details <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const openAddrEditor = (addr: Address | null) => {
    setAddrForm(addr ? { ...addr } : {
      _id: "",
      id: "",
      label: "New Address",
      fullName: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      phone: "",
      isDefault: false,
    });
    setEditingAddr(addr ? (addr._id || addr.id || null) : "new");
  };

  const saveAddress = async () => {
    if (!addrForm) return;
    if (!addrForm.fullName.trim() || !addrForm.street.trim() || !addrForm.city.trim()) {
      flash("Full name, street and city are required");
      return;
    }
    setAddrSaving(true);
    try {
      const addrId = editingAddr;
      const isNew = addrId && !addresses.find(a => (a._id || a.id) === addrId)?._id;
      const method = addrId && !isNew ? "PUT" : "POST";
      const url = addrId && !isNew ? `/api/account/addresses/${addrId}` : "/api/account/addresses";
      const { _id, id, ...addrData } = addrForm;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addrData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save address");
      if (method === "POST") {
        setAddresses([data, ...addresses]);
      } else {
        setAddresses(addresses.map(a => ((a._id || a.id) === addrId ? data : a)));
      }
      setEditingAddr(null);
      setAddrForm(null);
      flash("Address saved!");
    } catch (e: any) {
      flash(e.message || "Failed to save address");
    } finally {
      setAddrSaving(false);
    }
  };

  const deleteAddress = async (addrId: string) => {
    try {
      const res = await fetch(`/api/account/addresses/${addrId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete address");
      }
      setAddresses(addresses.filter(a => (a._id || a.id) !== addrId));
      flash("Address removed");
    } catch (e: any) {
      flash(e.message || "Failed to delete address");
    }
  };

  const renderAddresses = () => {
    if (editingAddr && addrForm) {
      return (
        <div>
          <h2 style={s.tabTitle}>{addrForm._id ? "Edit Address" : "New Address"}</h2>
          <p style={s.tabDesc}>{addrForm._id ? "Update your saved address." : "Add a new shipping address."}</p>
          <div style={s.formGrid}>
            {(["label", "fullName", "street", "city", "state", "zip", "country", "phone"] as const).map((field) => (
              <div key={field} style={{ ...s.formGroup, gridColumn: field === "street" ? "1 / -1" as const : undefined }}>
                <label style={s.label}>{field === "fullName" ? "Full Name" : field.charAt(0).toUpperCase() + field.slice(1)}</label>
                {field === "country" ? (
                  <select
                    value={addrForm[field] || ""}
                    onChange={(e) => setAddrForm({ ...addrForm, [field]: e.target.value })}
                    style={s.input}
                  >
                    <option value="">Select Country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={addrForm[field] || ""}
                    onChange={(e) => setAddrForm({ ...addrForm, [field]: e.target.value })}
                    style={s.input}
                    placeholder={`Enter ${field === "fullName" ? "full name" : field}`}
                  />
                )}
              </div>
            ))}
            <div style={{ ...s.formGroup, gridColumn: "1 / -1" }}>
              <label style={s.label}>Set as Default</label>
              <button
                onClick={() => setAddrForm({ ...addrForm, isDefault: !addrForm.isDefault })}
                style={{ ...s.toggle, backgroundColor: addrForm.isDefault ? "var(--secondary)" : "#e5e7eb" }}
              >
                <span style={{ ...s.toggleDot, transform: addrForm.isDefault ? "translateX(18px)" : "translateX(2px)" }} />
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button onClick={saveAddress} disabled={addrSaving} style={{ ...s.primaryBtn, opacity: addrSaving ? 0.7 : 1 }}>
              {addrSaving ? "Saving..." : "Save Address"}
            </button>
            <button onClick={() => { setEditingAddr(null); setAddrForm(null); }} style={{ ...s.viewBtn }}>
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h2 style={s.tabTitle}>Saved Addresses</h2>
        <p style={s.tabDesc}>Manage your shipping and billing addresses.</p>

        {addressesLoading ? (
          <div style={s.emptyCard}>
            <div style={s.spinner} />
            <p style={{ marginTop: 12, color: "var(--text-muted)" }}>Loading addresses...</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, marginTop: 20 }}>
            {addresses.map((addr) => {
              const addrId = addr._id || addr.id || "";
              return (
                <div key={addrId} style={s.addressCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={s.addrLabel}>{addr.label}</span>
                    {addr.isDefault && <span style={s.defaultBadge}>Default</span>}
                  </div>
                  {addr.fullName && <p style={{ fontSize: 14, fontWeight: 500 }}>{addr.fullName}</p>}
                  {addr.street && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{addr.street}</p>}
                  {(addr.city || addr.state || addr.zip) && (
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{[addr.city, addr.state, addr.zip].filter(Boolean).join(", ")}</p>
                  )}
                  {addr.country && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{addr.country}</p>}
                  {addr.phone && <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{addr.phone}</p>}
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button style={s.miniBtn} onClick={() => openAddrEditor(addr)}>
                      <Edit3 size={12} style={{ marginRight: 4 }} /> Edit
                    </button>
                    <button style={{ ...s.miniBtn, color: "#ef4444" }} onClick={() => deleteAddress(addrId)}>
                      <Trash2 size={12} style={{ marginRight: 4 }} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
            <button onClick={() => openAddrEditor(null)} style={s.addAddressCard}>
              <Plus size={24} style={{ color: "var(--text-muted)", marginBottom: 8 }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-muted)" }}>Add New Address</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderReturns = () => (
    <div>
      <h2 style={s.tabTitle}>Returns</h2>
      <p style={s.tabDesc}>View and manage your return requests.</p>
      <div style={s.emptyCard}>
        <RotateCcw size={48} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No Returns</h3>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>You haven't made any return requests yet.</p>
      </div>
    </div>
  );

  const renderRefunds = () => (
    <div>
      <h2 style={s.tabTitle}>Refunds</h2>
      <p style={s.tabDesc}>Track your refund status and history.</p>
      <div style={s.emptyCard}>
        <CreditCard size={48} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No Refunds</h3>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>You don't have any refunds at this time.</p>
      </div>
    </div>
  );

  const savePreferences = async () => {
    setPrefSaving(true);
    try {
      const res = await fetch("/api/account/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          preferredCurrency: currency, 
          theme,
          newsletter,
          orderUpdates,
          promotionalOffers: promotions
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save preferences");
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", theme);
        document.cookie = `store_theme=${theme}; path=/; max-age=${60*60*24*365}`;
      }
      flash("Preferences saved!");
    } catch (e: any) {
      flash(e.message || "Failed to save preferences");
    } finally {
      setPrefSaving(false);
    }
  };

  const renderPreferences = () => (
    <div>
      <h2 style={s.tabTitle}>Preferences</h2>
      <p style={s.tabDesc}>Customize your shopping experience.</p>

      {/* Notification Preferences */}
      <div style={s.prefSection}>
        <h3 style={s.prefTitle}>Notifications</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Newsletter & Updates", desc: "Receive our weekly newsletter with new arrivals", value: newsletter, set: setNewsletter },
            { label: "Order Updates", desc: "Get notified about order status changes", value: orderUpdates, set: setOrderUpdates },
            { label: "Promotional Offers", desc: "Special deals and limited-time discounts", value: promotions, set: setPromotions },
          ].map((pref) => (
            <div key={pref.label} style={s.prefRow}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{pref.label}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{pref.desc}</p>
              </div>
              <button
                onClick={() => pref.set(!pref.value)}
                style={{
                  ...s.toggle,
                  backgroundColor: pref.value ? "var(--secondary)" : "#e5e7eb",
                }}
              >
                <span style={{ ...s.toggleDot, transform: pref.value ? "translateX(18px)" : "translateX(2px)" }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Display Preferences */}
      <div style={s.prefSection}>
        <h3 style={s.prefTitle}>Display</h3>
        <div style={s.formGrid}>
          <div style={s.formGroup}>
            <label style={s.label}>Theme</label>
            <select
              value={theme}
              onChange={(e) => {
                const val = e.target.value;
                setTheme(val);
                if (typeof document !== "undefined") {
                  document.documentElement.setAttribute("data-theme", val);
                  document.cookie = `store_theme=${val}; path=/; max-age=${60*60*24*365}`;
                }
              }}
              style={s.input}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">System Default</option>
            </select>
          </div>
        </div>
      </div>

      <button onClick={savePreferences} disabled={prefSaving} style={{ ...s.primaryBtn, opacity: prefSaving ? 0.7 : 1 }}>
        <Save size={16} style={{ marginRight: 8 }} /> {prefSaving ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  );

  const renderWishlist = () => (
    <div>
      <h2 style={s.tabTitle}>My Wishlist</h2>
      <p style={s.tabDesc}>Items you've saved for later.</p>
      {wishlist.length === 0 ? (
        <div style={s.emptyCard}>
          <Heart size={48} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Your Wishlist is Empty</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Browse our shop and save items you love.</p>
          <button onClick={() => router.push("/shop")} style={{ ...s.primaryBtn, marginTop: 16 }}>Explore Shop</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {wishlist.map((item, i) => (
            <div 
              key={i} 
              style={{ ...s.wishlistCard, cursor: "pointer" }}
              onClick={() => router.push(getProductLink(item))}
            >
              <div style={s.wishlistImg}>
                {item.image ? <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Heart size={28} />}
              </div>
              <p style={{ fontWeight: 500, fontSize: 14, marginTop: 8 }}>{item.name}</p>
              <p style={{ fontSize: 13, color: "var(--primary)", fontWeight: 600 }}>{settings?.currency || "$"}{item.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case "profile": return renderProfile();
      case "orders": return renderOrders();
      case "addresses": return renderAddresses();
      case "returns": return renderReturns();
      case "refunds": return renderRefunds();
      case "preferences": return renderPreferences();
      case "wishlist": return renderWishlist();
      default: return renderProfile();
    }
  };

  return (
    <div style={s.pageWrapper}>
      {/* Page Header */}
      <div style={s.pageHeader}>
        <div className="container">
          <h1 style={s.pageTitle}>My Account</h1>
          <p style={s.pageSubtitle}>Track and manage your recent purchases.</p>
        </div>
      </div>

      <div className="container account-content-wrapper" style={s.contentWrapper}>
        {/* Sidebar */}
        <aside className="account-sidebar" style={s.sidebar}>
          {/* User card */}
          <div style={s.sidebarUser}>
            <div style={s.sidebarAvatar}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" style={s.avatarImg} />
              ) : (
                <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{initial}</span>
              )}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 15 }}>{user.username}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{user.email}</p>
            </div>
          </div>

          {/* Nav tabs */}
          <nav style={s.sidebarNav}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                style={{
                  ...s.sidebarItem,
                  ...(activeTab === tab.key ? s.sidebarItemActive : {}),
                }}
              >
                <span style={{
                  display: "flex", alignItems: "center", gap: 10,
                  color: activeTab === tab.key ? "var(--secondary)" : "var(--text-muted)"
                }}>
                  {tab.icon} {tab.label}
                </span>
                <ChevronRight size={14} style={{ color: activeTab === tab.key ? "var(--secondary)" : "transparent" }} />
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button onClick={logout} style={s.logoutBtn}>
            Logout
          </button>
        </aside>

        {/* Mobile Tab Selector */}
        <div className="account-mobile-tabs" style={s.mobileTabBar}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                ...s.mobileTab,
                ...(activeTab === tab.key ? s.mobileTabActive : {}),
              }}
            >
              {tab.icon}
              <span style={{ fontSize: 11 }}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className="account-main" style={s.mainContent}>
          {/* Success toast */}
          {saveMsg && (
            <div style={s.toast}>
              <CheckCircle size={16} style={{ marginRight: 8, color: "#10b981" }} />
              {saveMsg}
            </div>
          )}
          {renderTab()}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .account-sidebar { display: none !important; }
          .account-mobile-tabs { display: flex !important; }
          .account-main { margin-left: 0 !important; }
          .account-content-wrapper { flex-direction: column !important; }
        }
        @media (min-width: 769px) {
          .account-mobile-tabs { display: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ──────────────────────────── styles ──────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#fafafa",
  },
  pageHeader: {
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    padding: "48px 0 40px",
    color: "#fff",
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: "-0.5px",
    marginBottom: 6,
    fontFamily: "var(--font-display, var(--font-sans))",
  },
  pageSubtitle: {
    fontSize: 15,
    opacity: 0.7,
    fontWeight: 400,
  },
  contentWrapper: {
    display: "flex",
    gap: 28,
    paddingTop: 32,
    paddingBottom: 60,
    alignItems: "flex-start",
  },

  /* Sidebar */
  sidebar: {
    width: 280,
    flexShrink: 0,
    backgroundColor: "#fff",
    borderRadius: 16,
    border: "1px solid var(--border-color)",
    overflow: "hidden",
    position: "sticky" as const,
    top: 84,
  },
  sidebarUser: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "20px 20px 16px",
    borderBottom: "1px solid var(--border-color)",
  },
  sidebarAvatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sidebarNav: {
    padding: "8px 0",
  },
  sidebarItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "11px 20px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    borderTop: "none",
    borderBottom: "none",
    borderLeft: "3px solid transparent",
    borderRight: "none",
    backgroundColor: "transparent",
    transition: "all 0.15s ease",
    textAlign: "left" as const,
  },
  sidebarItemActive: {
    backgroundColor: "var(--bg-light, #f7f7f8)",
    borderLeft: "3px solid var(--secondary)",
  },
  logoutBtn: {
    display: "block",
    width: "calc(100% - 32px)",
    margin: "8px 16px 16px",
    padding: "10px",
    fontSize: 13,
    fontWeight: 600,
    color: "#ef4444",
    border: "1px solid #fecaca",
    borderRadius: 10,
    backgroundColor: "#fef2f2",
    cursor: "pointer",
    textAlign: "center" as const,
    transition: "all 0.2s ease",
  },

  /* Mobile Tabs */
  mobileTabBar: {
    display: "none",
    overflowX: "auto" as const,
    gap: 4,
    padding: "0 0 16px",
    WebkitOverflowScrolling: "touch",
  },
  mobileTab: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 4,
    padding: "10px 14px",
    fontSize: 12,
    fontWeight: 500,
    color: "var(--text-muted)",
    border: "1px solid var(--border-color)",
    borderRadius: 12,
    backgroundColor: "#fff",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
  mobileTabActive: {
    backgroundColor: "var(--secondary)",
    color: "#fff",
    borderColor: "var(--secondary)",
  },

  /* Main Content */
  mainContent: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#fff",
    borderRadius: 16,
    border: "1px solid var(--border-color)",
    padding: "28px 32px",
  },
  tabTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 4,
    color: "var(--secondary)",
  },
  tabDesc: {
    fontSize: 14,
    color: "var(--text-muted)",
    marginBottom: 24,
  },

  /* Profile */
  avatarSection: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    padding: 20,
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    marginBottom: 28,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: 700,
    color: "#fff",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  uploadBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 14px",
    fontSize: 12,
    fontWeight: 500,
    border: "1px solid var(--border-color)",
    borderRadius: 8,
    cursor: "pointer",
    backgroundColor: "#fff",
    transition: "all 0.2s ease",
  },
  removeBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 14px",
    fontSize: 12,
    fontWeight: 500,
    border: "1px solid #fecaca",
    borderRadius: 8,
    cursor: "pointer",
    backgroundColor: "#fef2f2",
    color: "#ef4444",
  },

  /* Form */
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-main)",
  },
  input: {
    padding: "10px 14px",
    fontSize: 14,
    border: "1px solid var(--border-color)",
    borderRadius: 10,
    outline: "none",
    transition: "border-color 0.2s ease",
    backgroundColor: "#fff",
    width: "100%",
  },
  passwordSection: {
    marginTop: 24,
    marginBottom: 24,
    padding: "16px 0",
    borderTop: "1px solid var(--border-color)",
  },
  changePassBtn: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--secondary)",
    background: "none",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline" as const,
  },
  passWrap: {
    position: "relative" as const,
  },
  eyeBtn: {
    position: "absolute" as const,
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-muted)",
  },

  /* Buttons */
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "11px 28px",
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
    backgroundColor: "var(--secondary)",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  viewBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "7px 14px",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: 8,
    backgroundColor: "#fff",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  miniBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 500,
    color: "var(--text-muted)",
    border: "1px solid var(--border-color)",
    borderRadius: 6,
    backgroundColor: "#fff",
    cursor: "pointer",
  },

  /* Orders */
  orderCard: {
    border: "1px solid var(--border-color)",
    borderRadius: 14,
    overflow: "hidden",
    transition: "box-shadow 0.2s ease",
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 20px",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid var(--border-color)",
  },
  orderId: {
    fontWeight: 700,
    fontSize: 14,
    fontFamily: "monospace",
    color: "var(--secondary)",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    textTransform: "capitalize" as const,
  },
  orderItems: {
    padding: "12px 20px",
  },
  orderItemRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  orderItemThumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  orderFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    borderTop: "1px solid var(--border-color)",
    backgroundColor: "#fdfdfe",
  },

  /* Addresses */
  addressCard: {
    padding: 20,
    border: "1px solid var(--border-color)",
    borderRadius: 14,
    backgroundColor: "#fff",
    transition: "box-shadow 0.2s ease",
  },
  addrLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--secondary)",
  },
  defaultBadge: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    backgroundColor: "#ecfdf5",
    color: "#059669",
  },
  addAddressCard: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    border: "2px dashed var(--border-color)",
    borderRadius: 14,
    cursor: "pointer",
    backgroundColor: "transparent",
    transition: "border-color 0.2s ease, background-color 0.2s ease",
    minHeight: 160,
  },

  /* Preferences */
  prefSection: {
    marginBottom: 28,
  },
  prefTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 16,
    paddingBottom: 10,
    borderBottom: "1px solid var(--border-color)",
  },
  prefRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  toggle: {
    width: 42,
    height: 24,
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    position: "relative" as const,
    transition: "background-color 0.2s ease",
    flexShrink: 0,
  },
  toggleDot: {
    display: "block",
    width: 20,
    height: 20,
    borderRadius: "50%",
    backgroundColor: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
    transition: "transform 0.2s ease",
  },

  /* Wishlist */
  wishlistCard: {
    padding: 16,
    border: "1px solid var(--border-color)",
    borderRadius: 14,
    textAlign: "center" as const,
  },
  wishlistImg: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  /* Empty / Loading */
  emptyState: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    textAlign: "center" as const,
    padding: 32,
  },
  emptyCard: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 20px",
    borderRadius: 14,
    border: "1px dashed var(--border-color)",
    textAlign: "center" as const,
    backgroundColor: "#fdfdfe",
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid var(--border-color)",
    borderTopColor: "var(--secondary)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  /* Toast */
  toast: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "#ecfdf5",
    border: "1px solid #a7f3d0",
    fontSize: 13,
    fontWeight: 500,
    color: "#065f46",
    animation: "fadeIn 0.3s ease",
  },
};
