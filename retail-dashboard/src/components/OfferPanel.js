import React from 'react';
import { Tag, Store as StoreIcon, AlertCircle } from 'lucide-react';

export default function OfferPanel({ recommendation, loading, error }) {
  if (loading) {
    return (
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 animate-pulse flex flex-col items-center justify-center min-h-[200px]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400">Analyzing purchase history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 p-6 rounded-xl shadow-lg border border-red-800 flex items-start gap-4 h-full">
        <AlertCircle className="text-red-400 w-8 h-8 shrink-0" />
        <div>
          <h3 className="text-red-400 font-semibold mb-2">Error connecting</h3>
          <p className="text-red-200/80 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col items-center justify-center min-h-[200px] text-center">
        <StoreIcon className="w-12 h-12 text-slate-500 mb-4" />
        <p className="text-slate-400">Move near a store to receive personalized offers.</p>
      </div>
    );
  }

  if (recommendation.message) {
    return (
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col items-center justify-center min-h-[200px] text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <p className="text-amber-400">{recommendation.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 p-6 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.2)] border border-blue-500/30 relative overflow-hidden h-full flex flex-col justify-center">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-blue-500 w-24 h-24 rounded-full blur-3xl opacity-30 pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
          <StoreIcon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-blue-300 font-medium uppercase tracking-wider">Nearby Store</p>
          <h3 className="text-lg font-bold text-white">{recommendation.store}</h3>
        </div>
      </div>

      <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm relative">
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-400 to-orange-500 border-2 border-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
          <Tag className="w-3 h-3" /> Exclusive
        </div>
        <p className="text-sm text-slate-300 mb-1">Your Personalized Offer:</p>
        <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 leading-tight">
          "{recommendation.offer}"
        </p>
      </div>
    </div>
  );
}
