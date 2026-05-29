// src/components/ProviderLocationModal.jsx
import { useState, useEffect } from 'react';
import { updateServiceArea, fetchProviderProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ProviderLocationModal = ({ onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [form, setForm] = useState({
    coordinates: [74.6399, 26.4499],
    radius: 10,
    cities: [],
    pincodes: []
  });
  const [cityInput, setCityInput] = useState('');
  const [pincodeInput, setPincodeInput] = useState('');

  useEffect(() => {
    loadCurrentArea();
  }, []);

  const loadCurrentArea = async () => {
    try {
      const res = await fetchProviderProfile();
      if (res.success && res.data.provider?.serviceArea) {
        const area = res.data.provider.serviceArea;
        setForm({
          coordinates: area.coordinates || [74.6399, 26.4499],
          radius: area.radius || 10,
          cities: area.cities || [],
          pincodes: area.pincodes || []
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm(prev => ({
          ...prev,
          coordinates: [longitude, latitude] // GeoJSON: [lng, lat]
        }));
        setIsLocating(false);
        alert('Location detected! You can adjust the radius and cities.');
      },
      (error) => {
        console.error(error);
        alert('Unable to get your location. Please check permissions and try again.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const payload = {
        type: 'Point',
        coordinates: form.coordinates,
        radius: form.radius,
        cities: form.cities,
        pincodes: form.pincodes
      };
      const res = await updateServiceArea(payload);
      if (res.success) {
        setMessage('Service area updated successfully!');
        setTimeout(onClose, 1500);
      } else {
        setMessage(res.message || 'Update failed');
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCity = () => {
    if (cityInput.trim() && !form.cities.includes(cityInput.trim())) {
      setForm(prev => ({ ...prev, cities: [...prev.cities, cityInput.trim()] }));
      setCityInput('');
    }
  };

  const removeCity = (city) => {
    setForm(prev => ({ ...prev, cities: prev.cities.filter(c => c !== city) }));
  };

  const addPincode = () => {
    if (pincodeInput.trim().match(/^\d{6}$/) && !form.pincodes.includes(pincodeInput.trim())) {
      setForm(prev => ({ ...prev, pincodes: [...prev.pincodes, pincodeInput.trim()] }));
      setPincodeInput('');
    } else if (pincodeInput.trim()) {
      alert('Invalid pincode (6 digits required)');
    }
  };

  const removePincode = (pincode) => {
    setForm(prev => ({ ...prev, pincodes: prev.pincodes.filter(p => p !== pincode) }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1200] p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Update Service Area</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={isLocating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {isLocating ? 'Detecting...' : 'Use My Current Location'}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={form.coordinates[1]}
              onChange={e => setForm(prev => ({ ...prev, coordinates: [prev.coordinates[0], parseFloat(e.target.value)] }))}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={form.coordinates[0]}
              onChange={e => setForm(prev => ({ ...prev, coordinates: [parseFloat(e.target.value), prev.coordinates[1]] }))}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Radius (km)</label>
            <input
              type="number"
              min="1"
              max="50"
              value={form.radius}
              onChange={e => setForm(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cities Served</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={cityInput}
                onChange={e => setCityInput(e.target.value)}
                placeholder="e.g., Mumbai"
                className="flex-1 border rounded-lg px-4 py-2"
              />
              <button type="button" onClick={addCity} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.cities.map(city => (
                <span key={city} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {city}
                  <button type="button" onClick={() => removeCity(city)} className="text-red-500 hover:text-red-700">×</button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pincodes Served</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={pincodeInput}
                onChange={e => setPincodeInput(e.target.value)}
                placeholder="6-digit pincode"
                maxLength="6"
                className="flex-1 border rounded-lg px-4 py-2"
              />
              <button type="button" onClick={addPincode} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.pincodes.map(pin => (
                <span key={pin} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {pin}
                  <button type="button" onClick={() => removePincode(pin)} className="text-red-500 hover:text-red-700">×</button>
                </span>
              ))}
            </div>
          </div>
          {message && <div className={`p-2 rounded text-sm ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProviderLocationModal;