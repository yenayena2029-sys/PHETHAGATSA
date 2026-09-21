"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageGalleryProps {
  images?: string[];
  alt: string;
}

export default function ProductImageGallery({ images = [], alt }: ProductImageGalleryProps) {
  const galleryImages = images.length > 0 ? images : ["/placeholder.png"];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = galleryImages[activeIndex] ?? galleryImages[0];
  const hasMultipleImages = galleryImages.length > 1;

  const selectImage = (index: number) => {
    setActiveIndex((index + galleryImages.length) % galleryImages.length);
  };

  return (
    <div style={styles.gallery}>
      <div style={styles.mainImageWrapper}>
        <img src={activeImage} alt={`${alt} image ${activeIndex + 1}`} style={styles.mainImage} />
        {hasMultipleImages && (
          <>
            <button
              type="button"
              aria-label="Previous product image"
              onClick={() => selectImage(activeIndex - 1)}
              style={{ ...styles.control, left: "12px" }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Next product image"
              onClick={() => selectImage(activeIndex + 1)}
              style={{ ...styles.control, right: "12px" }}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {hasMultipleImages && (
        <>
          <div style={styles.thumbnailRow}>
            {galleryImages.map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                aria-label={`View product image ${index + 1}`}
                aria-pressed={activeIndex === index}
                onClick={() => selectImage(index)}
                style={{
                  ...styles.thumbnailBtn,
                  borderColor: activeIndex === index ? "var(--secondary)" : "transparent",
                }}
              >
                <img src={image} alt="" style={styles.thumbnailImg} />
              </button>
            ))}
          </div>
          <div style={styles.dots} role="tablist" aria-label="Product images">
            {galleryImages.map((image, index) => (
              <button
                type="button"
                key={`dot-${image}-${index}`}
                role="tab"
                aria-label={`Go to product image ${index + 1}`}
                aria-selected={activeIndex === index}
                onClick={() => selectImage(index)}
                style={{
                  ...styles.dot,
                  backgroundColor: activeIndex === index ? "var(--secondary)" : "#cbd5e1",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  gallery: { display: "flex", flexDirection: "column" as const, gap: "12px" },
  mainImageWrapper: {
    height: "500px",
    position: "relative" as const,
    backgroundColor: "var(--bg-light)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden" as const,
    border: "1px solid var(--border-color)",
  },
  mainImage: { width: "100%", height: "100%", objectFit: "cover" as const },
  control: {
    position: "absolute" as const,
    top: "50%",
    transform: "translateY(-50%)",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.9)",
    color: "var(--text-main)",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(15,23,42,0.15)",
  },
  thumbnailRow: { display: "flex", gap: "12px", overflowX: "auto" as const },
  thumbnailBtn: {
    flex: "0 0 auto",
    width: "80px",
    height: "80px",
    backgroundColor: "var(--bg-light)",
    borderRadius: "var(--radius-md)",
    overflow: "hidden" as const,
    border: "2px solid transparent",
    padding: 0,
    cursor: "pointer",
  },
  thumbnailImg: { width: "100%", height: "100%", objectFit: "cover" as const },
  dots: { display: "flex", justifyContent: "center", gap: "6px" },
  dot: { width: "7px", height: "7px", padding: 0, border: "none", borderRadius: "50%", cursor: "pointer" },
};
