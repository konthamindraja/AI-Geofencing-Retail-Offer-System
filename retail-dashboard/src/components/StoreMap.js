import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function StoreMap({ stores, customerLocation }) {
  const center = customerLocation 
    ? [customerLocation.lat, customerLocation.lng] 
    : (stores && stores.length > 0) ? [stores[0].latitude, stores[0].longitude] : [17.3850, 78.4867];

  // Custom icon for customer
  const customerIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-slate-700 bg-slate-800">
      <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
        <MapUpdater center={center} />
        
        {stores && stores.map((store) => (
          <Marker key={store.store_id} position={[store.latitude, store.longitude]}>
            <Popup>
              <strong>{store.store_name}</strong>
            </Popup>
          </Marker>
        ))}
        
        {customerLocation && (
          <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
            <Popup>
              <strong>You are here!</strong><br />
              Lat: {customerLocation.lat}<br />
              Lng: {customerLocation.lng}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
