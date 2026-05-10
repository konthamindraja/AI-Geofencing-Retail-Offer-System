import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Sparkles, DollarSign } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

const PRODUCTS = [
  {
    id: 'cups',
    name: 'Ceramic Cups',
    category: 'kitchenware',
    price: 150.00,
    image: '/products/cups.png',
    description: 'Premium handcrafted ceramic cups'
  },
  {
    id: 'flowers',
    name: 'Fresh Flowers',
    category: 'decor',
    price: 250.00,
    image: '/products/flowers.png',
    description: 'Vibrant bouquet of seasonal flowers'
  },
  {
    id: 'books',
    name: 'Books Collection',
    category: 'education',
    price: 350.00,
    image: '/products/books.png',
    description: 'Bestseller hardcover book set'
  },
  {
    id: 'stationery',
    name: 'Stationery Kit',
    category: 'office',
    price: 85.00,
    image: '/products/stationery.png',
    description: 'All-in-one stationery essentials'
  },
  {
    id: 'pulses',
    name: 'Organic Pulses',
    category: 'grocery',
    price: 180.00,
    image: '/products/pulses.png',
    description: 'Mixed organic dried lentils & pulses'
  }
];

export default function ProductCatalog({ customerId }) {
  const [discounts, setDiscounts] = useState([]);

  useEffect(() => {
    if (customerId) {
      axios.get(`${API_BASE}/customer-logs/${customerId}`)
        .then(res => {
          setDiscounts(res.data.discounts || []);
        })
        .catch(() => setDiscounts([]));
    }
  }, [customerId]);

  const getDiscount = (productId) => {
    return discounts.find(d => d.item === productId);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-400" />
          Store Products
        </h2>
        {discounts.length > 0 && (
          <span className="text-sm text-emerald-400 bg-emerald-900/30 border border-emerald-700/40 px-3 py-1 rounded-full flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            {discounts.length} personalized offers for {customerId}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {PRODUCTS.map((product) => {
          const discount = getDiscount(product.id);
          const discountedPrice = discount 
            ? (product.price * (1 - discount.discount_pct / 100)).toFixed(2)
            : null;
          const savingsAmount = discount
            ? (product.price * discount.discount_pct / 100).toFixed(2)
            : null;

          return (
            <div 
              key={product.id}
              className={`bg-slate-800 rounded-xl border overflow-hidden transition-all duration-300 group relative ${
                discount 
                  ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                  : 'border-slate-700 hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]'
              }`}
            >
              {/* Discount Badge */}
              {discount && (
                <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  {discount.discount_pct}% OFF
                </div>
              )}

              {/* Product Image */}
              <div className="h-40 overflow-hidden flex items-center justify-center p-4 bg-white/5">
                <img 
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-white font-bold text-base">{product.name}</h3>
                <p className="text-slate-400 text-xs mt-1 mb-3">{product.description}</p>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-baseline gap-2">
                    {discount ? (
                      <>
                        <span className="text-emerald-400 font-black text-lg">₹{discountedPrice}</span>
                        <span className="text-slate-500 text-sm line-through">₹{product.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-white font-bold text-lg">₹{product.price.toFixed(2)}</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 capitalize bg-slate-700/50 px-2 py-1 rounded-md">{product.category}</span>
                </div>

                {discount && (
                  <div className="mt-2 bg-emerald-900/20 border border-emerald-700/30 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-300 flex items-center gap-1">
                        💰 You save
                      </span>
                      <span className="text-emerald-400 font-bold">₹{savingsAmount} per unit</span>
                    </div>
                    <p className="text-xs text-amber-300/60 mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {discount.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
