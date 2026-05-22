import { useEffect, useRef } from 'react';
import { X, MapPin, Target } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMapModal = ({ currentLocation, serviceAreaCenter, radiusKm, onClose }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const currentMarkerRef = useRef(null);
  const centerMarkerRef = useRef(null);
  const circleRef = useRef(null);

  // Preload Leaflet CSS and JS (if not already)
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      document.body.appendChild(script);
      script.onload = initMap;
    } else {
      initMap();
    }
  }, []);

  const initMap = () => {
    if (!window.L || mapInstanceRef.current) return;

    const centerLat = currentLocation?.coordinates?.[1] || serviceAreaCenter?.coordinates?.[1] || 20.5937;
    const centerLng = currentLocation?.coordinates?.[0] || serviceAreaCenter?.coordinates?.[0] || 78.9629;
    const map = window.L.map(mapRef.current).setView([centerLat, centerLng], 12);
    mapInstanceRef.current = map;

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add marker for service area center
    if (serviceAreaCenter?.coordinates) {
      const [lng, lat] = serviceAreaCenter.coordinates;
      const marker = window.L.marker([lat, lng], { icon: getIcon('blue') })
        .addTo(map)
        .bindPopup('<b>📍 Your Service Area Center</b><br>Where you serve');
      centerMarkerRef.current = marker;

      // Draw radius circle if radiusKm is provided
      if (radiusKm && radiusKm > 0) {
        const circle = window.L.circle([lat, lng], {
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.1,
          radius: radiusKm * 1000
        }).addTo(map);
        circleRef.current = circle;
      }
    }

    // Add marker for current location (if available)
    if (currentLocation?.coordinates) {
      const [lng, lat] = currentLocation.coordinates;
      const marker = window.L.marker([lat, lng], { icon: getIcon('green') })
        .addTo(map)
        .bindPopup('<b>📍 Your Current Location (GPS)</b><br>Live position');
      currentMarkerRef.current = marker;
      map.setView([lat, lng], 13);
    } else if (serviceAreaCenter?.coordinates) {
      // Fallback to service area center if no current location
      const [lng, lat] = serviceAreaCenter.coordinates;
      map.setView([lat, lng], 12);
    }

    // Fit bounds to show both markers if both exist
    if (currentLocation?.coordinates && serviceAreaCenter?.coordinates) {
      const bounds = window.L.latLngBounds(
        [currentLocation.coordinates[1], currentLocation.coordinates[0]],
        [serviceAreaCenter.coordinates[1], serviceAreaCenter.coordinates[0]]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const getIcon = (color) => {
    return window.L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color:${color === 'green' ? '#10b981' : '#3b82f6'}; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 0 4px rgba(0,0,0,0.5);"></div>`,
      iconSize: [12, 12],
      popupAnchor: [0, -6]
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1200] flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-800">Service Area vs Your Location</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 bg-blue-50 border-b border-blue-100 text-sm text-blue-800 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow"></div>
            <span>Your Current Location (GPS)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow"></div>
            <span>Service Area Center</span>
          </div>
          {radiusKm > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-300 border"></div>
              <span>Service Radius: {radiusKm} km</span>
            </div>
          )}
        </div>
        <div ref={mapRef} className="flex-1 min-h-[400px] w-full bg-gray-100" style={{ height: '500px' }}></div>
        <div className="p-3 border-t bg-gray-50 text-center text-xs text-gray-500">
          {!currentLocation?.coordinates && <span className="text-amber-600">⚠️ Current location not available. Enable GPS on your device.</span>}
          {currentLocation?.coordinates && !serviceAreaCenter?.coordinates && <span className="text-amber-600">⚠️ Service area center not set. Please update your service area.</span>}
        </div>
      </div>
    </div>
  );
};

export default LocationMapModal;