const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;

export const southAfricaSeed = {
  categories: [
    { name: "Skincare", slug: "skincare" },
    { name: "Body Care", slug: "body-care" },
    { name: "Wellness", slug: "wellness" },
    { name: "Hair Care", slug: "hair-care" },
    { name: "Bath & Home", slug: "bath-home" },
  ],
  collections: [
    { name: "Cape Wellness Edit", slug: "cape-wellness-edit", active: true },
    { name: "Local Favourites", slug: "local-favourites", active: true },
    { name: "New Arrivals", slug: "new-arrivals", active: true },
    { name: "Self-Care Sets", slug: "self-care-sets", active: true },
  ],
  brands: [
    { name: "Aurum Botanicals", slug: "aurum-botanicals", active: true },
    { name: "Mzansi Glow", slug: "mzansi-glow", active: true },
    { name: "Karoo Wellness Co.", slug: "karoo-wellness-co", active: true },
    { name: "Cape Fynbos", slug: "cape-fynbos", active: true },
    { name: "Ubuntu Apothecary", slug: "ubuntu-apothecary", active: true },
  ],
  sizes: [
    { label: "50 ml", name: "50 ml", category: "Skincare" },
    { label: "100 ml", name: "100 ml", category: "Skincare" },
    { label: "200 ml", name: "200 ml", category: "Body Care" },
    { label: "250 g", name: "250 g", category: "Wellness" },
    { label: "500 g", name: "500 g", category: "Wellness" },
  ],
  colors: [
    { name: "Fynbos Rose", hex: "#b76e79", active: true },
    { name: "Karoo Clay", hex: "#b66a50", active: true },
    { name: "Aloe Green", hex: "#6f9470", active: true },
    { name: "Sandstone", hex: "#d7b899", active: true },
  ],
  templates: [
    { name: "Skincare Product", attributes: ["Volume", "Skin Type", "Key Ingredients"], usage: 4 },
    { name: "Wellness Product", attributes: ["Weight", "Dietary Notes", "Ingredients"], usage: 2 },
    { name: "Body Care Product", attributes: ["Volume", "Scent", "Skin Type"], usage: 2 },
  ],
  products: [
    {
      name: "Cape Fynbos Renewal Serum", description: "A lightweight brightening serum pairing rooibos, marula oil and Cape fynbos botanicals for radiant, hydrated skin.", price: 349, salePrice: 299,
      images: [image("photo-1556228578-8c89e6adf883"), image("photo-1571781926291-c477ebfd024b")], category: "skincare", brand: "Cape Fynbos", sizes: ["50 ml"], colors: ["#b76e79"], stock: 34, ratings: 4.9, reviewsCount: 18, isFeatured: true, isOnSale: true,
    },
    {
      name: "Marula & Rooibos Face Cream", description: "Nourishing daily moisturiser made with locally sourced marula oil and antioxidant-rich rooibos for soft, comfortable skin.", price: 289,
      images: [image("photo-1611930022073-b7a4ba5fcccd"), image("photo-1556228720-195a672e8a03")], category: "skincare", brand: "Mzansi Glow", sizes: ["100 ml"], colors: ["#d7b899"], stock: 42, ratings: 4.8, reviewsCount: 12, isFeatured: true, isOnSale: false,
    },
    {
      name: "Karoo Clay Detox Mask", description: "Mineral-rich Karoo clay mask with baobab and aloe to gently clarify and rebalance combination skin.", price: 219,
      images: [image("photo-1598440947619-2c35fc9aa908"), image("photo-1608248543803-ba4f8c70ae0b")], category: "skincare", brand: "Karoo Wellness Co.", sizes: ["100 ml"], colors: ["#b66a50"], stock: 27, ratings: 4.7, reviewsCount: 9, isFeatured: false, isOnSale: false,
    },
    {
      name: "Aloe & Buchu Body Polish", description: "A refreshing exfoliating polish blending aloe, buchu and fine rooibos sugar for smooth, revitalised skin.", price: 179,
      images: [image("photo-1601612628452-9e99ced43524"), image("photo-1556229010-6c3f2c9ca5f8")], category: "body-care", brand: "Aurum Botanicals", sizes: ["200 ml"], colors: ["#6f9470"], stock: 31, ratings: 4.6, reviewsCount: 7, isFeatured: false, isOnSale: false,
    },
    {
      name: "African Black Soap & Honey Bar", description: "Hand-poured cleansing bar with African black soap, honey and shea butter. Gentle enough for everyday use.", price: 89,
      images: [image("photo-1608571423902-eed4a5ad8108"), image("photo-1607006344380-b6775a0824ce")], category: "body-care", brand: "Ubuntu Apothecary", sizes: ["100 ml"], colors: ["#b66a50"], stock: 65, ratings: 4.8, reviewsCount: 22, isFeatured: true, isOnSale: false,
    },
    {
      name: "Rooibos Wellness Tea", description: "A naturally caffeine-free rooibos infusion sourced from the Cederberg, with a smooth, naturally sweet finish.", price: 129,
      images: [image("photo-1544787219-7f47ccb76574"), image("photo-1513558161293-cdaf765ed2fd")], category: "wellness", brand: "Cape Fynbos", sizes: ["250 g"], colors: ["#b66a50"], stock: 50, ratings: 4.9, reviewsCount: 30, isFeatured: true, isOnSale: false,
    },
    {
      name: "Fynbos Calm Bath Soak", description: "A restorative bath soak with Cape lavender, sea salt and wild rosemary to help you unwind after a long day.", price: 199,
      images: [image("photo-1602585578132-6c4d3f9b0a0a"), image("photo-1600334089648-b0d9d3028eb2")], category: "bath-home", brand: "Aurum Botanicals", sizes: ["500 g"], colors: ["#b76e79"], stock: 24, ratings: 4.7, reviewsCount: 11, isFeatured: false, isOnSale: false,
    },
    {
      name: "Baobab Scalp & Hair Oil", description: "A lightweight blend of baobab, marula and jojoba oils that nourishes dry scalps and adds shine without heaviness.", price: 239,
      images: [image("photo-1522337360788-8b13dee7a37e"), image("photo-1608248597279-f99d160bfcbc")], category: "hair-care", brand: "Mzansi Glow", sizes: ["100 ml"], colors: ["#d7b899"], stock: 36, ratings: 4.8, reviewsCount: 14, isFeatured: false, isOnSale: false,
    },
  ],
  settings: {
    general: {
      storeName: "PHETHAGATSA SOLUTIONS", storeEmail: "hello@ubuntuwellness.co.za", websiteLink: "ubuntuwellness.co.za",
      currency: "R", shippingCost: 75, storeCountry: "South Africa", activeZones: ["South Africa"],
      promoCode: "WELCOME10", promoDiscount: 10, heroTitle: "Wellness, rooted in South Africa",
      heroSubtitle: "Discover considered skincare and self-care made with the botanicals, rituals and warmth of Mzansi.",
      shippingPolicy: "Orders ship nationwide from Cape Town within 1–2 business days. Free delivery on orders over R750.",
      returnsPolicy: "Returns are accepted within 14 days of delivery on unopened, unused products in original packaging.",
    },
    currency: { currency: "R", currencyPos: "before" },
  },
} as const;
