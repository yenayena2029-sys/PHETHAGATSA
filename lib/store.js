import {create} from 'zustand'
export const useCart=create((set,get)=>({items:[],add:(p,q=1)=>set({items:[...get().items,{...p,qty:q}]}),remove:(id)=>set({items:get().items.filter(i=>i.id!==id)}),total:()=>get().items.reduce((s,i)=>s+i.price*i.qty,0),count:()=>get().items.length}))
