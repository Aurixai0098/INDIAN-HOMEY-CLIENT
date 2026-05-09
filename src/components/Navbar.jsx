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

  // Responsive state logic
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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

  // Handle Window Resize for Responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    'Search for plumbers...',
    'Find electricians...',
    'Book cleaning services...',
    'AC repair services...'
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
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearchResults(false);
      if (locationRef.current && !locationRef.current.contains(event.target)) setShowLocationPicker(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };


  /* --- RENDER HELPERS --- */

  const renderLocationModalContent = () => (
    <>
      <h3 className="text-gray-900 font-semibold mb-3">Choose Location</h3>
      <button onClick={getCurrentLocation} disabled={isLocating} className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-4 rounded-lg transition border border-blue-100 font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {isLocating ? 'Locating...' : 'Use My Current Location'}
      </button>
      <div className="my-3 text-center text-gray-400 text-xs font-medium uppercase tracking-wider">or search address</div>
      <div className="flex flex-col gap-2">
        <input type="text" value={searchAddress} onChange={(e) => setSearchAddress(e.target.value)} placeholder="Type full address..." className="bg-white text-gray-900 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" onKeyPress={(e) => e.key === 'Enter' && searchAddressAndShowMap()} />
        <button onClick={searchAddressAndShowMap} disabled={isAddressSearching} className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition shadow-sm">
          {isAddressSearching ? 'Searching...' : 'Search & Show on Map'}
        </button>
      </div>
      {showMap && (
        <div className="mt-3">
          <div ref={mapContainerRef} className="h-[200px] w-full rounded-lg bg-gray-100 overflow-hidden border border-gray-200"></div>
          <p className="text-[10px] text-gray-500 mt-1.5 text-center font-medium">📍 Drag marker to adjust exact location</p>
          <button onClick={confirmMapLocation} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium transition shadow-sm">Confirm Location</button>
        </div>
      )}
      <div className="my-3 text-center text-gray-400 text-xs font-medium uppercase tracking-wider">or enter city manually</div>
      <input type="text" value={customLocation} onChange={(e) => setCustomLocation(e.target.value)} placeholder="Enter city..." className="w-full bg-white text-gray-900 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" onKeyPress={(e) => e.key === 'Enter' && saveCustomLocation()} />
      <button onClick={saveCustomLocation} className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition">Save Location</button>
    </>
  );

  const renderSearchResultsDropdown = () => (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-[1050] max-h-[300px] overflow-y-auto overflow-hidden">
      {loading ? (
        <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
      ) : searchResults.length > 0 ? (
        searchResults.map((service) => (
          <div key={service.id} onClick={() => selectSearchResult(service)} className="p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition">
            <div>
              <h4 className="text-gray-900 text-sm font-medium">{service.name}</h4>
              <p className="text-gray-500 text-xs mt-0.5">{service.category}</p>
            </div>
            <div className="text-right">
              <span className="text-amber-500 text-xs block font-medium">★ {service.rating}</span>
              <span className="text-emerald-600 text-xs font-bold mt-0.5 block">₹{service.price}</span>
            </div>
          </div>
        ))
      ) : searchQuery.length > 1 ? (
        <div className="p-4 text-center text-gray-500 text-sm">No services found</div>
      ) : null}
    </div>
  );

  const renderSearchInput = (mobileMode = false) => (
    <div className={`w-full relative ${mobileMode ? 'flex' : 'flex-1'}`} ref={searchRef}>
      <form onSubmit={handleSearchSubmit} className={`flex items-center w-full ${mobileMode ? 'bg-gray-50 border border-gray-200 rounded-full focus-within:bg-white focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 shadow-sm transition-all' : ''}`}>
        <div className="pl-3 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => { setIsSearchFocused(true); if (searchQuery.length > 1) setShowSearchResults(true); }}
          onBlur={() => setIsSearchFocused(false)}
          placeholder={searchPlaceholder || servicePlaceholders[0]}
          className="w-full bg-transparent text-gray-900 px-2 py-2.5 text-sm focus:outline-none placeholder-gray-400"
        />
        {searchQuery && (
          <button type="button" onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchResults(false); }} className="pr-2 text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
        <button type="submit" className={`${mobileMode ? 'hidden' : 'hidden sm:flex'} items-center gap-1 bg-transparent hover:bg-gray-200 text-gray-600 hover:text-gray-900 px-4 py-1.5 mr-1 rounded-full text-sm font-medium transition`}>
          Search <span>&rarr;</span>
        </button>
      </form>
      {showSearchResults && renderSearchResultsDropdown()}
    </div>
  );


  return (
    <>
      <nav className="bg-white text-gray-800 border-b border-gray-200 font-sans sticky top-0 z-[1000] shadow-sm">
        <div className="max-w-[1500px] mx-auto px-4 py-3">
          
          {/* ===================== DESKTOP VIEW (>=1024px) ===================== */}
          {!isMobileView && (
            <div className="flex items-center justify-between gap-8">
              
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 shrink-0 no-underline" onMouseEnter={handleLogoRotate} onClick={handleLogoRotate}>
                <div className="bg-blue-600 text-white rounded-lg w-10 h-10 flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20">GS</div>
                <div>
                  <h1 className="text-xl font-bold text-blue-600 tracking-tight leading-tight">GharSeva</h1>
                  <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Home services at your doorstep</p>
                </div>
              </Link>

              {/* Desktop Combined Pill: Location + Search */}
              <div className="flex flex-1 items-center bg-gray-50 border border-gray-200 rounded-full max-w-3xl transition-all focus-within:border-gray-300 focus-within:bg-white focus-within:shadow-md">
                
                {/* Desktop Location Dropdown */}
                <div className="relative shrink-0" ref={locationRef}>
                  <button onClick={() => setShowLocationPicker(!showLocationPicker)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-l-full transition-colors whitespace-nowrap">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="max-w-[150px] truncate">{isLocating ? 'Locating...' : (location || 'Select Location')}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {showLocationPicker && (
                    <div className="absolute top-full left-0 mt-2 w-[350px] bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-4">
                      {renderLocationModalContent()}
                    </div>
                  )}
                </div>

                <div className="w-[1px] h-6 bg-gray-300"></div>

                {/* Desktop Search Bar */}
                {renderSearchInput(false)}
              </div>

              {/* Desktop Right Controls (Auth/Profile & Menu) */}
              <div className="flex items-center gap-3 shrink-0">
                {user ? (
                  <div className="relative group">
                    <button className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 px-2 py-1.5 rounded-full transition-colors shadow-sm">
                      <div className="w-7 h-7 bg-blue-100 text-blue-700 font-bold rounded-full flex items-center justify-center text-xs">{getInitials(user.name || user.email)}</div>
                      <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">{user.name || user.email?.split('@')[0]}</span>
                      <svg className="w-4 h-4 text-gray-400 pr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {/* Desktop Profile Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                      <Link to="/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium">Profile</Link>
                      <Link to="/my-bookings" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium">Bookings</Link>
                      {user.role === 'provider' && (
                        <>
                          <Link to="/provider/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium">My Services</Link>
                          <Link to="/provider/stats" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium">Stats</Link>
                        </>
                      )}
                      {user.role === 'admin' && <Link to="/admin" className="block px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition font-bold">Admin Panel</Link>}
                      <div className="h-px bg-gray-100 my-1"></div>
                      <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition font-medium">Logout</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setShowAuth(true)} className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 transition">Login</button>
                    <button onClick={() => setShowAuth(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-full transition shadow-sm">Sign Up</button>
                  </div>
                )}

                <button onClick={() => setMobileMenuOpen(true)} className="flex items-center justify-center bg-white hover:bg-gray-50 border border-gray-200 w-10 h-10 rounded-xl transition-colors shadow-sm">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
              </div>
            </div>
          )}

          {/* ===================== MOBILE VIEW (<1024px) ===================== */}
          {isMobileView && (
            <div className="flex flex-col gap-3">
              {/* Row 1: Logo | Fixed Location | Search Toggle | Hamburger */}
              <div className="flex items-center justify-between gap-2">
                
                {/* Mobile Logo */}
                <Link to="/" className="flex shrink-0 no-underline" onClick={handleLogoRotate}>
                  <div className="bg-blue-600 text-white rounded-lg w-9 h-9 flex items-center justify-center font-bold text-lg shadow-md">GS</div>
                </Link>

                {/* Mobile Fixed Location Box */}
                <div className="flex-1 min-w-0" ref={locationRef}>
                  <button 
                    onClick={() => setShowLocationPicker(true)} 
                    className="flex items-center justify-between w-full max-w-[200px] gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-[9px] font-bold text-gray-800 uppercase tracking-wider leading-none">Location</span>
                        <span className="text-[11px] text-gray-500 truncate leading-tight mt-0.5">
                          {isLocating ? 'Locating...' : (location || 'Select Location')}
                        </span>
                      </div>
                    </div>
                    <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {/* Mobile Location Modal (Centered Overlay) */}
                  {showLocationPicker && (
                    <>
                      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[1150]" onClick={() => setShowLocationPicker(false)}></div>
                      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[350px] bg-white border border-gray-100 rounded-2xl shadow-2xl z-[1200] p-5">
                        <button onClick={() => setShowLocationPicker(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        {renderLocationModalContent()}
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile Right Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setMobileSearchOpen(!mobileSearchOpen)} className="p-2 text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-full transition shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </button>
                  
                  {user && (
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full flex items-center justify-center text-xs border border-blue-200">
                      {getInitials(user.name || user.email)}
                    </div>
                  )}

                  <button onClick={() => setMobileMenuOpen(true)} className="flex items-center justify-center bg-white hover:bg-gray-50 border border-gray-200 w-9 h-9 rounded-xl transition-colors shadow-sm">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </button>
                </div>
              </div>

              {/* Row 2: Search Bar Expansion (Visible only when mobileSearchOpen is true) */}
              {mobileSearchOpen && (
                <div className="w-full animate-fadeIn mt-1">
                  {renderSearchInput(true)}
                </div>
              )}
            </div>
          )}

          {/* ===================== CATEGORIES FILTER (Shared Scrollable Row) ===================== */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button className="shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 text-sm font-semibold transition hover:bg-gray-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" /></svg>
              All
            </button>
            <button className="shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium transition shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Electrician
            </button>
            <button className="shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium transition shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              Plumber
            </button>
            <button className="shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium transition shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
              Painter
            </button>
            <button className="shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium transition shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              AC repair
            </button>
            <button className="shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium transition shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              Cleaning
            </button>
            <button className="shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium transition shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" /></svg>
              Pest Control
            </button>
          </div>
        </div>
      </nav>

      {/* ===================== SIDEBAR DRAWER (Accessed via Hamburger) ===================== */}
      <div className={`fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[1050] transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setMobileMenuOpen(false)}></div>
      <div className={`fixed top-0 right-0 bottom-0 w-72 bg-white shadow-2xl z-[1100] transform transition-transform duration-300 flex flex-col border-l border-gray-200 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <span className="text-xl font-bold text-blue-600">Menu</span>
          <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          <Link to="/" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl transition font-medium" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/services" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl transition font-medium" onClick={() => setMobileMenuOpen(false)}>All Services</Link>
          <Link to="/providers" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl transition font-medium" onClick={() => setMobileMenuOpen(false)}>Providers</Link>
          <div className="h-px bg-gray-100 my-2"></div>
          
          {user ? (
            <>
              <Link to="/profile" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl transition font-medium" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
              <Link to="/my-bookings" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl transition font-medium" onClick={() => setMobileMenuOpen(false)}>My Bookings</Link>
              <div className="h-px bg-gray-100 my-2"></div>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-left text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl transition font-medium">Logout</button>
            </>
          ) : (
            <>
              <Link to="/register-as-professional" className="text-amber-600 hover:bg-amber-50 px-4 py-3 rounded-xl transition font-bold" onClick={() => setMobileMenuOpen(false)}>Register as Professional</Link>
              <div className="mt-4 flex flex-col gap-2">
                <button onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }} className="w-full bg-white text-gray-800 py-2.5 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition shadow-sm">Login</button>
                <button onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm">Sign Up</button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Navbar;