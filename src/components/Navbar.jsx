import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, setShowAuth } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [currentCoords, setCurrentCoords] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [searchPlaceholder, setSearchPlaceholder] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLogoRotating, setIsLogoRotating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [isAddressSearching, setIsAddressSearching] = useState(false);

  // Map related states
  const [mapLat, setMapLat] = useState(28.6139);
  const [mapLng, setMapLng] = useState(77.2090);
  const [showMap, setShowMap] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const searchTimeout = useRef(null);
  const searchRef = useRef(null);
  const locationRef = useRef(null);

  // Preload Leaflet
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
    }
  }, []);

  // Initialize or update map
  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;
    if (!window.L) {
      const timer = setTimeout(() => {
        if (window.L && mapContainerRef.current && showMap) initOrUpdateMap();
      }, 200);
      return () => clearTimeout(timer);
    }
    initOrUpdateMap();
  }, [showMap, mapLat, mapLng]);

  const initOrUpdateMap = () => {
    if (!mapContainerRef.current || !window.L) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([mapLat, mapLng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([mapLat, mapLng]);
      } else {
        markerRef.current = window.L.marker([mapLat, mapLng], { draggable: true }).addTo(mapInstanceRef.current);
        markerRef.current.on('dragend', async () => {
          const newLatLng = markerRef.current.getLatLng();
          setMapLat(newLatLng.lat);
          setMapLng(newLatLng.lng);
          setCurrentCoords({ lat: newLatLng.lat, lng: newLatLng.lng });
          const address = await reverseGeocodeWithBigDataCloud(newLatLng.lat, newLatLng.lng);
          if (address) {
            setLocation(address);
            localStorage.setItem('userLocation', address);
          }
        });
      }
      mapInstanceRef.current.invalidateSize();
      return;
    }

    const map = window.L.map(mapContainerRef.current).setView([mapLat, mapLng], 15);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const marker = window.L.marker([mapLat, mapLng], { draggable: true }).addTo(map);
    marker.on('dragend', async () => {
      const newLatLng = marker.getLatLng();
      setMapLat(newLatLng.lat);
      setMapLng(newLatLng.lng);
      setCurrentCoords({ lat: newLatLng.lat, lng: newLatLng.lng });
      const address = await reverseGeocodeWithBigDataCloud(newLatLng.lat, newLatLng.lng);
      if (address) {
        setLocation(address);
        localStorage.setItem('userLocation', address);
      }
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
  };

  const servicePlaceholders = [
    '🔧 Search for plumbers...',
    '⚡ Find electricians...',
    '🧹 Book cleaning services...',
    '🔑 Locksmith available...',
    '📦 Moving & packing...',
    '🎨 Painters near you...',
    '❄️ AC repair services...',
    '💧 Plumbers for emergency...',
    '🔌 Electrical repairs...',
    '🧺 Laundry services...',
    '📱 Mobile repair...',
    '🚗 Car wash & detailing...',
    '🌿 Gardening services...',
    '🐜 Pest control...',
    '📚 Home tutors...'
  ];

  useEffect(() => {
    let placeholderIndex = 0;
    const interval = setInterval(() => {
      placeholderIndex = (placeholderIndex + 1) % servicePlaceholders.length;
      if (!isSearchFocused) setSearchPlaceholder(servicePlaceholders[placeholderIndex]);
    }, 3000);
    return () => clearInterval(interval);
  }, [isSearchFocused]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearchResults(false);
      if (locationRef.current && !locationRef.current.contains(event.target)) setShowLocationPicker(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When location picker opens, show map and load saved/current location
  useEffect(() => {
    if (showLocationPicker) {
      setShowMap(true);
      const savedCoords = localStorage.getItem('userCoords');
      if (savedCoords) {
        const coords = JSON.parse(savedCoords);
        setMapLat(coords.lat);
        setMapLng(coords.lng);
        setCurrentCoords(coords);
      } else if (!currentCoords) {
        autoDetectLocation();
      }
    } else {
      setShowMap(false);
    }
  }, [showLocationPicker]);

  const autoDetectLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapLat(latitude);
        setMapLng(longitude);
        setCurrentCoords({ lat: latitude, lng: longitude });
        const address = await reverseGeocodeWithBigDataCloud(latitude, longitude);
        if (address) {
          setLocation(address);
          localStorage.setItem('userLocation', address);
        } else {
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        localStorage.setItem('userCoords', JSON.stringify({ lat: latitude, lng: longitude }));
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        setIsLocating(false);
        setMapLat(28.6139);
        setMapLng(77.2090);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLogoRotate = () => {
    setIsLogoRotating(true);
    setTimeout(() => setIsLogoRotating(false), 600);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.length > 1) {
      setLoading(true);
      setShowSearchResults(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/services/search?q=${query}&location=${location}`);
          const data = await response.json();
          setSearchResults(data.services || []);
        } catch (error) {
          const mockResults = [
            { id: 1, name: 'Plumbing Services', category: 'Plumber', rating: 4.5, price: 500 },
            { id: 2, name: 'Electrical Repair', category: 'Electrician', rating: 4.8, price: 600 },
            { id: 3, name: 'AC Service & Repair', category: 'AC Technician', rating: 4.7, price: 800 },
            { id: 4, name: 'Home Cleaning', category: 'Cleaner', rating: 4.6, price: 400 },
            { id: 5, name: 'Painting Services', category: 'Painter', rating: 4.4, price: 1000 },
          ].filter(service =>
            service.name.toLowerCase().includes(query.toLowerCase()) ||
            service.category.toLowerCase().includes(query.toLowerCase())
          );
          setSearchResults(mockResults);
        } finally {
          setLoading(false);
        }
      }, 500);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
      setLoading(false);
    }
  };

  const reverseGeocodeWithBigDataCloud = async (lat, lng) => {
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.locality) {
        let address = data.locality || data.city || data.principalSubdivision || '';
        if (data.principalSubdivision && !address.includes(data.principalSubdivision)) address += `, ${data.principalSubdivision}`;
        if (data.postcode) address += ` (${data.postcode})`;
        return address;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const forwardGeocode = async (address) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'GharSevaApp/1.0' } });
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapLat(latitude);
        setMapLng(longitude);
        setCurrentCoords({ lat: latitude, lng: longitude });
        setShowMap(true);
        const address = await reverseGeocodeWithBigDataCloud(latitude, longitude);
        if (address) {
          setLocation(address);
          localStorage.setItem('userLocation', address);
        } else {
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        localStorage.setItem('userCoords', JSON.stringify({ lat: latitude, lng: longitude }));
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        alert('Location access denied or failed');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const searchAddressAndShowMap = async () => {
    if (!searchAddress.trim()) return;
    setIsAddressSearching(true);
    const result = await forwardGeocode(searchAddress);
    if (result) {
      setMapLat(result.lat);
      setMapLng(result.lng);
      setCurrentCoords({ lat: result.lat, lng: result.lng });
      setShowMap(true);
      const shortName = result.display.split(',')[0];
      setLocation(shortName);
      localStorage.setItem('userLocation', shortName);
      localStorage.setItem('userCoords', JSON.stringify({ lat: result.lat, lng: result.lng }));
    } else {
      alert('Address not found. Try adding city/state name.');
    }
    setIsAddressSearching(false);
  };

  const confirmMapLocation = () => {
    if (currentCoords) {
      setShowLocationPicker(false);
    } else {
      alert('Please select a location first');
    }
  };

  const saveCustomLocation = () => {
    if (customLocation.trim()) {
      setLocation(customLocation);
      setShowLocationPicker(false);
      localStorage.setItem('userLocation', customLocation);
      setCurrentCoords(null);
      localStorage.removeItem('userCoords');
      setShowMap(false);
      setCustomLocation('');
    }
  };

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) setLocation(savedLocation);
    const savedCoords = localStorage.getItem('userCoords');
    if (savedCoords) setCurrentCoords(JSON.parse(savedCoords));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/services/search?q=${searchQuery}&location=${location}`;
    }
  };

  const selectSearchResult = (service) => {
    window.location.href = `/service/${service.id}`;
  };

  return (
    <>
      <nav className="navbar-white">
        <div className="navbar-container">
          <div className="navbar-top-row">
            <div className="logo-section">
              <Link to="/" className="logo-link" onMouseEnter={handleLogoRotate} onClick={handleLogoRotate}>
                <div className="logo-wrapper">
                  <img
                    src="https://res.cloudinary.com/djtvxmttf/image/upload/v1778086674/seva_uuvngp-removebg-preview_mq4ctm.png"
                    alt="GharSeva Logo"
                    className={`logo-image ${isLogoRotating ? 'logo-rotate' : ''}`}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/80x80?text=GS"; }}
                  />
                </div>
                <div className="logo-text">
                  <span className="brand-name">GharSeva</span>
                  <p className="brand-tagline">Home Services at Your Doorstep</p>
                </div>
              </Link>
              <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <svg className="mobile-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <div className="nav-links">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/services" className="nav-link">Services</Link>
              <Link to="/providers" className="nav-link">Providers</Link>
              <Link to="/register-as-professional" className="register-btn">Register as Professional</Link>
            </div>
            <div className="user-actions desktop-only rounded-md px-2">
              {user ? (
                <div className="user-dropdown">
                  <button className="user-dropdown-btn uppercase">
                    <span className="username">{user.name || user.email?.split('@')[0]}</span>
                    <svg className="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="dropdown-menu p-3">
                    <Link to="/profile" className="flex items-center gap-3 hover:bg-orange-400 p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-round-icon lucide-user-round"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></svg>
                      Profile
                    </Link>
                    <Link to="/my-bookings" className="flex items-center gap-3 hover:bg-orange-400 p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-marked-icon lucide-book-marked"><path d="M10 2v8l3-3 3 3V2" /><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" /></svg>
                      Bookings
                    </Link>
                    {user.role === 'provider' && (
                      <>
                        <Link to="/provider/profile" className="flex items-center gap-3 w-full hover:bg-orange-400 p-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-toolbox-icon lucide-toolbox"><path d="M16 12v4" /><path d="M16 6a2 2 0 0 1 1.414.586l4 4A2 2 0 0 1 22 12v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 .586-1.414l4-4A2 2 0 0 1 8 6z" /><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><path d="M2 14h20" /><path d="M8 12v4" /></svg>
                          My Services
                        </Link>
                        <Link to="/provider/stats" className="flex items-center gap-3 w-full hover:bg-orange-400 p-2">Stats</Link>
                      </>
                    )}
                    {/* Admin Panel Link - only for admin */}
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-3 w-full hover:bg-orange-400 p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-user-icon lucide-shield-user"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M6.376 18.91a6 6 0 0 1 11.249.003" /><circle cx="12" cy="11" r="4" /></svg>
                        Admin Panel
                      </Link>
                    )}
                    <button onClick={logout} className="flex items-center w-full gap-3 hover:bg-orange-400 p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out-icon lucide-log-out"><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /></svg>
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="auth-buttons">
                  <button onClick={() => setShowAuth(true)} className="login-link">Login</button>
                  <button onClick={() => setShowAuth(true)} className="register-link">Signup</button>
                </div>
              )}
            </div>
          </div>

          <div className="search-location-row">
            <div className="location-picker" ref={locationRef}>
              <button onClick={() => setShowLocationPicker(!showLocationPicker)} className="location-btn">
                <svg className="location-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {isLocating ? (
                  <span className="locating-text"><span className="locating-spinner"></span> Locating…</span>
                ) : (
                  <span className="location-text">{location || 'Select Location'}</span>
                )}
                <svg className="dropdown-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showLocationPicker && (
                <div className="location-dropdown">
                  <div className="location-dropdown-content">
                    <h3 className="dropdown-title">Choose Location</h3>

                    {/* Button 1: Use My Current Location */}
                    <button onClick={getCurrentLocation} className="current-location-btn" disabled={isLocating}>
                      <svg className="location-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {isLocating ? 'Locating...' : 'Use My Current Location'}
                    </button>

                    <div className="divider">or search address</div>

                    {/* Address search input + button */}
                    <div className="address-search-group">
                      <input
                        type="text"
                        value={searchAddress}
                        onChange={(e) => setSearchAddress(e.target.value)}
                        placeholder="Type full address (e.g., Hamindpur, Behror, Rajasthan)"
                        className="location-input"
                        onKeyPress={(e) => e.key === 'Enter' && searchAddressAndShowMap()}
                      />
                      <button onClick={searchAddressAndShowMap} className="save-location-btn mt-2" disabled={isAddressSearching}>
                        {isAddressSearching ? 'Searching...' : 'Search & Show on Map'}
                      </button>
                    </div>

                    {/* Map preview (appears after either button is clicked) */}
                    {showMap && (
                      <div className="map-preview">
                        <div ref={mapContainerRef} style={{ height: '220px', width: '100%', borderRadius: '8px', marginTop: '8px', background: '#f0f0f0' }}></div>
                        <p className="text-xs text-gray-500 mt-1">📍 Drag the marker to adjust exact location</p>
                        <button onClick={confirmMapLocation} className="save-location-btn mt-2 bg-green-600 hover:bg-green-700">
                          Confirm Location
                        </button>
                      </div>
                    )}

                    <div className="divider">or enter city manually</div>

                    <input
                      type="text"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder="Enter city/locality..."
                      className="location-input"
                      onKeyPress={(e) => e.key === 'Enter' && saveCustomLocation()}
                    />
                    <button onClick={saveCustomLocation} className="save-location-btn mt-2">Save Location</button>
                  </div>
                </div>
              )}
            </div>

            <div className="search-wrapper" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="search-input-wrapper">
                  <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => { setIsSearchFocused(true); if (searchQuery.length > 1) setShowSearchResults(true); }}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder={searchPlaceholder || servicePlaceholders[0]}
                    className="search-input"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchResults(false); }} className="clear-search-btn">
                      <svg className="clear-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </form>
              {showSearchResults && (
                <div className="search-results-dropdown">
                  {loading ? (
                    <div className="loading-state"><div className="spinner"></div><p>Searching...</p></div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((service) => (
                      <div key={service.id} onClick={() => selectSearchResult(service)} className="search-result-item">
                        <div><h4 className="result-name">{service.name}</h4><p className="result-category">{service.category}</p></div>
                        <div><span className="rating">★ {service.rating}</span><p className="price">₹{service.price}</p></div>
                      </div>
                    ))
                  ) : searchQuery.length > 1 ? (
                    <div className="no-results">No services found</div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}></div>
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="drawer-header"><span className="drawer-logo">GharSeva</span><button className="drawer-close" onClick={() => setMobileMenuOpen(false)}>✕</button></div>
        <div className="drawer-links">
          <Link to="/" className="drawer-link flex gap-2" onClick={() => setMobileMenuOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house-icon lucide-house"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
            Home
          </Link>
          <Link to="/services" className="drawer-link flex gap-2" onClick={() => setMobileMenuOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-toolbox-icon lucide-toolbox"><path d="M16 12v4" /><path d="M16 6a2 2 0 0 1 1.414.586l4 4A2 2 0 0 1 22 12v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 .586-1.414l4-4A2 2 0 0 1 8 6z" /><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><path d="M2 14h20" /><path d="M8 12v4" /></svg>
            Services
          </Link>
          <Link to="/providers" className="drawer-link flex gap-2" onClick={() => setMobileMenuOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-land-plot-icon lucide-land-plot"><path d="m12 8 6-3-6-3v10" /><path d="m8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12" /><path d="m6.49 12.85 11.02 6.3" /><path d="M17.51 12.85 6.5 19.15" /></svg>
            Providers
          </Link>
          <Link to="/register-as-professional" className="drawer-link special flex gap-2" onClick={() => setMobileMenuOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-user-icon lucide-shield-user"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M6.376 18.91a6 6 0 0 1 11.249.003" /><circle cx="12" cy="11" r="4" /></svg>
            Register as Professional
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="drawer-link flex gap-2" onClick={() => setMobileMenuOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-round-icon lucide-user-round"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></svg>
                Profile
              </Link>
              <Link to="/my-bookings" className="drawer-link flex gap-2" onClick={() => setMobileMenuOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-marked-icon lucide-book-marked"><path d="M10 2v8l3-3 3 3V2" /><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" /></svg>
                Bookings
              </Link>
              {user.role === 'provider' && (
                <>
                  <Link to="/provider/profile" className="drawer-link">My Services</Link>
                  <Link to="/provider/stats" className="drawer-link">Stats</Link>
                </>
              )}
              {/* Admin Panel Link in mobile drawer */}
              {user.role === 'admin' && (
                <Link to="/admin" className="drawer-link flex gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-user-icon lucide-shield-user"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M6.376 18.91a6 6 0 0 1 11.249.003" /><circle cx="12" cy="11" r="4" /></svg>
                  Admin Panel
                </Link>
              )}
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="drawer-link logout flex gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out-icon lucide-log-out"><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /></svg>
                Logout
              </button>
              <button className="drawer-link logout flex gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle-question-mark-icon lucide-message-circle-question-mark"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
                Help & Support
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }} className="drawer-link auth">Login</button>
              <button onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }} className="drawer-link auth signup">Signup</button>
            </>
          )}
        </div>
      </div>

      <style>{`
        .map-preview { margin-top: 12px; }
        .address-search-group { margin-bottom: 8px; }

        @media (max-width: 767px) {
          .search-location-row { flex-direction: column !important; }
          .location-picker, .search-wrapper { width: 100% !important; }
          .location-btn { width: 100%; justify-content: space-between; }
          .location-dropdown { width: calc(100vw - 2rem); left: 0; right: auto; }
        }

        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Poppins:wght@300;400;500;600;700;800&display=swap');
        .navbar-white { background-color: #ffffff; width: 100%; position: sticky; top: 0; z-index: 1000; border-bottom: 1px solid #e5e7eb; font-family: 'Poppins', 'Inter', system-ui, sans-serif; }
        .navbar-container { max-width: 1280px; margin: 0 auto; padding: 0.75rem 1.5rem; }
        .navbar-top-row { display: flex; flex-direction: column; gap: 1rem; }
        @media (min-width: 1024px) { .navbar-top-row { flex-direction: row; align-items: center; justify-content: space-between; } }
        .logo-section { display: flex; align-items: center; justify-content: space-between; width: 100%; }
        @media (min-width: 1024px) { .logo-section { width: auto; } }
        .logo-link { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; cursor: pointer; }
        .logo-image { height: 4rem; width: auto; object-fit: contain; transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        .logo-rotate { animation: rotateLogo 0.6s ease-in-out; }
        @keyframes rotateLogo { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .logo-text { display: none; }
        @media (min-width: 640px) { .logo-text { display: block; } }
        .brand-name { font-size: 1.875rem; font-weight: 800; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); background-clip: text; -webkit-background-clip: text; color: transparent; }
        .brand-tagline { font-size: 0.75rem; color: #6b7280; margin-top: 0.125rem; }
        .mobile-menu-btn { display: block; padding: 0.5rem; background: transparent; border: none; cursor: pointer; color: #374151; }
        @media (min-width: 1024px) { .mobile-menu-btn { display: none; } }
        .mobile-menu-icon { width: 1.5rem; height: 1.5rem; }
        .nav-links { display: none; gap: 1.5rem; align-items: center; }
        @media (min-width: 1024px) { .nav-links { display: flex; } }
        .nav-link { color: #374151; text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: #3b82f6; }
        .register-btn { background: linear-gradient(135deg, #eab308 0%, #f59e0b 100%); color: #1f2937; padding: 0.5rem 1rem; border-radius: 0.5rem; text-decoration: none; font-weight: 700; transition: all 0.2s; }
        .register-btn:hover { transform: scale(1.05); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .user-actions { display: flex; gap: 1rem; align-items: center; }
        .desktop-only { display: none; }
        @media (min-width: 1024px) { .desktop-only { display: flex; } }
        .user-dropdown { position: relative; }
        .user-dropdown-btn { display: flex; align-items: center; gap: 0.5rem; background: transparent; border: none; cursor: pointer; color: #374151; font-family: inherit; font-weight: 500; padding: 0.5rem; }
        .dropdown-menu { position: absolute; right: 0; margin-top: 0.5rem; width: 12rem; background: white; border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); opacity: 0; visibility: hidden; transition: all 0.2s; z-index: 20; }
        .user-dropdown:hover .dropdown-menu { opacity: 1; visibility: visible; }
        .dropdown-item { display: block; padding: 0.5rem 1rem; color: #374151; text-decoration: none; transition: background 0.2s; }
        .dropdown-item:hover { background: #f3f4f6; }
        .auth-buttons { display: flex; gap: 0.5rem; }
        .login-link { color: #374151; text-decoration: none; font-weight: 600; padding: 0.25rem 0.75rem; transition: color 0.2s; cursor: pointer; background: none; border: none; font-family: inherit; }
        .login-link:hover { color: #3b82f6; }
        .register-link { background: #3b82f6; color: white; padding: 0.25rem 1rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; transition: all 0.2s; cursor: pointer; border: none; }
        .register-link:hover { background: #2563eb; transform: scale(1.05); }
        .search-location-row { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
        @media (min-width: 768px) { .search-location-row { flex-direction: row; } }
        .location-picker { position: relative; width: 100%; }
        .location-btn { display: flex; align-items: center; gap: 0.5rem; background: #f9fafb; border: 1px solid #e5e7eb; padding: 0.625rem 1rem; border-radius: 0.5rem; color: #374151; cursor: pointer; width: 100%; font-family: inherit; }
        .location-btn:hover { background: #f3f4f6; border-color: #d1d5db; }
        .location-icon { width: 1.25rem; height: 1.25rem; }
        .location-text { flex: 1; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
        .locating-text { display: flex; align-items: center; gap: 0.375rem; color: #6b7280; font-size: 0.875rem; }
        .locating-spinner { width: 0.875rem; height: 0.875rem; border: 2px solid #d1d5db; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .dropdown-arrow { width: 1rem; height: 1rem; }
        .location-dropdown { position: absolute; top: 100%; left: 0; right: auto; margin-top: 0.5rem; width: 90vw; max-width: 24rem; background: white; border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 30; }
        .location-dropdown-content { padding: 1rem; max-height: 80vh; overflow-y: auto; }
        .dropdown-title { color: #1f2937; font-weight: 600; margin-bottom: 0.75rem; }
        .current-location-btn { width: 100%; background: #eff6ff; color: #3b82f6; padding: 0.5rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; border: none; cursor: pointer; font-family: inherit; }
        .divider { border-top: 1px solid #e5e7eb; margin: 0.75rem 0; text-align: center; color: #9ca3af; font-size: 0.75rem; }
        .location-input { width: 100%; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.5rem 0.75rem; margin-bottom: 0.75rem; font-family: inherit; }
        .save-location-btn { width: 100%; background: #3b82f6; color: white; padding: 0.5rem; border-radius: 0.5rem; border: none; cursor: pointer; font-family: inherit; font-weight: 500; transition: background 0.2s; }
        .save-location-btn:hover { background: #2563eb; }
        .save-location-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .search-wrapper { flex: 1; position: relative; width: 100%; }
        .search-form { width: 100%; }
        .search-input-wrapper { position: relative; }
        .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); width: 1.25rem; height: 1.25rem; color: #9ca3af; }
        .search-input { width: 100%; background: #f9fafb; border: 1px solid #e5e7eb; padding: 0.625rem 2.5rem 0.625rem 2.5rem; border-radius: 0.5rem; font-family: inherit; }
        .search-input:focus { outline: none; border-color: #3b82f6; }
        .clear-search-btn { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; color: #9ca3af; }
        .search-results-dropdown { position: absolute; top: 100%; left: 0; right: 0; margin-top: 0.5rem; background: white; border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-height: 24rem; overflow-y: auto; z-index: 30; }
        .loading-state { padding: 1rem; text-align: center; color: #6b7280; }
        .spinner { width: 1.5rem; height: 1.5rem; border: 2px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
        .search-result-item { padding: 0.75rem; cursor: pointer; display: flex; justify-content: space-between; border-bottom: 1px solid #f3f4f6; }
        .search-result-item:hover { background: #f9fafb; }
        .result-name { font-weight: 600; color: #1f2937; font-size: 0.875rem; }
        .result-category { font-size: 0.75rem; color: #6b7280; }
        .rating { display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; color: #f59e0b; }
        .price { font-size: 0.75rem; font-weight: 600; color: #10b981; margin-top: 0.25rem; text-align: right; }
        .no-results { padding: 1rem; text-align: center; color: #6b7280; }
        .mobile-drawer-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1100; opacity: 0; visibility: hidden; transition: all 0.3s; }
        .mobile-drawer-overlay.open { opacity: 1; visibility: visible; }
        .mobile-drawer { position: fixed; top: 0; left: 0; bottom: 0; width: 280px; background: white; z-index: 1101; transform: translateX(-100%); transition: transform 0.3s ease; display: flex; flex-direction: column; box-shadow: 2px 0 8px rgba(0,0,0,0.1); }
        .mobile-drawer.open { transform: translateX(0); }
        .drawer-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #e5e7eb; }
        .drawer-logo { font-size: 1.5rem; font-weight: 800; background: linear-gradient(135deg, #1e3a8a, #3b82f6); background-clip: text; -webkit-background-clip: text; color: transparent; }
        .drawer-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280; }
        .drawer-links { flex: 1; display: flex; flex-direction: column; padding: 1rem; gap: 0.75rem; }
        .drawer-link { text-decoration: none; color: #374151; font-weight: 500; padding: 0.5rem; border-radius: 0.5rem; transition: background 0.2s; background: none; text-align: left; cursor: pointer; font-family: inherit; font-size: 1rem; }
        .drawer-link.special { color: #eab308; font-weight: 700; }
        .drawer-link.auth { background: #f3f4f6; text-align: center; margin-top: 0.5rem; }
        .drawer-link.auth.signup { background: #3b82f6; color: white; }
        .drawer-link.logout { color: #dc2626; }
        .drawer-link:hover { background: #f3f4f6; }
      `}</style>
    </>
  );
};

export default Navbar;