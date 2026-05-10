import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

const CUSTOMER_LIST = ['C001','C002','C003','C004','C005','C006','C007','C008','C009','C010'];

export default function CustomerSimulator({ onSimulate }) {
  const [lat, setLat] = useState('17.3850');
  const [lng, setLng] = useState('78.4867');
  const [customerId, setCustomerId] = useState('C001');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSimulate({ 
      lat: parseFloat(lat), 
      lng: parseFloat(lng), 
      customerId 
    });
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
        <Navigation className="w-5 h-5 text-blue-400" />
        Customer Simulator
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Customer ID</label>
          <select 
            value={customerId} 
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            required
          >
            {CUSTOMER_LIST.map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Latitude</label>
            <input 
              type="number" step="any"
              value={lat} 
              onChange={(e) => setLat(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Longitude</label>
            <input 
              type="number" step="any"
              value={lng} 
              onChange={(e) => setLng(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 mt-4"
        >
          <MapPin className="w-4 h-4" />
          Update Location
        </button>
      </form>
    </div>
  );
}
