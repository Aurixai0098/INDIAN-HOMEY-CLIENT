// src/components/booking/LiveTrackingMap.jsx
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LiveTrackingMap = ({ providerLocation, initialCenter }) => {
  const mapRef = useRef();
  const [center, setCenter] = useState(initialCenter || [28.6139, 77.2090]);

  useEffect(() => {
    if (providerLocation && providerLocation.lat && providerLocation.lng && mapRef.current) {
      setCenter([providerLocation.lat, providerLocation.lng]);
      mapRef.current.setView([providerLocation.lat, providerLocation.lng], 15);
    }
  }, [providerLocation]);

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '300px', width: '100%', borderRadius: '12px' }}
      whenCreated={(map) => { mapRef.current = map; }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {providerLocation && providerLocation.lat && providerLocation.lng && (
        <Marker position={[providerLocation.lat, providerLocation.lng]}>
          <Popup>Provider is here</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default LiveTrackingMap;