"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Star, Heart, Share2, Plus, Minus, ArrowLeft, 
  ShieldCheck, RotateCcw, Award, Check, MessageSquare, Loader2
} from "lucide-react";
import { useApp, CartItem } from "@/context/AppContext";
import ProductImageGallery from "@/components/ProductImageGallery";

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

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
  stock: number;
  isOnSale: boolean;
  isAvailable: boolean;
  reviews?: Review[];
}

interface ProductDetailClientProps {
  product: Product;
  currency: string;
  settings?: any;
}

export default function ProductDetailClient({ product, currency, settings }: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart, t } = useApp();
  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };
  
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  const [inWishlist, setInWishlist] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("wishlist");
      if (stored) {
        try {
          const list = JSON.parse(stored);
          setInWishlist(list.some((item: any) => item._id === product._id || item.id === product._id));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [product._id]);

  const toggleWishlist = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("wishlist");
      let list = [];
      if (stored) {
        try {
          list = JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }
      }
      
      const exists = list.some((item: any) => item._id === product._id || item.id === product._id);
      if (exists) {
        list = list.filter((item: any) => item._id !== product._id && item.id !== product._id);
        setInWishlist(false);
        triggerToast("Removed from wishlist!");
      } else {
        list.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || "/placeholder.png",
        });
        setInWishlist(true);
        triggerToast("Added to wishlist!");
      }
      localStorage.setItem("wishlist", JSON.stringify(list));
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      triggerToast("Link copied to clipboard!");
    }
  };

  // Tabs & Reviews states
  const [activeTab, setActiveTab] = useState<"description" | "reviews" | "shipping" | "size">("description");
  const [reviewsList, setReviewsList] = useState<Review[]>(product.reviews || []);
  const [ratingsAvg, setRatingsAvg] = useState(product.ratings);
  const [reviewsTotal, setReviewsTotal] = useState(product.reviewsCount);

  // Review Form state
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const handleAddToCart = () => {
    const item: CartItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      size: selectedSize,
      color: selectedColor,
      image: product.images[0] || "/placeholder.png",
    };
    
    addToCart(item);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  };

  const handleBuyNow = () => {
    const item: CartItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      size: selectedSize,
      color: selectedColor,
      image: product.images[0] || "/placeholder.png",
    };
    
    addToCart(item);
    // Use window.location.pathname to extract current lang prefix
    const pathParts = window.location.pathname.split("/");
    const langPrefix = pathParts.length > 1 && pathParts[1] ? `/${pathParts[1]}` : "";
    setTimeout(() => router.push(`${langPrefix}/checkout`), 100);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      setReviewError("Please fill in all fields.");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");
    setReviewSuccess(false);

    try {
      const res = await fetch(`/api/products/${product._id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: reviewName,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      setReviewsList(prev => [...prev, data.review]);
      setRatingsAvg(data.ratings);
      setReviewsTotal(data.reviewsCount);
      setReviewSuccess(true);
      
      // Reset form
      setReviewName("");
      setReviewRating(5);
      setReviewComment("");
    } catch (err: any) {
      setReviewError(err.message || "Something went wrong.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const isOutOfStock = product.stock <= 0;

  // Star distribution calculator
  const starDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviewsList.filter(r => Math.round(r.rating) === star).length;
    const percentage = reviewsList.length > 0 ? (count / reviewsList.length) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div className="container" style={styles.pageContainer}>
      {/* Back Button */}
      <Link href="/shop" style={styles.backBtn}>
        <ArrowLeft size={16} />
        {tr("back_to_shop", "Back to Shop")}
      </Link>

      {/* Success Alert */}
      {addedMessage && (
        <div style={styles.successAlert} className="fade-in">
          <span>✓ {tr("added_to_cart_success", "Added to cart successfully!")}</span>
          <Link href="/cart" style={styles.viewCartLink}>{tr("view_cart", "View Cart")}</Link>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div style={styles.successAlert} className="fade-in">
          <span>✓ {toastMessage}</span>
        </div>
      )}

      <div style={styles.grid}>
        {/* Left Side: Images */}
        <div style={styles.imageColumn}>
          <ProductImageGallery images={product.images} alt={product.name} />
        </div>

        {/* Right Side: Product Details */}
        <div style={styles.detailsColumn}>
          <div style={styles.header}>
            <span style={styles.brand}>{product.brand}</span>
            <div style={styles.actionRow}>
              <button 
                onClick={toggleWishlist}
                style={{
                  ...styles.iconBtn,
                  color: inWishlist ? "#ef4444" : "var(--text-main)",
                }} 
                aria-label="Add to Wishlist"
              >
                <Heart size={20} fill={inWishlist ? "currentColor" : "none"} />
              </button>
              <button 
                onClick={handleShare}
                style={styles.iconBtn} 
                aria-label="Share"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>

          <h1 style={styles.title}>{product.name}</h1>

          {/* Rating */}
          <div style={styles.ratingRow}>
            <div className="rating-stars" style={{ display: "flex", gap: "2px" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  fill={i < Math.floor(ratingsAvg) ? "#fbbf24" : "none"} 
                  stroke="#fbbf24"
                />
              ))}
            </div>
            <span style={styles.ratingText}>
              {ratingsAvg.toFixed(1)} ({reviewsTotal} {t("reviews") || "reviews"})
            </span>
          </div>

          {/* Pricing */}
          <div style={styles.priceRow}>
            <span style={styles.price}>{currency}{product.price.toFixed(2)}</span>
            {product.isOnSale && product.salePrice && (
              <span style={styles.oldPrice}>{currency}{product.salePrice.toFixed(2)}</span>
            )}
            {product.isOnSale && (
              <span style={styles.saleBadge}>{t("sale") || "SALE"}</span>
            )}
          </div>

          <p style={styles.description}>{product.description}</p>

          <hr style={styles.divider} />

          {/* Color Selector */}
          {product.colors.length > 0 && (
            <div style={styles.selectorSection}>
              <h4 style={styles.selectorLabel}>{t("color") || "COLOR"}</h4>
              <div style={styles.colorRow}>
                {product.colors.map((color) => (
                  <button 
                    key={color} 
                    style={{ 
                      ...styles.colorCircle, 
                      backgroundColor: color,
                      boxShadow: selectedColor === color ? "0 0 0 2px white, 0 0 0 4px var(--secondary)" : "none"
                    }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes.length > 0 && (
            <div style={styles.selectorSection}>
              <h4 style={styles.selectorLabel}>{t("size") || "SIZE"}</h4>
              <div style={styles.sizeRow}>
                {product.sizes.map((size) => (
                  <button 
                    key={size} 
                    style={{ 
                      ...styles.sizeBox, 
                      backgroundColor: selectedSize === size ? "var(--secondary)" : "transparent",
                      color: selectedSize === size ? "white" : "var(--secondary)",
                    }}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div style={styles.qtySection}>
            <h4 style={styles.selectorLabel}>{t("quantity") || "QUANTITY"}</h4>
            <div style={styles.qtyRow}>
              <div style={styles.qtySelector}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  style={styles.qtyBtn}
                  disabled={isOutOfStock}
                >
                  <Minus size={16} />
                </button>
                <span style={styles.qtyVal}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} 
                  style={styles.qtyBtn}
                  disabled={isOutOfStock}
                >
                  <Plus size={16} />
                </button>
              </div>
              <span style={styles.stockLabel}>
                {isOutOfStock ? (t("out_of_stock") || "Out of Stock") : `${product.stock} ${t("items_available") || "items available"}`}
              </span>
            </div>
          </div>

          {/* Buy Buttons */}
          <div style={styles.btnSection}>
            <button 
              className="btn-add-cart"
              style={{ ...styles.actionButton, ...styles.cartButton }} 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {tr("add_to_cart", "Add to Cart")}
            </button>
            <button 
              className="btn-buy-now"
              style={{ ...styles.actionButton, ...styles.buyButton }} 
              onClick={handleBuyNow}
              disabled={isOutOfStock}
            >
              {tr("buy_now", "Buy Now")} &rarr;
            </button>
          </div>

          {/* Trust Badges */}
          <div style={styles.trustBadgesRow}>
            <div style={styles.trustBadgeItem}>
              <ShieldCheck size={18} color="#10b981" />
              <span>{tr("secure_payment", "Secure Payment")}</span>
            </div>
            <div style={styles.trustBadgeItem}>
              <RotateCcw size={18} color="#3b82f6" />
              <span>{tr("free_returns", "Free Returns")}</span>
            </div>
            <div style={styles.trustBadgeItem}>
              <Award size={18} color="#fbbf24" />
              <span>{tr("verified_reviews", "Verified Reviews")}</span>
            </div>
          </div>

          {/* Shipping Info Card */}
          <div style={styles.shippingCard}>
            <h4 style={styles.shippingTitle}>{tr("shipping_information", "Shipping Information")}</h4>
            <p style={styles.shippingText}>{tr("estimated_delivery", "Estimated delivery: 3-5 business days")}</p>
            <p style={styles.shippingText}>{tr("free_shipping_min", "Free shipping on orders over")} {currency}150.00</p>
          </div>
        </div>
      </div>

      {/* Product Details Specs Table */}
      <div style={styles.detailsTableSection}>
        <h3 style={styles.sectionHeader}>{tr("product_details", "Product Details")}</h3>
        <div style={styles.tableWrapper}>
          <table style={styles.detailsTable}>
            <tbody>
              <tr style={styles.tableRow}>
                <td style={styles.tableLabel}>{t("category") || "Category"}</td>
                <td style={styles.tableValue}>{product.category}</td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={styles.tableLabel}>{t("brand") || "Brand"}</td>
                <td style={styles.tableValue}>{product.brand}</td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={styles.tableLabel}>{t("available_variants") || "Available Variants"}</td>
                <td style={styles.tableValue}>
                  {[
                    product.sizes.length > 0 ? "Size" : "", 
                    product.colors.length > 0 ? "Color" : ""
                  ].filter(Boolean).join(", ") || "None"}
                </td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={styles.tableLabel}>{t("selected_variant") || "Selected Variant"}</td>
                <td style={styles.tableValue}>
                  {[
                    selectedSize ? `Size: ${selectedSize}` : "", 
                    selectedColor ? `Color: ${selectedColor}` : ""
                  ].filter(Boolean).join(" / ") || "Default"}
                </td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={styles.tableLabel}>{t("stock_available") || "Stock Available"}</td>
                <td style={{ ...styles.tableValue, color: product.stock > 0 ? "#10b981" : "#ef4444", fontWeight: "600" }}>
                  {product.stock > 0 ? `${product.stock} units` : "Out of Stock"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabs Layout */}
      <div style={styles.tabsSection}>
        <div style={styles.tabsHeader}>
          <button 
            onClick={() => setActiveTab("description")} 
            style={{ ...styles.tabHeaderBtn, borderBottomColor: activeTab === "description" ? "var(--secondary)" : "transparent" }}
          >
            {t("description") || "Description"}
          </button>
          <button 
            onClick={() => setActiveTab("reviews")} 
            style={{ ...styles.tabHeaderBtn, borderBottomColor: activeTab === "reviews" ? "var(--secondary)" : "transparent" }}
          >
            {t("reviews") || "Reviews"} ({reviewsTotal})
          </button>
          <button 
            onClick={() => setActiveTab("shipping")} 
            style={{ ...styles.tabHeaderBtn, borderBottomColor: activeTab === "shipping" ? "var(--secondary)" : "transparent" }}
          >
            {t("shipping_and_returns") || "Shipping & Returns"}
          </button>
          <button 
            onClick={() => setActiveTab("size")} 
            style={{ ...styles.tabHeaderBtn, borderBottomColor: activeTab === "size" ? "var(--secondary)" : "transparent" }}
          >
            {t("size_guide") || "Size Guide"}
          </button>
        </div>

        <div style={styles.tabsContent}>
          {/* 1. Description Tab */}
          {activeTab === "description" && (
            <div style={styles.tabPane} className="fade-in">
              <p style={styles.tabText}>{product.description}</p>
            </div>
          )}

          {/* 2. Reviews Tab */}
          {activeTab === "reviews" && (
            <div style={styles.tabPane} className="fade-in">
              <div style={styles.reviewsGrid}>
                {/* Write Review Form */}
                <div style={styles.writeReviewColumn}>
                  <form onSubmit={handleReviewSubmit} style={styles.reviewForm}>
                    <h4 style={styles.reviewFormTitle}>{t("write_a_review") || "Write a Review"}</h4>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>Share your thoughts with other customers.</p>
                    
                    {reviewSuccess && (
                      <div style={styles.reviewSuccessAlert}>
                        ✓ {t("review_submitted_success") || "Review submitted successfully!"}
                      </div>
                    )}
                    {reviewError && (
                      <div style={styles.reviewErrorAlert}>
                        {reviewError}
                      </div>
                    )}

                    <div style={styles.reviewFormGroup}>
                      <label style={styles.reviewLabel}>{t("your_rating") || "Your Rating"}:</label>
                      <div style={{ display: "flex", gap: "6px", margin: "6px 0" }}>
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => setReviewRating(starVal)}
                            style={styles.starInputBtn}
                            aria-label={`Rate ${starVal} stars`}
                          >
                            <Star 
                              size={22} 
                              fill={starVal <= reviewRating ? "#fbbf24" : "none"} 
                              stroke="#fbbf24" 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={styles.reviewFormGroup}>
                      <label style={styles.reviewLabel}>{t("your_name") || "Your Name"}</label>
                      <input 
                        type="text" 
                        value={reviewName} 
                        onChange={(e) => setReviewName(e.target.value)} 
                        style={styles.reviewInput} 
                        placeholder={t("enter_your_name") || "Enter your name"}
                        required 
                      />
                    </div>

                    <div style={styles.reviewFormGroup}>
                      <label style={styles.reviewLabel}>{t("your_review") || "Your Review"}</label>
                      <textarea 
                        value={reviewComment} 
                        onChange={(e) => setReviewComment(e.target.value)} 
                        style={styles.reviewTextarea} 
                        placeholder={t("share_experience") || "Share your experience with this product..."}
                        required 
                      />
                    </div>

                    <button type="submit" disabled={submittingReview} style={styles.submitReviewBtn}>
                      {submittingReview ? <Loader2 size={16} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} /> : (t("submit_review") || "Submit Review")}
                    </button>
                  </form>
                </div>

                {/* Reviews Chart & List */}
                <div style={styles.reviewsListColumn}>
                  <div style={styles.ratingsSummaryRow}>
                    <div style={styles.avgRatingWrapper}>
                      <span style={styles.bigAvgRating}>{ratingsAvg.toFixed(1)}</span>
                      <div style={{ display: "flex", gap: "2px", margin: "4px 0" }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            fill={i < Math.floor(ratingsAvg) ? "#fbbf24" : "none"} 
                            stroke="#fbbf24"
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{reviewsTotal} {t("reviews") || "reviews"}</span>
                    </div>

                    <div style={styles.starBarsList}>
                      {starDistribution.map(({ star, count, percentage }) => (
                        <div key={star} style={styles.starBarRow}>
                          <span style={styles.barLabel}>{star} star</span>
                          <div style={styles.barTrack}>
                            <div style={{ ...styles.barFill, width: `${percentage}%` }}></div>
                          </div>
                          <span style={styles.barCount}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={styles.reviewsList}>
                    {reviewsList.length === 0 ? (
                      <div style={styles.emptyReviews}>
                        <MessageSquare size={32} color="#cbd5e1" style={{ marginBottom: "8px" }} />
                        <p>{t("no_reviews_yet") || "No reviews yet. Be the first to review this product!"}</p>
                      </div>
                    ) : (
                      reviewsList.map((rev) => (
                        <div key={rev._id || Math.random().toString()} style={styles.reviewItemCard}>
                          <div style={styles.reviewItemHeader}>
                            <div>
                              <div style={styles.reviewItemAuthor}>{rev.name}</div>
                              <div style={{ display: "flex", gap: "2px", margin: "4px 0" }}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={12} 
                                    fill={i < rev.rating ? "#fbbf24" : "none"} 
                                    stroke="#fbbf24"
                                  />
                                ))}
                              </div>
                            </div>
                            <span style={styles.reviewItemDate}>
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ""}
                            </span>
                          </div>
                          <p style={styles.reviewItemComment}>{rev.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Shipping & Returns Tab */}
          {activeTab === "shipping" && (
            <div style={styles.tabPane} className="fade-in">
              <div style={styles.policyBlock}>
                <h4 style={styles.policySubtitle}>{t("shipping_policy") || "Shipping Policy"}</h4>
                <p style={styles.tabText}>
                  {settings?.shippingPolicy || "We offer fast and reliable shipping to all locations. Orders are typically processed within 1-2 business days and delivered within 3-5 business days."}
                </p>
              </div>
              <div style={{ ...styles.policyBlock, marginTop: "24px" }}>
                <h4 style={styles.policySubtitle}>{t("returns_policy") || "Returns Policy"}</h4>
                <p style={styles.tabText}>
                  {settings?.returnsPolicy || "We offer a 30-day return policy. Items must be unworn, unwashed, and in original packaging with tags attached."}
                </p>
              </div>
            </div>
          )}

          {/* 4. Size Guide Tab */}
          {activeTab === "size" && (
            <div style={styles.tabPane} className="fade-in">
              <p style={{ ...styles.tabText, marginBottom: "16px" }}>
                {settings?.sizeGuideContent || "How to Measure:\n- Bust/Chest: Measure around the fullest part of your bust, keeping the tape level.\n- Waist: Measure around your natural waistline, which is the narrowest part of your waist.\n- Hips: Measure around the fullest part of your hips, approximately 7-8 inches below your waist."}
              </p>
              
              <h4 style={{ ...styles.policySubtitle, marginBottom: "12px" }}>{t("size_chart") || "Size Chart"}</h4>
              <div style={styles.tableWrapper}>
                <table style={styles.sizeTable}>
                  <thead>
                    <tr>
                      <th style={styles.sizeTh}>{t("size") || "Size"}</th>
                      <th style={styles.sizeTh}>{t("bust_inches") || "Bust (inches)"}</th>
                      <th style={styles.sizeTh}>{t("waist_inches") || "Waist (inches)"}</th>
                      <th style={styles.sizeTh}>{t("hips_inches") || "Hips (inches)"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={styles.sizeTr}>
                      <td style={styles.sizeTd}>XS</td>
                      <td style={styles.sizeTd}>32-34</td>
                      <td style={styles.sizeTd}>24-26</td>
                      <td style={styles.sizeTd}>34-36</td>
                    </tr>
                    <tr style={styles.sizeTr}>
                      <td style={styles.sizeTd}>S</td>
                      <td style={styles.sizeTd}>34-36</td>
                      <td style={styles.sizeTd}>26-28</td>
                      <td style={styles.sizeTd}>36-38</td>
                    </tr>
                    <tr style={styles.sizeTr}>
                      <td style={styles.sizeTd}>M</td>
                      <td style={styles.sizeTd}>36-38</td>
                      <td style={styles.sizeTd}>28-30</td>
                      <td style={styles.sizeTd}>38-40</td>
                    </tr>
                    <tr style={styles.sizeTr}>
                      <td style={styles.sizeTd}>L</td>
                      <td style={styles.sizeTd}>38-40</td>
                      <td style={styles.sizeTd}>30-32</td>
                      <td style={styles.sizeTd}>40-42</td>
                    </tr>
                    <tr style={styles.sizeTr}>
                      <td style={styles.sizeTd}>XL</td>
                      <td style={styles.sizeTd}>40-42</td>
                      <td style={styles.sizeTd}>32-34</td>
                      <td style={styles.sizeTd}>42-44</td>
                    </tr>
                    <tr style={styles.sizeTr}>
                      <td style={styles.sizeTd}>XXL</td>
                      <td style={styles.sizeTd}>42-44</td>
                      <td style={styles.sizeTd}>34-36</td>
                      <td style={styles.sizeTd}>44-46</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    paddingTop: "30px",
    paddingBottom: "80px",
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text-muted)",
    marginBottom: "24px",
    cursor: "pointer",
  },
  successAlert: {
    backgroundColor: "#ecfdf5",
    color: "#065f46",
    padding: "16px 20px",
    borderRadius: "var(--radius-md)",
    border: "1px solid #a7f3d0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    fontWeight: "500",
  },
  viewCartLink: {
    color: "#047857",
    fontWeight: "700",
    textDecoration: "underline",
  },
  grid: {
    display: "flex",
    gap: "50px",
    flexWrap: "wrap",
  },
  imageColumn: {
    flex: "1 1 500px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  detailsColumn: {
    flex: "1 1 400px",
    textAlign: "left",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  brand: {
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    color: "var(--text-muted)",
    textTransform: "uppercase",
  },
  actionRow: {
    display: "flex",
    gap: "10px",
  },
  iconBtn: {
    color: "var(--text-muted)",
    padding: "6px",
    borderRadius: "50%",
    transition: "color 0.2s",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  title: {
    fontSize: "36px",
    fontWeight: "700",
    color: "var(--secondary)",
    lineHeight: "1.2",
    marginBottom: "12px",
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  ratingText: {
    fontSize: "13px",
    color: "var(--text-muted)",
    fontWeight: "500",
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
  },
  price: {
    fontSize: "28px",
    fontWeight: "700",
    color: "var(--secondary)",
  },
  oldPrice: {
    fontSize: "18px",
    textDecoration: "line-through",
    color: "var(--text-muted)",
  },
  saleBadge: {
    backgroundColor: "var(--primary)",
    color: "white",
    fontSize: "11px",
    fontWeight: "700",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  description: {
    fontSize: "15px",
    color: "var(--text-main)",
    lineHeight: "1.6",
    marginBottom: "24px",
  },
  divider: {
    border: 0,
    borderTop: "1px solid var(--border-color)",
    marginBottom: "24px",
  },
  selectorSection: {
    marginBottom: "24px",
  },
  selectorLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--secondary)",
    marginBottom: "12px",
    letterSpacing: "1px",
  },
  colorRow: {
    display: "flex",
    gap: "12px",
  },
  colorCircle: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "1px solid var(--border-color)",
    cursor: "pointer",
    transition: "transform 0.15s",
  },
  sizeRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  sizeBox: {
    minWidth: "46px",
    height: "40px",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s",
    cursor: "pointer",
  },
  qtySection: {
    marginBottom: "32px",
  },
  qtyRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  qtySelector: {
    display: "flex",
    alignItems: "center",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    height: "40px",
    overflow: "hidden",
  },
  qtyBtn: {
    width: "40px",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-muted)",
    transition: "background-color 0.2s",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  qtyVal: {
    width: "40px",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: "600",
  },
  stockLabel: {
    fontSize: "13px",
    color: "var(--text-muted)",
    fontWeight: "500",
  },
  btnSection: {
    display: "flex",
    gap: "16px",
    marginBottom: "32px",
    flexWrap: "wrap",
  },
  actionButton: {
    flex: 1,
    height: "54px",
    borderRadius: "var(--radius-md)",
    fontSize: "15px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    transition: "all 0.2s",
    cursor: "pointer",
  },
  cartButton: {
    backgroundColor: "transparent",
    color: "var(--secondary)",
    border: "2px solid var(--secondary)",
  },
  buyButton: {
    backgroundColor: "var(--secondary)",
    color: "white",
    border: "none",
  },
  trustBadgesRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 0",
    borderTop: "1px solid var(--border-color)",
    borderBottom: "1px solid var(--border-color)",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "12px",
  },
  trustBadgeItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-main)",
  },
  shippingCard: {
    padding: "20px",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    backgroundColor: "var(--bg-light)",
  },
  shippingTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--secondary)",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  shippingText: {
    fontSize: "13px",
    color: "var(--text-muted)",
    marginBottom: "4px",
  },
  detailsTableSection: {
    marginTop: "48px",
    textAlign: "left",
  },
  sectionHeader: {
    fontSize: "20px",
    fontWeight: "700",
    color: "var(--secondary)",
    marginBottom: "20px",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  detailsTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  tableRow: {
    borderBottom: "1px solid var(--border-color)",
  },
  tableLabel: {
    padding: "14px 0",
    fontWeight: "600",
    color: "var(--text-muted)",
    width: "250px",
  },
  tableValue: {
    padding: "14px 0",
    color: "var(--text-main)",
  },
  tabsSection: {
    marginTop: "60px",
    textAlign: "left",
  },
  tabsHeader: {
    display: "flex",
    borderBottom: "1px solid var(--border-color)",
    gap: "30px",
    overflowX: "auto",
  },
  tabHeaderBtn: {
    padding: "16px 0",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    fontWeight: "700",
    fontSize: "16px",
    color: "var(--text-muted)",
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  tabsContent: {
    padding: "30px 0",
  },
  tabPane: {},
  tabText: {
    fontSize: "15px",
    lineHeight: "1.7",
    color: "var(--text-main)",
  },
  policyBlock: {},
  policySubtitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--secondary)",
    marginBottom: "8px",
  },
  sizeTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
    marginTop: "16px",
  },
  sizeTh: {
    padding: "12px",
    backgroundColor: "var(--bg-light)",
    fontWeight: "700",
    border: "1px solid var(--border-color)",
    textAlign: "center",
  },
  sizeTr: {
    borderBottom: "1px solid var(--border-color)",
  },
  sizeTd: {
    padding: "12px",
    border: "1px solid var(--border-color)",
    textAlign: "center",
    color: "var(--text-main)",
  },
  reviewsGrid: {
    display: "flex",
    gap: "50px",
    flexWrap: "wrap",
  },
  writeReviewColumn: {
    flex: "1 1 350px",
  },
  reviewForm: {
    backgroundColor: "var(--bg-light)",
    padding: "24px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
  },
  reviewFormTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "var(--secondary)",
    margin: 0,
  },
  reviewFormGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "16px",
  },
  reviewLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--secondary)",
  },
  reviewInput: {
    padding: "10px 12px",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    fontSize: "14px",
    outline: "none",
  },
  reviewTextarea: {
    padding: "12px",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    fontSize: "14px",
    minHeight: "100px",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },
  starInputBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  submitReviewBtn: {
    backgroundColor: "var(--secondary)",
    color: "white",
    padding: "12px 24px",
    border: "none",
    borderRadius: "var(--radius-sm)",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    width: "100%",
  },
  reviewSuccessAlert: {
    backgroundColor: "#ecfdf5",
    color: "#065f46",
    padding: "10px 14px",
    borderRadius: "var(--radius-sm)",
    fontSize: "13px",
    marginBottom: "16px",
    fontWeight: "500",
  },
  reviewErrorAlert: {
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    padding: "10px 14px",
    borderRadius: "var(--radius-sm)",
    fontSize: "13px",
    marginBottom: "16px",
    fontWeight: "500",
  },
  reviewsListColumn: {
    flex: "1.5 1 450px",
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  ratingsSummaryRow: {
    display: "flex",
    gap: "30px",
    alignItems: "center",
    backgroundColor: "var(--bg-light)",
    padding: "20px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    flexWrap: "wrap",
  },
  avgRatingWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  bigAvgRating: {
    fontSize: "48px",
    fontWeight: "800",
    color: "var(--secondary)",
    lineHeight: 1,
  },
  starBarsList: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: "200px",
  },
  starBarRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "12px",
  },
  barLabel: {
    width: "45px",
    fontWeight: "600",
    color: "var(--text-muted)",
  },
  barTrack: {
    flex: 1,
    height: "6px",
    backgroundColor: "#e2e8f0",
    borderRadius: "3px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#fbbf24",
  },
  barCount: {
    width: "20px",
    textAlign: "right",
    fontWeight: "600",
  },
  reviewsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  emptyReviews: {
    textAlign: "center",
    padding: "40px 0",
    color: "var(--text-muted)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  reviewItemCard: {
    padding: "20px",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  reviewItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  reviewItemAuthor: {
    fontWeight: "700",
    color: "var(--secondary)",
    fontSize: "14px",
  },
  reviewItemDate: {
    fontSize: "12px",
    color: "var(--text-muted)",
  },
  reviewItemComment: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "1.6",
    color: "var(--text-main)",
  },
};
