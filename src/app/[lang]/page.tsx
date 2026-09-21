export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getSettings } from "@/lib/settings";
import HeroSlider from "@/components/HeroSlider";
import { Star, ShieldCheck, Truck, RotateCcw } from "lucide-react";

import Translation from "@/models/Translation";

async function getHomeData() {
  try {
    await dbConnect();
    const settings = await getSettings();

    const featuredProducts = await Product.find({ isFeatured: true, isAvailable: true }).limit(8);
    const popularProducts = await Product.find({ isAvailable: true }).sort({ ratings: -1, reviewsCount: -1 }).limit(8);
    const newArrivals = await Product.find({ isAvailable: true }).sort({ createdAt: -1 }).limit(8);
    const categoriesRaw = await Category.find({});
    
    const categoriesWithProducts = [];
    for (const cat of categoriesRaw) {
      const latestProduct = await Product.findOne({ 
        category: { $regex: new RegExp(`^${cat.slug}$`, 'i') }, 
        isAvailable: true 
      }).sort({ createdAt: -1 });

      if (latestProduct) {
        categoriesWithProducts.push({
          ...cat.toObject(),
          imageUrl: latestProduct.images && latestProduct.images.length > 0 ? latestProduct.images[0] : "",
        });
      }
    }
    const categories = categoriesWithProducts;

    return {
      settings: JSON.parse(JSON.stringify(settings)),
      featuredProducts: JSON.parse(JSON.stringify(featuredProducts)),
      popularProducts: JSON.parse(JSON.stringify(popularProducts)),
      newArrivals: JSON.parse(JSON.stringify(newArrivals)),
      categories: JSON.parse(JSON.stringify(categories)),
    };
  } catch (e) {
    console.error("Failed to load home data:", e);
    return {
      settings: {
        heroTitle: "Discover Your Style",
        heroSubtitle: "Explore our latest collection of premium fashion designed for the modern woman.",
        heroImageUrl: "/hero_botanical.png",
        heroCountdownDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
        currency: "$",
      },
      featuredProducts: [],
      popularProducts: [],
      newArrivals: [],
      categories: [],
    };
  }
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const { settings, featuredProducts, popularProducts, newArrivals, categories } = await getHomeData();

  // Load translations matching current locale
  const translationsRaw = await Translation.find({});
  const t = (key: string): string => {
    const item = translationsRaw.find((item: any) => item.key === key);
    if (!item) return key;
    let val = "";
    if (typeof item.translations?.get === "function") {
      val = item.translations.get(lang);
    } else if (item.translations) {
      val = item.translations[lang];
    }
    return val || item.translations?.get?.("en") || item.translations?.["en"] || key;
  };

  const getProductLink = (p: any) => {
    if (settings.productUrlFormat !== "id") {
      const slug = p.name
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
      return `/${lang}/product/${slug}`;
    }
    return `/${lang}/product/${p._id}`;
  };

  const allProducts = [...featuredProducts, ...popularProducts, ...newArrivals];

  const renderProductCard = (product: any) => {
    const isBestSeller = product.ratings >= 4.5 && product.reviewsCount >= 3;
    const isSale = product.isOnSale;

    return (
      <Link href={getProductLink(product)} key={product._id} className="prod-card">
        <div className="prod-img-container">
          <img 
            src={product.images[0] || "/placeholder.png"} 
            alt={product.name} 
            className="prod-img"
          />
          {isSale && (
            <span className="badge-custom badge-sale">{t("Sale") || "SALE"}</span>
          )}
          {!isSale && isBestSeller && (
            <span className="badge-custom badge-best">{t("Best Seller") || "BEST SELLER"}</span>
          )}
        </div>
        <div className="prod-details">
          <span className="prod-category">{t(product.category)}</span>
          <h3 className="prod-title">{product.name}</h3>
          
          <div className="rating-row">
            <div className="rating-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  fill={i < Math.floor(product.ratings) ? "#fbbf24" : "none"} 
                  stroke="#fbbf24"
                />
              ))}
            </div>
            <span className="rating-count">({product.reviewsCount} {t("reviews")})</span>
          </div>

          <div className="price-row-custom">
            <span className="price-current">
              {settings.currency}{product.price.toFixed(2)}
            </span>
            {product.isOnSale && product.salePrice && (
              <span className="price-old">
                {settings.currency}{product.salePrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <main style={styles.main}>
      <style>{`
        .custom-section {
          padding: 60px 0;
        }
        .custom-section-bg {
          background-color: #101512;
          border-top: 1px solid rgba(198, 174, 112, 0.18);
          border-bottom: 1px solid rgba(198, 174, 112, 0.18);
        }
        .section-title-wrap {
          text-align: center;
          margin-bottom: 40px;
        }
        .section-title-custom {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 36px;
          font-weight: 700;
          color: #f2e7c8;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        .section-subtitle-custom {
          font-size: 15px;
          color: #9ca995;
          max-width: 600px;
          margin: 0 auto;
        }
        
        /* Category Grid */
        .category-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .category-layout {
            grid-template-columns: 1.2fr 2fr;
          }
        }
        .category-subgrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        
        .cat-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.32);
          transition: all 0.3s ease;
          cursor: pointer;
          height: 200px;
          border: 1px solid rgba(198, 174, 112, 0.28);
          display: block;
        }
        .cat-card.large-cat {
          height: 100%;
          min-height: 424px;
        }
        @media (max-width: 767px) {
          .cat-card.large-cat {
            height: 200px;
            min-height: auto;
          }
        }
        .cat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
        }
        .cat-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .cat-card:hover .cat-card-img {
          transform: scale(1.06);
        }
        .cat-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(4, 8, 6, 0.88) 0%, rgba(4, 8, 6, 0.28) 62%, rgba(4, 8, 6, 0.05) 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 24px;
        }
        .cat-card-title {
          color: #ffffff;
          font-size: 22px;
          font-weight: 700;
          margin: 0;
          text-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .cat-card-count {
          color: rgba(255, 255, 255, 0.85);
          font-size: 11px;
          margin-top: 4px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        /* Product Cards */
        .product-grid-custom {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 30px;
        }
        @media (max-width: 540px) {
          .product-grid-custom {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }
        .prod-card {
          background: #171d19;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(198, 174, 112, 0.24);
          transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .prod-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);
        }
        .prod-img-container {
          height: 290px;
          position: relative;
          background-color: #0d110f;
          overflow: hidden;
        }
        @media (max-width: 540px) {
          .prod-img-container {
            height: 200px;
          }
        }
        .prod-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .prod-card:hover .prod-img {
          transform: scale(1.04);
        }
        .badge-custom {
          position: absolute;
          top: 12px;
          left: 12px;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .badge-sale {
          background-color: #7e9b62;
        }
        .badge-best {
          background-color: #b49a58;
        }
        .prod-details {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .prod-category {
          font-size: 10px;
          font-weight: 600;
          color: #9ca995;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .prod-title {
          font-size: 16px;
          font-weight: 600;
          color: #f3efe5;
          margin-bottom: 8px;
          line-height: 1.35;
          height: 42px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .rating-row {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          gap: 4px;
        }
        .rating-stars {
          display: flex;
          gap: 2px;
        }
        .rating-count {
          font-size: 12px;
          color: #9ca995;
          margin-left: 4px;
        }
        .price-row-custom {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-top: auto;
        }
        .price-current {
          font-size: 18px;
          font-weight: 700;
          color: #f2e7c8;
        }
        .price-old {
          font-size: 14px;
          text-decoration: line-through;
          color: #88889d;
        }
      `}</style>

      <HeroSlider
        lang={lang}
        imageUrl={settings.heroImageUrl}
      />

      {/* 1. Featured Collection Section */}
      <section className="custom-section">
        <div className="container">
          <div style={styles.sectionHeader}>
            <h2 className="section-title-custom" style={{ margin: 0 }}>{t("Featured Collection")}</h2>
            <Link href={`/${lang}/shop`} style={styles.viewAllLink}>
              {t("View All Products")} &rarr;
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div style={styles.emptyState}>
              <p>{t("No products found.")}</p>
            </div>
          ) : (
            <div className="product-grid-custom">
              {featuredProducts.map(renderProductCard)}
            </div>
          )}
        </div>
      </section>

      {/* 2. Shop by Category Section */}
      {categories.length > 0 && (
        <section className="custom-section custom-section-bg">
          <div className="container">
            <div className="section-title-wrap">
              <h2 className="section-title-custom">{t("Shop by Category")}</h2>
              <p className="section-subtitle-custom">{t("Browse by your favorite categories and find what fits you best")}</p>
            </div>

            <div className="category-layout">
              {/* Large primary category card */}
              <Link 
                href={`/${lang}/shop?category=${categories[0].slug}`} 
                className="cat-card large-cat"
              >
                <img 
                  src={categories[0].imageUrl || "/placeholder.png"} 
                  alt={categories[0].name} 
                  className="cat-card-img" 
                />
                <div className="cat-card-overlay">
                  <h3 className="cat-card-title">{t(categories[0].name)}</h3>
                  <span className="cat-card-count">{t("Explore Collection")}</span>
                </div>
              </Link>

              {/* Subgrid containing secondary categories */}
              {categories.length > 1 && (
                <div className="category-subgrid">
                  {categories.slice(1, 5).map((cat: any) => (
                    <Link 
                      key={cat.slug || cat.name}
                      href={`/${lang}/shop?category=${cat.slug}`} 
                      className="cat-card"
                    >
                      <img 
                        src={cat.imageUrl || "/placeholder.png"} 
                        alt={cat.name} 
                        className="cat-card-img" 
                      />
                      <div className="cat-card-overlay">
                        <h3 className="cat-card-title">{t(cat.name)}</h3>
                        <span className="cat-card-count">{t("Explore")}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. Popular This Week Section */}
      <section className="custom-section">
        <div className="container">
          <div className="section-title-wrap">
            <h2 className="section-title-custom">{t("Popular This Week")}</h2>
            <p className="section-subtitle-custom">{t("Top trending styles loved by our customers this week")}</p>
          </div>

          {popularProducts.length === 0 ? (
            <div style={styles.emptyState}>
              <p>{t("No products found.")}</p>
            </div>
          ) : (
            <div className="product-grid-custom">
              {popularProducts.map(renderProductCard)}
            </div>
          )}
        </div>
      </section>

      {/* 4. New Arrivals Section */}
      <section className="custom-section custom-section-bg">
        <div className="container">
          <div className="section-title-wrap">
            <h2 className="section-title-custom">{t("New Arrivals")}</h2>
            <p className="section-subtitle-custom">{t("Discover our latest additions and update your wardrobe")}</p>
          </div>

          {newArrivals.length === 0 ? (
            <div style={styles.emptyState}>
              <p>{t("No products found.")}</p>
            </div>
          ) : (
            <div className="product-grid-custom">
              {newArrivals.map(renderProductCard)}
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section id="about" style={styles.trustSection}>
        <div className="container" style={styles.trustGrid}>
          <div style={styles.trustCard}>
            <div style={styles.trustIconContainer}>
              <Truck size={32} color="var(--primary)" />
            </div>
            <h4 style={styles.trustTitle}>{t("Free Shipping")}</h4>
            <p style={styles.trustText}>
              {t("On all orders above")} {settings.currency}150. {t("Delivery within 2-3 business days.")}
            </p>
          </div>
          <div style={styles.trustCard}>
            <div style={styles.trustIconContainer}>
              <ShieldCheck size={32} color="var(--primary)" />
            </div>
            <h4 style={styles.trustTitle}>{t("Secure Checkout")}</h4>
            <p style={styles.trustText}>
              {t("All transactions are encrypted and processed through trusted gateways.")}
            </p>
          </div>
          <div style={styles.trustCard}>
            <div style={styles.trustIconContainer}>
              <RotateCcw size={32} color="var(--primary)" />
            </div>
            <h4 style={styles.trustTitle}>{t("Easy Returns")}</h4>
            <p style={styles.trustText}>
              {t("We offer a 30-day return policy. Items must be unworn and in original packaging.")}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "80vh",
  },
  hero: {
    background: "radial-gradient(circle at 80% 20%, rgba(80, 108, 68, 0.35), transparent 38%), linear-gradient(135deg, #080b09 0%, #151c17 58%, #0b0d0c 100%)",
    padding: "clamp(42px, 7vw, 78px) 0",
    color: "#ffffff",
    overflow: "hidden",
  },
  heroContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    gap: "28px",
    flexWrap: "wrap",
  },
  heroLeft: {
    flex: "1 1 450px",
    animation: "fadeIn 0.8s ease-out",
    minWidth: 0,
  },
  offerLabel: {
    fontSize: "14px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "2.5px",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: "16px",
    display: "block",
  },
  heroTitle: {
    fontFamily: "var(--font-serif)",
    fontSize: "clamp(36px, 5.5vw, 60px)",
    fontWeight: "500",
    lineHeight: "1.1",
    letterSpacing: "-0.5px",
    color: "#ffffff",
    marginBottom: "20px",
  },
  heroSubtitle: {
    fontSize: "clamp(15px, 2vw, 18px)",
    color: "#c9d0bf",
    maxWidth: "540px",
    marginBottom: "32px",
    lineHeight: "1.65",
  },
  btnGroup: {
    display: "flex",
    gap: "16px",
    marginTop: "40px",
    flexWrap: "wrap",
  },
  heroTrust: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    alignItems: "center",
    color: "#b9c89b",
    fontSize: "11px",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    marginTop: "24px",
  },
  heroBtnWhite: {
    backgroundColor: "#c6ad6e",
    color: "#121510",
    border: "1px solid #d9c486",
    fontWeight: "700",
    padding: "16px 36px",
    borderRadius: "30px",
    letterSpacing: "0.5px",
    transition: "transform 0.2s ease",
  },
  heroBtnRed: {
    backgroundColor: "transparent",
    color: "#e5ddc5",
    border: "1px solid rgba(229, 221, 197, 0.6)",
    fontWeight: "700",
    padding: "14px 36px",
    borderRadius: "30px",
    letterSpacing: "0.5px",
    transition: "transform 0.2s ease",
  },
  heroRight: {
    flex: "1 1 350px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  imageFrame: {
    width: "100%",
    maxWidth: "460px",
    height: "clamp(320px, 45vw, 500px)",
    borderRadius: "4px",
    overflow: "hidden",
    boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
    border: "1px solid rgba(198,174,112,0.42)",
    position: "relative",
  },
  heroImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
    flexWrap: "wrap",
    gap: "16px",
  },
  viewAllLink: {
    color: "#c6ad6e",
    fontWeight: "700",
    fontSize: "15px",
    textDecoration: "none",
    letterSpacing: "0.5px",
  },
  emptyState: {
    padding: "60px",
    textAlign: "center",
    backgroundColor: "#171d19",
    borderRadius: "16px",
    border: "1px dashed var(--border-color)",
  },
  trustSection: {
    backgroundColor: "#0e1210",
    padding: "clamp(48px, 6vw, 72px) 0",
    borderTop: "1px solid rgba(198, 174, 112, 0.18)",
  },
  trustGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "40px",
  },
  trustCard: {
    padding: "32px 24px",
    borderRadius: "16px",
    backgroundColor: "#151b17",
    border: "1px solid rgba(198, 174, 112, 0.2)",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: "transform 0.3s ease",
  },
  trustIconContainer: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    backgroundColor: "rgba(185, 200, 155, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  trustTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#f2e7c8",
    marginBottom: "10px",
  },
  trustText: {
    fontSize: "14px",
    color: "#9ca995",
    lineHeight: "1.55",
  },
};
