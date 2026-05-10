import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { ShoppingBag, ArrowLeft, UserCircle, LogOut, ClipboardList, Crosshair, Bell, X, Radar, CheckCircle, Gift, Ticket } from 'lucide-react';

import StoreMap from './components/StoreMap';
import CustomerSimulator from './components/CustomerSimulator';
import OfferPanel from './components/OfferPanel';
import LandingPage from './components/LandingPage';
import CustomerLogs from './components/CustomerLogs';
import ProductCatalog from './components/ProductCatalog';

const API_BASE = 'http://127.0.0.1:8000';

// Haversine distance in meters
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [user, setUser] = useState(null);
  const [stores, setStores] = useState([]);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const [activeCustomerId, setActiveCustomerId] = useState('C001');

  // Auto-tracking state
  const [autoTracking, setAutoTracking] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [claimedOffers, setClaimedOffers] = useState([]);
  const notifiedStoresRef = useRef(new Set());
  const intervalRef = useRef(null);
  const storesRef = useRef([]);
  const customerIdRef = useRef('C001');

  // Keep refs in sync
  useEffect(() => { storesRef.current = stores; }, [stores]);
  useEffect(() => { customerIdRef.current = activeCustomerId; }, [activeCustomerId]);

  // Fetch stores on mount
  useEffect(() => {
    axios.get(`${API_BASE}/stores`)
      .then(res => setStores(res.data))
      .catch(err => console.error("Error fetching stores:", err));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setAutoTracking(false);
    setTrackingStatus('');
  }, []);

  const startAutoTracking = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const allStores = storesRef.current;
    if (!allStores.length) {
      setTrackingStatus('No stores loaded');
      return;
    }

    setAutoTracking(true);
    notifiedStoresRef.current = new Set();
    setNotifications([]);

    // Simulation: customer walks from a starting point toward each store
    let currentStoreIdx = 0;
    let step = 0;
    const stepsPerStore = 8; // 8 ticks to reach each store
    const startOffsetLat = 0.002; // ~200m offset
    const startOffsetLng = 0.001;

    const tick = async () => {
      const stores = storesRef.current;
      if (!stores.length || currentStoreIdx >= stores.length) {
        setTrackingStatus('✅ Visited all stores. Tracking complete!');
        stopTracking();
        return;
      }

      const targetStore = stores[currentStoreIdx];
      const startLat = targetStore.latitude + startOffsetLat;
      const startLng = targetStore.longitude + startOffsetLng;
      const progress = Math.min(step / stepsPerStore, 1);
      const lat = startLat + (targetStore.latitude - startLat) * progress;
      const lng = startLng + (targetStore.longitude - startLng) * progress;

      // Update location on map
      setCustomerLocation({ lat, lng });

      const dist = haversineDistance(lat, lng, targetStore.latitude, targetStore.longitude);
      setTrackingStatus(`🚶 Walking to ${targetStore.store_name} — ${Math.round(dist)}m away...`);

      // Check geofence at 100m
      if (dist <= 100 && !notifiedStoresRef.current.has(targetStore.store_id)) {
        notifiedStoresRef.current.add(targetStore.store_id);
        setTrackingStatus(`📍 Entered geofence of ${targetStore.store_name}! Fetching offer...`);

        try {
          const res = await axios.post(`${API_BASE}/detect-customer`, {
            customer_id: customerIdRef.current,
            latitude: lat,
            longitude: lng
          });

          const offerText = res.data.offer || res.data.message || 'Special offer available!';
          setNotifications(prev => [{
            id: Date.now(),
            store: targetStore.store_name,
            address: targetStore.address || '',
            distance: Math.round(dist),
            offer: offerText,
            time: new Date().toLocaleTimeString()
          }, ...prev]);

          setRecommendation(res.data);
          setTrackingStatus(`🎁 Offer received from ${targetStore.store_name}!`);
        } catch (err) {
          console.error("Auto-detect error:", err);
        }

        // Move to next store after a short pause
        setTimeout(() => {
          currentStoreIdx++;
          step = 0;
        }, 1500);
        return;
      }

      step++;
      if (step > stepsPerStore + 2) {
        // Fallback: if somehow didn't trigger, move to next
        currentStoreIdx++;
        step = 0;
      }
    };

    // Run first tick immediately, then every 1.5 seconds
    tick();
    intervalRef.current = setInterval(tick, 1500);
  }, [stopTracking]);

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const claimOffer = async (notif) => {
    try {
      const res = await axios.post(`${API_BASE}/claim-offer`, {
        customer_id: activeCustomerId,
        store_name: notif.store,
        offer_text: notif.offer,
        claimed_at: new Date().toISOString()
      });
      if (res.data.status === 'success' || res.data.status === 'already_claimed') {
        setNotifications(prev => prev.map(n => 
          n.id === notif.id ? { ...n, claimed: true, claimId: res.data.claim?.claim_id || 'CLAIMED' } : n
        ));
        setClaimedOffers(prev => [...prev, { ...notif, claimed: true, claimId: res.data.claim?.claim_id }]);
      }
    } catch (err) {
      console.error('Claim error:', err);
    }
  };

  const redeemOffer = async (notif) => {
    try {
      const res = await axios.post(`${API_BASE}/redeem-offer`, {
        customer_id: activeCustomerId,
        store_name: notif.store,
        offer_text: notif.offer
      });
      if (res.data.status === 'success' || res.data.status === 'already_redeemed') {
        setNotifications(prev => prev.map(n => 
          n.id === notif.id ? { ...n, redeemed: true } : n
        ));
        setClaimedOffers(prev => prev.map(o => 
          o.id === notif.id ? { ...o, redeemed: true } : o
        ));
      }
    } catch (err) {
      console.error('Redeem error:', err);
    }
  };

  const handleSimulate = async (locationData) => {
    setCustomerLocation({ lat: locationData.lat, lng: locationData.lng });
    setActiveCustomerId(locationData.customerId);
    setLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const response = await axios.post(`${API_BASE}/detect-customer`, {
        customer_id: locationData.customerId,
        latitude: locationData.lat,
        longitude: locationData.lng
      });
      setRecommendation(response.data);
    } catch (err) {
      console.error("Geofence error:", err);
      setError(err.response?.data?.message || err.message || "Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  if (!showDashboard) {
    return <LandingPage onEnter={() => setShowDashboard(true)} user={user} setUser={setUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-6 border-b border-slate-700/60">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-900/50">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Retail POS Dashboard</h1>
              <p className="text-slate-400 mt-1">AI-Driven Geofencing Offer Recommendation System</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            {user && (
              <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                <UserCircle className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">{user}</span>
                <button 
                  onClick={() => { setUser(null); setShowDashboard(false); }}
                  className="text-slate-400 hover:text-red-400 transition-colors ml-2"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
            <button 
              onClick={autoTracking ? stopTracking : startAutoTracking}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border ${
                autoTracking 
                  ? 'bg-red-700 text-red-100 border-red-600 hover:bg-red-600' 
                  : 'bg-indigo-700 text-indigo-100 border-indigo-600 hover:bg-indigo-600'
              }`}
            >
              {autoTracking ? (
                <>
                  <Radar className="w-4 h-4 animate-spin" />
                  Stop Tracking
                </>
              ) : (
                <>
                  <Crosshair className="w-4 h-4" />
                  Auto Track
                </>
              )}
            </button>
            <button 
              onClick={() => setShowLogs(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-emerald-100 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors border border-emerald-600"
            >
              <ClipboardList className="w-4 h-4" />
              Customer Logs
            </button>
            <button 
              onClick={() => setShowDashboard(false)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </header>

        {/* Tracking Status Bar */}
        {autoTracking && trackingStatus && (
          <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-xl px-5 py-3 flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </div>
            <p className="text-indigo-200 text-sm font-medium">{trackingStatus}</p>
          </div>
        )}

        {/* Notification Tray */}
        {notifications.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Geofence Notifications ({notifications.length})
            </h3>
            {notifications.map(notif => (
              <div key={notif.id} className={`border rounded-xl p-4 shadow-[0_0_15px_rgba(59,130,246,0.1)] animate-fadeIn ${
                notif.redeemed 
                  ? 'bg-gradient-to-r from-emerald-900/30 to-teal-900/20 border-emerald-500/30' 
                  : notif.claimed 
                    ? 'bg-gradient-to-r from-amber-900/30 to-yellow-900/20 border-amber-500/30' 
                    : 'bg-gradient-to-r from-blue-900/40 to-indigo-900/30 border-blue-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2.5 rounded-xl ${
                      notif.redeemed ? 'bg-emerald-500/20' : notif.claimed ? 'bg-amber-500/20' : 'bg-blue-500/20'
                    }`}>
                      {notif.redeemed ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : notif.claimed ? <Ticket className="w-5 h-5 text-amber-400" /> : <Bell className="w-5 h-5 text-blue-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        📍 Near <span className="text-blue-400">{notif.store}</span>
                        <span className="text-slate-400 text-sm font-normal ml-2">({notif.distance}m away)</span>
                      </p>
                      <p className="text-amber-300 text-sm mt-1">
                        🎁 <span className="font-bold">{notif.offer}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{notif.address} · {notif.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {notif.redeemed ? (
                      <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-600/30">
                        <CheckCircle className="w-3.5 h-3.5" /> Redeemed
                      </span>
                    ) : notif.claimed ? (
                      <button
                        onClick={() => redeemOffer(notif)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full transition-colors shadow-lg"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Redeem
                      </button>
                    ) : (
                      <button
                        onClick={() => claimOffer(notif)}
                        className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-bold rounded-full transition-all shadow-lg hover:shadow-amber-500/30 hover:scale-105"
                      >
                        <Gift className="w-4 h-4" /> Claim Offer
                      </button>
                    )}
                    <button 
                      onClick={() => dismissNotification(notif.id)}
                      className="text-slate-500 hover:text-white transition-colors p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {notif.claimed && !notif.redeemed && (
                  <div className="mt-3 ml-14 bg-amber-900/20 border border-amber-600/20 rounded-lg px-3 py-2 text-xs text-amber-300 flex items-center gap-2">
                    <Ticket className="w-3.5 h-3.5" />
                    Offer claimed! Visit <span className="font-bold text-white">{notif.store}</span> and click Redeem to apply.
                    {notif.claimId && <span className="ml-auto text-amber-500/60">ID: {notif.claimId}</span>}
                  </div>
                )}
                {notif.redeemed && (
                  <div className="mt-3 ml-14 bg-emerald-900/20 border border-emerald-600/20 rounded-lg px-3 py-2 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Successfully redeemed at <span className="font-bold text-white">{notif.store}</span>. Enjoy your savings! 🎉
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Controls & Offers */}
          <div className="lg:col-span-1 space-y-8 flex flex-col">
            <CustomerSimulator onSimulate={handleSimulate} />
            <div className="flex-1 min-h-[250px]">
              <OfferPanel 
                recommendation={recommendation} 
                loading={loading} 
                error={error} 
              />
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-2">
            <StoreMap 
              stores={stores} 
              customerLocation={customerLocation} 
            />
          </div>
          
        </div>

        {/* Claimed Offers Section */}
        {claimedOffers.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-2">
              <Ticket className="w-6 h-6 text-amber-400" />
              My Claimed Offers ({claimedOffers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {claimedOffers.map((offer, i) => (
                <div key={i} className={`rounded-xl p-5 border ${
                  offer.redeemed 
                    ? 'bg-emerald-900/20 border-emerald-600/30' 
                    : 'bg-amber-900/20 border-amber-600/30'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold">{offer.store}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      offer.redeemed 
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' 
                        : 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                    }`}>
                      {offer.redeemed ? '✅ Redeemed' : '🎟️ Claimed'}
                    </span>
                  </div>
                  <p className="text-amber-300 text-sm mb-2">🎁 {offer.offer}</p>
                  <p className="text-xs text-slate-500">{offer.time} · {offer.claimId}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
        <ProductCatalog customerId={activeCustomerId} />

      </div>

      {/* Customer Logs Modal */}
      {showLogs && <CustomerLogs onClose={() => setShowLogs(false)} />}
    </div>
  );
}

export default App;
