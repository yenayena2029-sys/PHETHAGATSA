"use client";

import React, { useState } from "react";
import { Edit, Trash, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import AliExpressImporter from "@/components/admin/AliExpressImporter";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  stock: number;
  sizes: string[];
  colors: string[];
  isOnSale: boolean;
  isFeatured: boolean;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
  currency: string;
}

export default function ProductsClient({ initialProducts, categories, currency }: ProductsClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState(categories[0]?.slug || "clothing");
  const [stock, setStock] = useState("");
  const [sizesInput, setSizesInput] = useState("");
  const [colorsInput, setColorsInput] = useState("");
  const [isOnSale, setIsOnSale] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setSalePrice("");
    setImageInput("");
    setImagesList([]);
    setCategory(categories[0]?.slug || "clothing");
    setStock("");
    setSizesInput("");
    setColorsInput("");
    setIsOnSale(false);
    setIsFeatured(false);
    setEditingProduct(null);
    setError("");
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setSalePrice(product.salePrice?.toString() || "");
    setImageInput("");
    setImagesList(product.images);
    setCategory(product.category);
    setStock(product.stock.toString());
    setSizesInput(product.sizes.join(", "));
    setColorsInput(product.colors.join(", "));
    setIsOnSale(product.isOnSale);
    setIsFeatured(product.isFeatured);
    setIsModalOpen(true);
  };

  const handleAliExpressImport = (importedProduct: any) => {
    resetForm();
    setName(importedProduct.title || "");
    
    // Suggest a price (e.g. 2x markup if we have a price)
    if (importedProduct.price) {
        try {
            const numPrice = parseFloat(importedProduct.price.replace(/[^0-9.]/g, ''));
            if (!isNaN(numPrice)) {
                setPrice((numPrice * 2).toFixed(2));
            }
        } catch(e) {}
    }
    
    setDescription(importedProduct.description || importedProduct.title || "");
    if (importedProduct.images && importedProduct.images.length > 0) {
        setImagesList(importedProduct.images);
    }
    
    if (importedProduct.colors && importedProduct.colors.length > 0) {
        setColorsInput(importedProduct.colors.join(", "));
    }
    
    if (importedProduct.sizes && importedProduct.sizes.length > 0) {
        setSizesInput(importedProduct.sizes.join(", "));
    }
    
    setStock("100"); // Default stock for dropshipping
    setIsModalOpen(true); // Open the modal so user can review and save
  };

  const handleAddUrl = () => {
    if (!imageInput.trim()) return;
    setImagesList([...imagesList, imageInput.trim()]);
    setImageInput("");
  };

  const handleRemoveImage = (index: number) => {
    setImagesList(imagesList.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload images");

      setImagesList([...imagesList, ...data.urls]);
    } catch (err: any) {
      setError(err.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete product");

      setProducts(products.filter((p) => p._id !== id));
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock || imagesList.length === 0) {
      setError("Please fill in required fields and add at least one image");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      name,
      description,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : undefined,
      images: imagesList,
      category,
      stock: Number(stock),
      sizes: sizesInput.split(",").map((s) => s.trim()).filter(Boolean),
      colors: colorsInput.split(",").map((s) => s.trim()).filter(Boolean),
      isOnSale,
      isFeatured,
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct._id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");

      if (editingProduct) {
        setProducts(products.map((p) => (p._id === data._id ? data : p)));
      } else {
        setProducts([data, ...products]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Products Management</h2>
          <p style={styles.subtitle}>Create, view, edit, and delete products in your store.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <AliExpressImporter onImport={handleAliExpressImport} />
          <button onClick={openAddModal} style={styles.addBtn}>
            <Plus size={16} style={{ marginRight: 6 }} />
            Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Image</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} style={styles.tr}>
                <td style={styles.td}>
                  <img src={product.images[0]} alt={product.name} style={styles.img} />
                </td>
                <td style={styles.td}>
                  <p style={styles.productName}>{product.name}</p>
                </td>
                <td style={styles.td}>{product.category}</td>
                <td style={styles.td}>
                  {currency}{product.price.toFixed(2)}
                  {product.isOnSale && product.salePrice && (
                    <span style={styles.oldPrice}>{currency}{product.salePrice.toFixed(2)}</span>
                  )}
                </td>
                <td style={styles.td}>
                  <span style={{ 
                    color: product.stock <= 5 ? "var(--primary)" : "inherit",
                    fontWeight: product.stock <= 5 ? "600" : "normal"
                  }}>
                    {product.stock}
                  </span>
                </td>
                <td style={styles.td}>
                  {product.isFeatured && <span style={styles.featuredBadge}>Featured</span>}
                  {product.isOnSale && <span style={styles.saleBadge}>Sale</span>}
                  {!product.isFeatured && !product.isOnSale && <span style={styles.standardBadge}>Standard</span>}
                </td>
                <td style={styles.td}>
                  <div style={styles.actionGroup}>
                    <button onClick={() => openEditModal(product)} style={styles.actionBtn}>
                      <Edit size={16} color="#4f46e5" />
                    </button>
                    <button onClick={() => handleDelete(product._id)} style={styles.actionBtn}>
                      <Trash size={16} color="#ef4444" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.modalBody}>
              {error && <div style={styles.modalError}>{error}</div>}

              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input"
                  style={{ height: "80px", resize: "vertical" }}
                  required
                />
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Price ({currency}) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-input" 
                    required 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Original Price (If on Sale)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="form-input" 
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category *</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-input"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Stock *</label>
                  <input 
                    type="number" 
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="form-input" 
                    required 
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label className="form-label">Product Images *</label>
                
                {/* Thumbnails Grid */}
                {imagesList.length > 0 && (
                  <div style={styles.thumbnailGrid}>
                    {imagesList.map((imgUrl, idx) => (
                      <div key={idx} style={styles.thumbnailWrapper}>
                        <img src={imgUrl} alt={`Preview ${idx + 1}`} style={styles.thumbnailImg} />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveImage(idx)} 
                          style={styles.thumbnailDeleteBtn}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Zone & Manual Input Row */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={styles.dropZone}>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      style={styles.fileInputHidden}
                      id="product-image-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="product-image-upload" style={styles.dropZoneLabel}>
                      {uploading ? (
                        <span>Uploading...</span>
                      ) : (
                        <>
                          <Plus size={20} style={{ marginBottom: 4 }} />
                          <span>Click to upload product images</span>
                        </>
                      )}
                    </label>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <input 
                      type="text" 
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      placeholder="Or paste an image URL here..."
                      className="form-input" 
                      style={{ flex: 1, margin: 0 }}
                    />
                    <button 
                      type="button" 
                      onClick={handleAddUrl} 
                      style={styles.addUrlBtn}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Sizes (Comma Separated)</label>
                  <input 
                    type="text" 
                    value={sizesInput}
                    onChange={(e) => setSizesInput(e.target.value)}
                    placeholder="S, M, L or 36, 37"
                    className="form-input" 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Colors (Comma Separated Hex)</label>
                  <input 
                    type="text" 
                    value={colorsInput}
                    onChange={(e) => setColorsInput(e.target.value)}
                    placeholder="#000000, #ffffff"
                    className="form-input" 
                  />
                </div>
              </div>

              <div style={styles.checkboxGroup}>
                <label style={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={isOnSale}
                    onChange={(e) => setIsOnSale(e.target.checked)}
                    style={styles.checkbox}
                  />
                  Mark as On Sale
                </label>
                <label style={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    style={styles.checkbox}
                  />
                  Featured Product
                </label>
              </div>

              <button 
                type="submit" 
                style={styles.submitBtn}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
  },
  addBtn: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    padding: "10px 18px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    borderBottom: "1px solid #e2e8f0",
    padding: "14px 20px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "14px 20px",
    fontSize: "14px",
    color: "#475569",
    verticalAlign: "middle",
  },
  img: {
    width: "40px",
    height: "48px",
    borderRadius: "4px",
    objectFit: "cover",
    backgroundColor: "#f1f5f9",
  },
  productName: {
    fontWeight: "600",
    color: "#0f172a",
  },
  oldPrice: {
    fontSize: "12px",
    textDecoration: "line-through",
    color: "#94a3b8",
    marginLeft: "6px",
  },
  actionGroup: {
    display: "flex",
    gap: "10px",
  },
  actionBtn: {
    padding: "6px",
    borderRadius: "4px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  featuredBadge: {
    fontSize: "11px",
    backgroundColor: "#eff6ff",
    color: "#3b82f6",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: "600",
    marginRight: "4px",
  },
  saleBadge: {
    fontSize: "11px",
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: "600",
  },
  standardBadge: {
    fontSize: "11px",
    backgroundColor: "#f1f5f9",
    color: "#64748b",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    maxWidth: "560px",
    width: "100%",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    maxHeight: "90vh",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
  },
  closeBtn: {
    color: "#94a3b8",
  },
  modalBody: {
    padding: "24px",
    overflowY: "auto",
  },
  modalError: {
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fca5a5",
    padding: "10px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    marginBottom: "16px",
    fontWeight: "500",
  },
  formRow: {
    display: "flex",
    gap: "16px",
  },
  checkboxGroup: {
    display: "flex",
    gap: "24px",
    margin: "16px 0 24px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#334155",
    cursor: "pointer",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    accentColor: "#0f172a",
  },
  submitBtn: {
    width: "100%",
    height: "48px",
    backgroundColor: "#0f172a",
    color: "white",
    fontSize: "14px",
    fontWeight: "700",
    borderRadius: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  thumbnailGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "12px",
  },
  thumbnailWrapper: {
    position: "relative",
    width: "70px",
    height: "80px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    backgroundColor: "#f8fafc",
  },
  thumbnailImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  thumbnailDeleteBtn: {
    position: "absolute",
    top: "4px",
    right: "4px",
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    color: "#ffffff",
    border: "none",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
    transition: "background-color 0.2s",
  },
  dropZone: {
    border: "2px dashed #cbd5e1",
    borderRadius: "8px",
    padding: "16px",
    textAlign: "center",
    backgroundColor: "#f8fafc",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  fileInputHidden: {
    display: "none",
  },
  dropZoneLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "500",
  },
  addUrlBtn: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    padding: "0 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
