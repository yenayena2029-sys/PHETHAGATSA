import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q) {
      return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    const query = encodeURIComponent(q.toLowerCase());
    let products = [];

    // --- API 1: DummyJSON ---
    try {
      const res1 = await fetch(`https://dummyjson.com/products/search?q=${query}&limit=10`, { cache: 'no-store' });
      if (res1.ok) {
        const data1 = await res1.json();
        if (data1.products && data1.products.length > 0) {
          products = data1.products.map((item: any) => ({
            productId: `dummy_${item.id}`,
            title: item.title,
            price: item.price.toString(),
            imageUrl: item.thumbnail,
          }));
          return NextResponse.json({ results: products });
        }
      }
    } catch (e) {
      console.error("API 1 failed:", e);
    }

    // --- API 2: Platzi Fake Store ---
    try {
      const res2 = await fetch(`https://api.escuelajs.co/api/v1/products/?title=${query}`, { cache: 'no-store' });
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2 && data2.length > 0) {
          products = data2.slice(0, 10).map((item: any) => ({
            productId: `platzi_${item.id}`,
            title: item.title,
            price: item.price.toString(),
            imageUrl: item.images[0] ? item.images[0].replace(/\[|\]|"/g, '') : '',
          }));
          return NextResponse.json({ results: products });
        }
      }
    } catch (e) {
      console.error("API 2 failed:", e);
    }

    // --- API 3: FakeStore API (Fetch all & filter locally) ---
    try {
      const res3 = await fetch(`https://fakestoreapi.com/products`, { cache: 'no-store' });
      if (res3.ok) {
        const data3 = await res3.json();
        const filtered = data3.filter((item: any) => item.title.toLowerCase().includes(q.toLowerCase()));
        if (filtered.length > 0) {
          products = filtered.slice(0, 10).map((item: any) => ({
            productId: `fake_${item.id}`,
            title: item.title,
            price: item.price.toString(),
            imageUrl: item.image,
          }));
          return NextResponse.json({ results: products });
        }
      }
    } catch (e) {
      console.error("API 3 failed:", e);
    }

    // --- API 4: Hardcoded Fallback Mock Data ---
    // If all APIs fail or return empty, we return a mock array based on the query so the UI NEVER crashes
    const mockProducts = [
      {
        productId: "mock_1",
        title: `Premium ${q} (Imported)`,
        price: "29.99",
        imageUrl: "https://i.imgur.com/QkIa5tT.jpeg"
      },
      {
        productId: "mock_2",
        title: `Luxury ${q} Edition`,
        price: "49.99",
        imageUrl: "https://i.imgur.com/1twoaDy.jpeg"
      },
      {
        productId: "mock_3",
        title: `Basic ${q} - Best Seller`,
        price: "15.99",
        imageUrl: "https://i.imgur.com/KeqG6r4.jpeg"
      }
    ];

    return NextResponse.json({ results: mockProducts });

  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
