import { useState, useEffect, useRef } from 'react';
import { X, MapPin, CheckCircle, XCircle, Star, Loader2 } from 'lucide-react';

const NearbyProvidersModal = ({ isOpen, onClose, lat, lng, serviceCategory }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (!lat || !lng) {
      setError('Location not available. Please set your address.');
      return;
    }
    fetchNearbyProviders();
  }, [isOpen, lat, lng, serviceCategory]);

  const fetchNearbyProviders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/providers/nearby?lat=${lat}&lng=${lng}&serviceCategory=${serviceCategory}&radius=50`);
      const data = await res.json();
      if (data.success) {
        setProviders(data.data.providers);
      } else {
        setError(data.message || 'Failed to fetch providers');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[1200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold flex items-center gap-2"><MapPin className="w-5 h-5 text-emerald-600" /> Nearby Providers</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading && <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" /> Loading...</div>}
          {error && <div className="text-red-600 text-center py-4">{error}</div>}
          {!loading && !error && providers.length === 0 && <div className="text-center py-8 text-gray-500">No providers found for this service in your area.</div>}
          {!loading && providers.length > 0 && (
            <div className="space-y-3">
              {providers.map(p => (
                <div key={p.id} className="border rounded-xl p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={p.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.businessName)}&background=10b981&color=fff`} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 className="font-semibold">{p.businessName}</h4>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {parseFloat(p.rating).toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {p.distance ? <p className="text-sm">📍 {p.distance} km</p> : <p className="text-sm text-gray-400">Distance unknown</p>}
                    {p.withinRadius ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircle className="w-3 h-3" /> In your range</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-500 text-xs"><XCircle className="w-3 h-3" /> Out of range</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NearbyProvidersModal;