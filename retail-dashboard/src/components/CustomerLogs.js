import React, { useState } from 'react';
import axios from 'axios';
import { ClipboardList, Search, Tag, TrendingUp, ShoppingCart, X, Gift, DollarSign, Sparkles } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

const CUSTOMER_LIST = ['C001','C002','C003','C004','C005','C006','C007','C008','C009','C010'];

export default function CustomerLogs({ onClose }) {
  const [customerId, setCustomerId] = useState('C001');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/customer-logs/${customerId}`);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <ClipboardList className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Customer Logs & Offers</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500" />
              </div>
              <select 
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow appearance-none cursor-pointer"
              >
                {CUSTOMER_LIST.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={fetchLogs}
              disabled={loading}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Fetch Logs'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-800 p-4 rounded-xl text-red-300">
              {error}
            </div>
          )}

          {data && (
            <>
              {/* Total Savings Banner */}
              {data.total_savings > 0 && (
                <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-600/30 rounded-xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-500/20 p-3 rounded-xl">
                      <DollarSign className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-emerald-300 font-medium">Customer {data.customer_id} — Next Visit Savings</p>
                      <p className="text-3xl font-black text-emerald-400">₹{data.total_savings.toFixed(2)} saved</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">{data.discounts.length} active offers</p>
                    <p className="text-sm text-slate-400">{data.logs.length} total purchases</p>
                  </div>
                </div>
              )}

              {/* Discount Offers with Savings */}
              {data.discounts && data.discounts.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-amber-400" />
                    Personalized Offers — Item-wise Savings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.discounts.map((d, i) => (
                      <div key={i} className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-xl p-5 relative overflow-hidden hover:border-amber-500/40 transition-colors">
                        {/* Badge */}
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {d.discount_pct}% OFF
                        </div>

                        <p className="text-xl font-bold text-white capitalize mb-1">{d.item}</p>
                        <p className="text-xs text-slate-400 capitalize mb-4">Category: {d.category}</p>
                        
                        {/* Price Comparison */}
                        <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500">Original Price</span>
                            <span className="text-slate-400 line-through">₹{d.original_price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-emerald-400 font-medium">Offer Price</span>
                            <span className="text-emerald-400 font-bold text-lg">₹{d.discounted_price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-slate-700/50 pt-1 mt-1">
                            <span className="text-xs text-amber-400 font-medium">You Save</span>
                            <span className="text-amber-400 font-bold">₹{d.savings_per_unit.toFixed(2)} per unit</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500">{d.reason}</p>
                        <p className="text-xs text-slate-500 mt-1">Total spent so far: <span className="text-white">₹{d.total_spent.toFixed(2)}</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Interests */}
              {data.interests && data.interests.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    Customer Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.interests.map((interest, i) => (
                      <div key={i} className="bg-blue-900/30 border border-blue-700/40 rounded-full px-4 py-2 text-sm flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-blue-200 capitalize font-medium">{interest.item}</span>
                        <span className="text-blue-400/60">×{interest.purchase_count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchase Logs Table */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-400" />
                  Purchase History ({data.logs.length} transactions)
                </h3>
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="text-left px-4 py-3 font-medium">Date</th>
                        <th className="text-left px-4 py-3 font-medium">Item</th>
                        <th className="text-left px-4 py-3 font-medium">Category</th>
                        <th className="text-right px-4 py-3 font-medium">Qty</th>
                        <th className="text-right px-4 py-3 font-medium">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.logs.map((log, i) => (
                        <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3 text-slate-300">{log.date}</td>
                          <td className="px-4 py-3 text-white font-medium capitalize">{log.item}</td>
                          <td className="px-4 py-3 text-slate-400 capitalize">{log.category}</td>
                          <td className="px-4 py-3 text-slate-300 text-right">{log.quantity}</td>
                          <td className="px-4 py-3 text-emerald-400 text-right font-medium">₹{log.price?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {data.logs.length === 0 && (
                <div className="text-center text-slate-500 py-10">
                  No purchase logs found for this customer.
                </div>
              )}
            </>
          )}

          {!data && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <ClipboardList className="w-16 h-16 mb-4 opacity-30" />
              <p>Select a Customer ID and click "Fetch Logs" to view purchase history, offers, and savings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
