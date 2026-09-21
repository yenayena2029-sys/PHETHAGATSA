"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  provider?: string;
  passwordSet?: boolean;
}

export interface Settings {
  storeName: string;
  storeEmail: string;
  currency: string;
  shippingCost: number;
  promoCode: string;
  promoDiscount: number;
  heroTitle: string;
  heroSubtitle: string;
  heroCountdownDate: string;
  enableCod?: boolean;
  enableStripe?: boolean;
  enableRazorpay?: boolean;
  enablePaypal?: boolean;
  codLogo?: string;
  stripeLogo?: string;
  razorpayLogo?: string;
  paypalLogo?: string;
  stripePubKey?: string;
  razorpayKeyId?: string;
  paypalClientId?: string;
  primaryColor?: string;
  productUrlFormat?: "id" | "slug";
  [key: string]: any;
}

export type AppliedPromo = {
  code: string;
  discountType: "Percentage" | "Fixed Amount";
  value: number;
} | null;

interface AppContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  appliedPromo: AppliedPromo;
  setAppliedPromo: (promo: AppliedPromo) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  settings: Settings | null;
  fetchSettings: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartTotal: number;
  loading: boolean;
  logout: () => Promise<void>;
  t: (key: string) => string;
  getProductLink: (product: { _id: string; id?: string; name: string }) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ 
  children,
  initialTranslations = {}
}: { 
  children: React.ReactNode;
  initialTranslations?: Record<string, string>;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [translations, setTranslations] = useState<Record<string, string>>(initialTranslations);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo>(null);

  const t = (key: string): string => {
    return translations[key] || key;
  };

  useEffect(() => {
    // Load cart
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error(e);
      }
    }

    // Load User
    fetch("/api/auth/me")
      .then((res) => {
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          return res.json();
        }
        return { user: null };
      })
      .then((data) => {
        if (data && data.user) {
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
      })
      .catch((err) => console.error("Error loading user:", err))
      .finally(() => setLoading(false));

    // Load Settings
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings?.selectedTheme && typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", settings.selectedTheme);
      document.cookie = `store_theme=${settings.selectedTheme}; path=/; max-age=${60*60*24*365}`;
    }
  }, [settings]);

  const fetchSettings = () => {
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => {
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error("Invalid response format or status");
      })
      .then((data) => {
        if (data && !data.error) {
          setSettings(data);
        }
      })
      .catch((err) => console.error("Error loading settings:", err));
  };

  const addToCart = (newItem: CartItem) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.size === newItem.size &&
          item.color === newItem.color
      );

      let updatedCart;
      if (existingIndex > -1) {
        updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += newItem.quantity;
      } else {
        updatedCart = [...prevCart, newItem];
      }

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const removeFromCart = (productId: string, size?: string, color?: string) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter(
        (item) =>
          !(item.productId === productId && item.size === size && item.color === color)
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const updateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => {
        if (item.productId === productId && item.size === size && item.color === color) {
          return { ...item, quantity };
        }
        return item;
      });
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  
  const discountAmount = appliedPromo
    ? appliedPromo.discountType === "Percentage"
      ? (cartSubtotal * appliedPromo.value) / 100
      : appliedPromo.value
    : 0;

  const cartTotal = cartSubtotal - discountAmount + (settings?.shippingCost || 0);

  const getProductLink = (product: { _id: string; id?: string; name: string }) => {
    if (settings?.productUrlFormat !== "id") {
      const slug = product.name
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
      return `/product/${slug}`;
    }
    return `/product/${product._id || product.id}`;
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedPromo,
        setAppliedPromo,
        user,
        setUser,
        settings,
        fetchSettings,
        cartCount,
        cartSubtotal,
        cartTotal,
        loading,
        logout,
        t,
        getProductLink,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
