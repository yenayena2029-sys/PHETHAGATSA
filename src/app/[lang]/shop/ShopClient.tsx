"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Star, 
  SlidersHorizontal, 
  X, 
  LayoutGrid, 
  List, 
  Check, 
  RotateCcw, 
  ShoppingBag, 
  ChevronDown 
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  brand: string;
  sizes: string[];
  colors: string[];
  ratings: number;
  reviewsCount: number;
  isOnSale: boolean;
  isAvailable: boolean;
  stock: number;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ShopClientProps {
  initialProducts: Product[];
  categories: Category[];
  currency: string;
  availableBrands: string[];
  availableSizes: string[];
  availableColors: string[];
}

const getColorName = (hex: string) => {
  const map: Record<string, string> = {
    "#000000": "Black",
    "#ffffff": "White",
    "#8b4513": "Brown",
    "#ffd700": "Gold",
    "#b0e0e6": "Powder Blue",
    "#4682b4": "Steel Blue",
    "#ff0000": "Red",
    "#0000ff": "Blue",
    "#008000": "Green",
    "#ffff00": "Yellow",
    "#800080": "Purple",
    "#ffa500": "Orange",
    "#808080": "Gray",
  };
  return map[hex.toLowerCase()] || hex;
};

export default function ShopClient({ 
  initialProducts, 
  categories, 
  currency, 
  availableBrands, 
  availableSizes, 
  availableColors 
}: ShopClientProps) {
  const { t, getProductLink } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");
  const [limit, setLimit] = useState(24);

  // URL state
  const activeCategory = searchParams?.get("category") || "all";
  const activeSort = searchParams?.get("sort") || "newest";
  const activeMinPrice = searchParams?.get("minPrice") || "";
  const activeMaxPrice = searchParams?.get("maxPrice") || "";
  const activeOnSale = searchParams?.get("isOnSale") === "true";
  const activeFeatured = searchParams?.get("isFeatured") === "true";
  const activeInStock = searchParams?.get("inStock") === "true";
  const activeSize = searchParams?.get("size") || "";
  const activeColor = searchParams?.get("color") || "";
  const activeBrand = searchParams?.get("brand") || "";
  const activeCollection = searchParams?.get("collection") || "";

  // Local state for price inputs
  const [minPriceInput, setMinPriceInput] = useState(activeMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(activeMaxPrice);

  // Sync inputs with URL params
  useEffect(() => {
    setMinPriceInput(activeMinPrice);
    setMaxPriceInput(activeMaxPrice);
  }, [activeMinPrice, activeMaxPrice]);

  const renderPrices = (product: Product, isList: boolean = false) => {
    const isSale = product.isOnSale && typeof product.salePrice === "number";
    const priceStyle = isList ? { ...styles.price, fontSize: "18px" } : styles.price;

    if (isSale) {
      const current = Math.min(product.price, product.salePrice!);
      const old = Math.max(product.price, product.salePrice!);
      return (
        <div style={styles.priceRow}>
          <span style={priceStyle}>{currency}{current.toFixed(2)}</span>
          <span style={styles.oldPrice}>{currency}{old.toFixed(2)}</span>
        </div>
      );
    }
    return (
      <div style={styles.priceRow}>
        <span style={priceStyle}>{currency}{product.price.toFixed(2)}</span>
      </div>
    );
  };

  // Prevent body scroll when mobile filter drawer is open
  useEffect(() => {
    if (filtersOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [filtersOpen]);

  // Helper to push URL changes
  const updateFilters = (params: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams?.entries() || []));

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });

    router.push(`/shop?${current.toString()}`);
    setFiltersOpen(false);
  };

  const handleCategoryChange = (slug: string) => {
    updateFilters({ category: slug === activeCategory ? "all" : slug });
  };

  const handleSizeToggle = (sizeVal: string) => {
    const currentSizes = activeSize ? activeSize.split(",") : [];
    const newSizes = currentSizes.includes(sizeVal)
      ? currentSizes.filter(s => s !== sizeVal)
      : [...currentSizes, sizeVal];
    updateFilters({ size: newSizes.length > 0 ? newSizes.join(",") : null });
  };

  const handleColorToggle = (colorVal: string) => {
    const currentColors = activeColor ? activeColor.split(",") : [];
    const newColors = currentColors.includes(colorVal)
      ? currentColors.filter(c => c !== colorVal)
      : [...currentColors, colorVal];
    updateFilters({ color: newColors.length > 0 ? newColors.join(",") : null });
  };

  const handleBrandToggle = (brandVal: string) => {
    const currentBrands = activeBrand ? activeBrand.split(",") : [];
    const newBrands = currentBrands.includes(brandVal)
      ? currentBrands.filter(b => b !== brandVal)
      : [...currentBrands, brandVal];
    updateFilters({ brand: newBrands.length > 0 ? newBrands.join(",") : null });
  };

  const handleCollectionToggle = (collVal: string) => {
    updateFilters({ collection: activeCollection === collVal ? null : collVal });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ sort: e.target.value });
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      minPrice: minPriceInput || null,
      maxPrice: maxPriceInput || null,
    });
  };

  // Active filter count badge
  const activeFilterCount = [
    activeCategory !== "all",
    activeOnSale,
    activeFeatured,
    activeInStock,
    !!activeMinPrice,
    !!activeMaxPrice,
    !!activeSize,
    !!activeColor,
    !!activeBrand,
    !!activeCollection,
  ].filter(Boolean).length;

  const handleClearAll = () => {
    router.push("/shop");
    setMinPriceInput("");
    setMaxPriceInput("");
  };

  const FilterPanel = () => {
    const selectedSizes = activeSize ? activeSize.split(",") : [];
    const selectedColors = activeColor ? activeColor.split(",") : [];
    const selectedBrands = activeBrand ? activeBrand.split(",") : [];

    return (
      <div style={styles.filterContainer}>
        <div style={styles.filterHeader}>
          <h3 style={styles.filterTitle}>{t("Filters")}</h3>
          {activeFilterCount > 0 && (
            <button onClick={handleClearAll} style={styles.clearAllBtn}>{t("Clear All")}</button>
          )}
        </div>

        {/* Price Range */}
        <div style={styles.filterSection}>
          <h4 style={styles.filterSubTitle}>{t("Price Range")}</h4>
          <form onSubmit={handlePriceApply} style={styles.priceForm}>
            <div style={styles.priceInputs}>
              <div style={styles.priceField}>
                <span style={styles.priceCurrency}>{currency}</span>
                <input
                  type="number"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  placeholder={t("Min") || "Min"}
                  style={styles.priceInput}
                />
              </div>
              <span style={styles.priceSeparator}>-</span>
              <div style={styles.priceField}>
                <span style={styles.priceCurrency}>{currency}</span>
                <input
                  type="number"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  placeholder={t("Max") || "Max"}
                  style={styles.priceInput}
                />
              </div>
            </div>
            <button type="submit" style={styles.applyBtn}>{t("Apply Filter") || "Apply Filter"}</button>
          </form>
        </div>

        {/* Availability */}
        <div style={styles.filterSection}>
          <h4 style={styles.filterSubTitle}>{t("Availability")}</h4>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={activeInStock}
              onChange={(e) => updateFilters({ inStock: e.target.checked ? "true" : null })}
              style={styles.checkbox}
            />
            <span>{t("In Stock Only")}</span>
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={activeOnSale}
              onChange={(e) => updateFilters({ isOnSale: e.target.checked ? "true" : null })}
              style={styles.checkbox}
            />
            <span>{t("On Sale")}</span>
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={activeFeatured}
              onChange={(e) => updateFilters({ isFeatured: e.target.checked ? "true" : null })}
              style={styles.checkbox}
            />
            <span>{t("Featured Only")}</span>
          </label>
        </div>

        {/* Categories */}
        <div style={styles.filterSection}>
          <h4 style={styles.filterSubTitle}>{t("Categories")}</h4>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={activeCategory === "all"}
              onChange={() => updateFilters({ category: "all" })}
              style={styles.checkbox}
            />
            <span>{t("All Categories") || "All Categories"}</span>
          </label>
          {categories.map((cat) => (
            <label key={cat._id} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={activeCategory.toLowerCase() === cat.slug.toLowerCase()}
                onChange={() => handleCategoryChange(cat.slug)}
                style={styles.checkbox}
              />
              <span>{t(cat.name)}</span>
            </label>
          ))}
        </div>

        {/* Collections */}
        <div style={styles.filterSection}>
          <h4 style={styles.filterSubTitle}>{t("Collections")}</h4>
          {[
            { label: "New Arrivals", value: "new-arrivals" },
            { label: "Best Sellers", value: "best-sellers" },
            { label: "Winter Clearance", value: "winter-clearance" },
            { label: "Featured Products", value: "featured" },
          ].map((c) => (
            <label key={c.value} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={activeCollection === c.value}
                onChange={() => handleCollectionToggle(c.value)}
                style={styles.checkbox}
              />
              <span>{t(c.label)}</span>
            </label>
          ))}
        </div>

        {/* Sizes */}
        {availableSizes.length > 0 && (
          <div style={styles.filterSection}>
            <h4 style={styles.filterSubTitle}>{t("Sizes")}</h4>
            <div style={styles.sizeGrid}>
              {availableSizes.map((sz) => {
                const isSelected = selectedSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    onClick={() => handleSizeToggle(sz)}
                    style={{
                      ...styles.sizeBox,
                      backgroundColor: isSelected ? "#111" : "#f1f5f9",
                      color: isSelected ? "#fff" : "#334155",
                      border: isSelected ? "1px solid #111" : "1px solid #e2e8f0",
                    }}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Colors Swatches */}
        {availableColors.length > 0 && (
          <div style={styles.filterSection}>
            <h4 style={styles.filterSubTitle}>{t("Colors")}</h4>
            <div style={styles.colorGrid}>
              {availableColors.map((hex) => {
                const isSelected = selectedColors.includes(hex);
                const readableName = getColorName(hex);
                const isWhite = hex.toLowerCase() === "#ffffff" || hex.toLowerCase() === "#fff";
                return (
                  <button
                    key={hex}
                    onClick={() => handleColorToggle(hex)}
                    title={readableName}
                    style={{
                      ...styles.colorSwatch,
                      backgroundColor: hex,
                      border: isWhite ? "1px solid #cbd5e1" : "none",
                      boxShadow: isSelected ? "0 0 0 2px #fff, 0 0 0 4px #6366f1" : "none"
                    }}
                  >
                    {isSelected && (
                      <Check 
                        size={12} 
                        color={isWhite || hex.toLowerCase() === "#ffd700" || hex.toLowerCase() === "#b0e0e6" ? "#000" : "#fff"} 
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Brands */}
        {availableBrands.length > 0 && (
          <div id="brands-filter" style={styles.filterSection}>
            <h4 style={styles.filterSubTitle}>{t("Brands")}</h4>
            {availableBrands.map((br) => {
              const isSelected = selectedBrands.includes(br);
              return (
                <label key={br} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleBrandToggle(br)}
                    style={styles.checkbox}
                  />
                  <span>{br}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const paginatedProducts = initialProducts.slice(0, limit);

  return (
    <div className="container" style={styles.container}>
      {/* Quick top category filters */}
      <div style={styles.quickFilterBar}>
        <div style={styles.quickFiltersLabel}>{t("Quick Filters:") || "Quick Filters:"}</div>
        <div style={styles.quickFilterList}>
          {categories.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.slug.toLowerCase();
            return (
              <button
                key={cat._id}
                onClick={() => handleCategoryChange(cat.slug)}
                style={{
                  ...styles.quickFilterBtn,
                  backgroundColor: isActive ? "#d31e28" : "white",
                  color: isActive ? "white" : "#111",
                }}
              >
                {t(cat.name)}
              </button>
            );
          })}
          <button
            onClick={() => updateFilters({ isOnSale: activeOnSale ? null : "true" })}
            style={{
              ...styles.quickFilterBtn,
              backgroundColor: activeOnSale ? "#d31e28" : "white",
              color: activeOnSale ? "white" : "#111",
            }}
          >
            {t("Sale") || "Sale"}
          </button>
          <button
            onClick={() => updateFilters({ collection: activeCollection === "best-sellers" ? null : "best-sellers" })}
            style={{
              ...styles.quickFilterBtn,
              backgroundColor: activeCollection === "best-sellers" ? "#d31e28" : "white",
              color: activeCollection === "best-sellers" ? "white" : "#111",
            }}
          >
            {t("Best Seller") || "Best Seller"}
          </button>
        </div>
      </div>

      <div style={styles.shopLayout}>
        {/* Mobile Filter Trigger */}
        <button
          onClick={() => setFiltersOpen(true)}
          style={styles.mobileFilterBtn}
        >
          <SlidersHorizontal size={16} style={{ marginRight: 8 }} />
          {t("Filters")}
          {activeFilterCount > 0 && (
            <span style={styles.filterBadge}>{activeFilterCount}</span>
          )}
        </button>

        {/* Mobile Filter Drawer */}
        {filtersOpen && (
          <div style={styles.filterOverlay} onClick={() => setFiltersOpen(false)} />
        )}
        <div style={{
          ...styles.filterDrawer,
          transform: filtersOpen ? "translateX(0)" : "translateX(-100%)",
        }}>
          <div style={styles.filterDrawerHeader}>
            <h3 style={{ fontWeight: "700", fontSize: "18px" }}>{t("Catalog Filters") || "Catalog Filters"}</h3>
            <button onClick={() => setFiltersOpen(false)} style={{ padding: "4px" }}>
              <X size={22} />
            </button>
          </div>
          <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
            <FilterPanel />
          </div>
          <div style={styles.filterDrawerFooter}>
            <button onClick={handleClearAll} style={styles.mobileResetBtn}>{t("Reset") || "Reset"}</button>
            <button onClick={() => setFiltersOpen(false)} style={styles.mobileApplyBtn}>{t("Show Results") || "Show Results"}</button>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <aside style={styles.desktopSidebar}>
          <FilterPanel />
        </aside>

        {/* Main Product Area */}
        <main style={styles.mainContent}>
          {/* Toolbar */}
          <div style={styles.toolbar}>
            <div>
              <h2 style={styles.collectionTitle}>{t("Shop Collection")}</h2>
              <p style={styles.resultsCount}>
                {t("Showing")} 1-{paginatedProducts.length} {t("of") || "of"} {initialProducts.length} {t("products")}
              </p>
            </div>
            
            <div style={styles.toolbarActions}>
              {/* Layout Mode */}
              <div style={styles.layoutToggles}>
                <button 
                  onClick={() => setLayoutMode("grid")}
                  style={{ ...styles.layoutToggleBtn, color: layoutMode === "grid" ? "#d31e28" : "#94a3b8" }}
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setLayoutMode("list")}
                  style={{ ...styles.layoutToggleBtn, color: layoutMode === "list" ? "#d31e28" : "#94a3b8" }}
                >
                  <List size={18} />
                </button>
              </div>

              {/* Items Per Page */}
              <div style={styles.selectWrapper}>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  style={styles.select}
                >
                  <option value={12}>12 {t("per page") || "per page"}</option>
                  <option value={24}>24 {t("per page") || "per page"}</option>
                  <option value={48}>48 {t("per page") || "per page"}</option>
                </select>
                <ChevronDown size={14} style={styles.selectIcon} />
              </div>

              {/* Sorting */}
              <div style={styles.selectWrapper}>
                <select
                  value={activeSort}
                  onChange={handleSortChange}
                  style={styles.select}
                >
                  <option value="newest">{t("Newest Arrivals")}</option>
                  <option value="price_asc">{t("Price: Low to High")}</option>
                  <option value="price_desc">{t("Price: High to Low")}</option>
                </select>
                <ChevronDown size={14} style={styles.selectIcon} />
              </div>
            </div>
          </div>

          {/* Product Grid / List Rendering */}
          {initialProducts.length === 0 ? (
            <div style={styles.emptyState}>
              <ShoppingBag size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
              <p style={styles.emptyText}>{t("No products match your selected filters.")}</p>
              <button onClick={handleClearAll} style={styles.resetBtn}>{t("Reset Filters")}</button>
            </div>
          ) : layoutMode === "grid" ? (
            <div style={styles.grid}>
              {paginatedProducts.map((product) => (
                <Link href={getProductLink(product)} key={product._id} style={styles.card}>
                  <div style={styles.imageContainer}>
                    <img src={product.images[0]} alt={product.name} style={styles.img} />
                    
                    {/* Badge Overlays */}
                    {product.isOnSale && <span style={styles.saleBadge}>{t("Sale") || "SALE"}</span>}
                    {product.ratings >= 4.8 && <span style={styles.bestBadge}>{t("Best Seller") || "BEST SELLER"}</span>}
                  </div>
                  <div style={styles.info}>
                    <span style={styles.categoryLabel}>{t(product.category).toUpperCase()}</span>
                    <h3 style={styles.productName}>{product.name}</h3>
                    
                    {/* Rating stars */}
                    <div style={styles.stars}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                           key={i}
                          size={12}
                          fill={i < Math.floor(product.ratings) ? "#fbbf24" : "none"}
                          stroke="#fbbf24"
                        />
                      ))}
                      <span style={styles.reviews}>({product.reviewsCount} {t("reviews") || "reviews"})</span>
                    </div>

                    {renderPrices(product)}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={styles.listView}>
              {paginatedProducts.map((product) => (
                <Link href={getProductLink(product)} key={product._id} style={styles.listCard}>
                  <img src={product.images[0]} alt={product.name} style={styles.listCardImg} />
                  <div style={styles.listCardBody}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span style={styles.categoryLabel}>{t(product.category).toUpperCase()}</span>
                        <h3 style={styles.listProductName}>{product.name}</h3>
                      </div>
                      {renderPrices(product, true)}
                    </div>

                    {/* Ratings */}
                    <div style={{ ...styles.stars, margin: "8px 0" }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < Math.floor(product.ratings) ? "#fbbf24" : "none"}
                          stroke="#fbbf24"
                        />
                      ))}
                      <span style={styles.reviews}>({product.reviewsCount} {t("reviews") || "reviews"})</span>
                    </div>

                    <p style={styles.listDesc}>{product.description}</p>

                    <div style={styles.listCardFooter}>
                      <span style={styles.brandLabel}>{t("Brand") || "Brand"}: {product.brand}</span>
                      <button style={styles.viewProductBtn}>{t("View Details")}</button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: "40px 0", fontFamily: "'Outfit', sans-serif" },
  quickFilterBar: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px", padding: "16px 24px", backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflowX: "auto" },
  quickFiltersLabel: { fontSize: "14px", fontWeight: "700", color: "#334155", flexShrink: 0 },
  quickFilterList: { display: "flex", gap: "10px" },
  quickFilterBtn: { padding: "8px 16px", borderRadius: "50px", border: "1px solid #e2e8f0", fontSize: "13px", fontWeight: "600", transition: "all 0.2s", whiteSpace: "nowrap" },
  shopLayout: { display: "flex", gap: "32px", position: "relative" },
  mobileFilterBtn: { display: "none", width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", fontSize: "14px", fontWeight: "600", color: "#0f172a", justifyContent: "center", alignItems: "center", marginBottom: "20px" },
  desktopSidebar: { width: "260px", flexShrink: 0 },
  filterContainer: { display: "flex", flexDirection: "column", gap: "28px" },
  filterHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  filterTitle: { fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 },
  clearAllBtn: { fontSize: "12px", color: "#d31e28", fontWeight: "600", textDecoration: "underline" },
  filterSection: { borderBottom: "1px solid #e2e8f0", paddingBottom: "24px" },
  filterSubTitle: { fontSize: "12px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" },
  checkboxLabel: { display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#475569", marginBottom: "10px", cursor: "pointer" },
  checkbox: { width: "16px", height: "16px", accentColor: "#d31e28" },
  priceForm: { display: "flex", flexDirection: "column", gap: "12px" },
  priceInputs: { display: "flex", alignItems: "center", gap: "8px" },
  priceField: { position: "relative", flex: 1 },
  priceCurrency: { position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#94a3b8" },
  priceInput: { width: "100%", padding: "8px 8px 8px 24px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", color: "#334155", outline: "none" },
  priceSeparator: { color: "#94a3b8" },
  applyBtn: { backgroundColor: "#0f172a", color: "white", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer", textAlign: "center" },
  sizeGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" },
  sizeBox: { padding: "8px 0", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" },
  colorGrid: { display: "flex", gap: "8px", flexWrap: "wrap" },
  colorSwatch: { width: "24px", height: "24px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  mainContent: { flex: 1, minWidth: 0 },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" },
  collectionTitle: { fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 },
  resultsCount: { fontSize: "13px", color: "#64748b", marginTop: "4px" },
  toolbarActions: { display: "flex", alignItems: "center", gap: "12px" },
  layoutToggles: { display: "flex", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", backgroundColor: "white" },
  layoutToggleBtn: { padding: "8px 12px", display: "flex", alignItems: "center", cursor: "pointer", backgroundColor: "white" },
  selectWrapper: { position: "relative" },
  select: { appearance: "none", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "8px 32px 8px 16px", fontSize: "13px", fontWeight: "600", color: "#334155", backgroundColor: "white", cursor: "pointer", outline: "none" },
  selectIcon: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "28px" },
  card: { display: "flex", flexDirection: "column", backgroundColor: "white", borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", transition: "transform 0.25s ease, box-shadow 0.25s ease" },
  imageContainer: { height: "280px", position: "relative", backgroundColor: "#f8fafc", overflow: "hidden" },
  img: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" },
  saleBadge: { position: "absolute", top: "12px", left: "12px", backgroundColor: "#d31e28", color: "white", fontSize: "10px", fontWeight: "800", padding: "4px 8px", borderRadius: "4px", letterSpacing: "0.5px" },
  bestBadge: { position: "absolute", top: "12px", right: "12px", backgroundColor: "#1e1b4b", color: "#e0e7ff", fontSize: "9px", fontWeight: "800", padding: "4px 8px", borderRadius: "4px", letterSpacing: "0.5px" },
  info: { padding: "16px", display: "flex", flexDirection: "column", gap: "4px" },
  categoryLabel: { fontSize: "10px", fontWeight: "700", color: "#94a3b8", letterSpacing: "1px" },
  productName: { fontSize: "14px", fontWeight: "700", color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  stars: { display: "flex", alignItems: "center", gap: "2px" },
  reviews: { fontSize: "11px", color: "#64748b", marginLeft: "4px" },
  priceRow: { display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" },
  price: { fontSize: "16px", fontWeight: "800", color: "#0f172a" },
  oldPrice: { fontSize: "12px", textDecoration: "line-through", color: "#94a3b8" },
  listView: { display: "flex", flexDirection: "column", gap: "20px" },
  listCard: { display: "flex", backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" },
  listCardImg: { width: "220px", height: "220px", objectFit: "cover", backgroundColor: "#f8fafc" },
  listCardBody: { flex: 1, padding: "24px", display: "flex", flexDirection: "column" },
  listProductName: { fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: "4px 0 0 0" },
  listDesc: { fontSize: "14px", color: "#475569", margin: "12px 0", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" },
  listCardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" },
  brandLabel: { fontSize: "12px", color: "#94a3b8" },
  viewProductBtn: { backgroundColor: "#0f172a", color: "white", padding: "10px 20px", borderRadius: "50px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  emptyState: { padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "white", borderRadius: "16px", border: "1px dashed #cbd5e1" },
  emptyText: { fontSize: "16px", color: "#475569", fontWeight: "600", margin: "0 0 16px 0" },
  resetBtn: { backgroundColor: "#d31e28", color: "white", padding: "10px 24px", borderRadius: "50px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  filterBadge: { marginLeft: "6px", backgroundColor: "#d31e28", color: "white", borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
  filterOverlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 199 },
  filterDrawer: { position: "fixed", top: 0, left: 0, height: "100vh", width: "85%", maxWidth: "340px", backgroundColor: "white", zIndex: 200, display: "flex", flexDirection: "column", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)" },
  filterDrawerHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #e2e8f0" },
  filterDrawerFooter: { display: "flex", gap: "12px", padding: "16px 20px", borderTop: "1px solid #e2e8f0" },
  mobileResetBtn: { flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "600", fontSize: "14px", color: "#334155", backgroundColor: "white" },
  mobileApplyBtn: { flex: 1, padding: "10px", borderRadius: "8px", backgroundColor: "#0f172a", color: "white", fontWeight: "600", fontSize: "14px" },
};
