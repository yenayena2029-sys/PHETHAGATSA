'use client'
import { useState } from 'react'
const PRODUCTS = [
 {id:1,name:"Phethagatsa 5L Bundle",price:250,img:"🧴"},
 {id:2,name:"Phethagatsa 2L",price:150,img:"🧴"},
 {id:3,name:"Phethagatsa 750ml",price:80,img:"🧴"},
 {id:4,name:"Combo A - 3x 5L",price:650,img:"📦"},
 {id:5,name:"Combo B - Family",price:450,img:"📦"},
 {id:6,name:"Phethagatsa + Detergent",price:300,img:"✨"},
 {id:7,name:"Mini Bundle",price:120,img:"🧴"},
 {id:8,name:"Bulk 10L",price:480,img:"🪣"},
 {id:9,name:"Starter Kit",price:199,img:"🎁"},
 {id:10,name:"Refill 5L",price:200,img:"♻️"},
 {id:11,name:"Phethagatsa Gold",price:350,img:"⭐"},
 {id:12,name:"Twin Pack",price:400,img:"👯"},
 {id:13,name:"Office Pack",price:800,img:"🏢"},
 {id:14,name:"PAXI Delivery",price:60,img:"🚚"},
 {id:15,name:"Capitec EFT",price:0,img:"💳"},
]
export default function Page(){
 const [cart,setCart]=useState<any[]>([])
 const add=(p:any)=>setCart([...cart,p])
 const total=cart.reduce((s,i)=>s+i.price,0)
 const whatsapp=`https://wa.me/27700000000?text=${encodeURIComponent(`Hi Phethagatsa! Order: ${cart.map(c=>c.name).join(', ')} Total R${total} + R60 PAXI = R${total+60}. Capitec 1055581251`)}`
 return (
  <div>
   <div className="bg-zinc-900 p-6 border-b border-zinc-800 sticky top-0 z-50 flex justify-between items-center">
    <h1 className="text-2xl font-black tracking-widest">PHETHAGATSA • 15 PRODUCTS LIVE</h1>
    <a href="#shop" className="text-yellow-300">Go to Shop → Cart ({cart.length}) R{total}</a>
   </div>
   <div className="p-4 bg-yellow-400 text-black text-center font-bold">
    Capitec: 1055581251 | PAXI: R60 Nationwide | WhatsApp Checkout
   </div>
   <div id="shop" className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 max-w-6xl mx-auto">
    {PRODUCTS.map(p=>(
     <div key={p.id} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      <div className="text-5xl mb-3">{p.img}</div>
      <h3 className="font-bold">{p.name}</h3>
      <p className="text-yellow-300 font-black">R{p.price}</p>
      <button onClick={()=>add(p)} className="mt-3 w-full bg-white text-black py-2 rounded-full font-bold">Add to Cart</button>
     </div>
    ))}
   </div>
   {cart.length>0 && (
    <div className="fixed bottom-0 left-0 right-0 bg-white text-black p-4 flex justify-between items-center">
     <span className="font-bold">{cart.length} items - R{total+60} with PAXI</span>
     <a href={whatsapp} target="_blank" className="bg-green-600 text-white px-6 py-2 rounded-full font-bold">Order WhatsApp</a>
    </div>
   )}
  </div>
 )
}
