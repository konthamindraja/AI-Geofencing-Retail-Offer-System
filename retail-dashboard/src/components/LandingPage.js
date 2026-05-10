import React, { useState } from 'react';
import { ArrowRight, UserCircle, LogOut } from 'lucide-react';
import AuthModal from './AuthModal';

export default function LandingPage({ onEnter, user, setUser }) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black flex flex-col items-center justify-center">
      {/* Background Video */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover opacity-100 object-center min-w-full min-h-full"
      >
        <source src="/videoplayback.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Subtle Overlay to pop text out without obscuring video */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/30 pointer-events-none" />

      {/* Top Navigation */}
      <div className="absolute top-0 w-full p-6 flex justify-end z-20">
        {user ? (
          <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-700 shadow-xl">
            <div className="flex items-center gap-2 text-white font-medium">
              <UserCircle className="w-5 h-5 text-blue-400" />
              <span>{user}</span>
            </div>
            <div className="w-px h-5 bg-slate-600 mx-1" />
            <button 
              onClick={() => setUser(null)}
              className="text-slate-300 hover:text-red-400 transition-colors flex items-center gap-1.5 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowAuthModal(true)}
            className="group flex items-center gap-2 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-500 hover:to-indigo-500 backdrop-blur-md px-6 py-2.5 rounded-full text-white font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] border border-blue-400/20"
          >
            <UserCircle className="w-5 h-5" />
            Sign In / Sign Up
          </button>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] mb-6 uppercase">
          Agent Market
        </h1>
        
        <p className="text-xl md:text-3xl text-white max-w-2xl mb-12 font-medium tracking-wide drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
          The Next Generation of AI-Driven Intelligent Offer Recommendations.
        </p>

        <button 
          onClick={onEnter}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500"
        >
          <span className="relative z-10">Enter Dashboard</span>
          <ArrowRight className="relative z-10 w-6 h-6 group-hover:translate-x-1 transition-transform" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onLogin={(username) => setUser(username)}
        />
      )}
    </div>
  );
}
