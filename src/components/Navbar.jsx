// src/components/Navbar.jsx

import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { fetchCategories, searchServices } from '../services/api';
import NotificationBell from './NotificationBell';
import ProviderLocationModal from '../pages/provider/ProviderLocationModal';

const Navbar = () => {
  const { user, logout, setShowAuth } = useAuth();
  const { cartCount } = useCart();

  // Dynamic categories
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // For provider location modal
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Location states
  const [location, setLocation] = useState('');
  const [currentCoords, setCurrentCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [isAddressSearching, setIsAddressSearching] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Map states
  const [mapLat, setMapLat] = useState(28.6139);
  const [mapLng, setMapLng] = useState(77.2090);
  const [showMap, setShowMap] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [isLogoRotating, setIsLogoRotating] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await fetchCategories();
        if (res.success && res.data.categories) {
          setCategories(res.data.categories.filter(cat => cat.isActive));
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Handle search input change with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await searchServices(searchQuery);
          if (res.success) {
            setSearchResults(res.services || []);
            setShowSearchDropdown(true);
          }
        } catch (err) {
          console.error('Search error:', err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target) && 
          mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle window resize
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
      }
    });
    mapInstanceRef.current = map;
    markerRef.current = marker;
  };

  const reverseGeocodeWithBigDataCloud = async (lat, lng) => {
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.locality) {
        let address = data.locality || data.city || data.principalSubdivision || '';
        if (data.principalSubdivision && !address.includes(data.principalSubdivision)) address += `, ${data.principalSubdivision}`;
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
          showSuccessMessage(`📍 Location set to ${address}`);
        } else {
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          showSuccessMessage(`📍 Location set successfully`);
        }
        localStorage.setItem('userCoords', JSON.stringify({ lat: latitude, lng: longitude }));
        setIsLocating(false);
        setTimeout(() => setShowLocationPopup(false), 1500);
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
    } else {
      alert('Address not found. Try adding city/state name.');
    }
    setIsAddressSearching(false);
  };

  const confirmMapLocation = () => {
    if (currentCoords || location) {
      if (location) {
        localStorage.setItem('userLocation', location);
        showSuccessMessage(`📍 Location set to ${location}`);
      }
      if (currentCoords) {
        localStorage.setItem('userCoords', JSON.stringify(currentCoords));
      }
      setTimeout(() => setShowLocationPopup(false), 1500);
    } else {
      alert('Please select a location first');
    }
  };

  const saveCustomLocation = () => {
    if (customLocation.trim()) {
      setLocation(customLocation);
      localStorage.setItem('userLocation', customLocation);
      setCurrentCoords(null);
      localStorage.removeItem('userCoords');
      setShowMap(false);
      setCustomLocation('');
      showSuccessMessage(`📍 Location set to ${customLocation}`);
      setTimeout(() => setShowLocationPopup(false), 1500);
    }
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 2000);
  };

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) setLocation(savedLocation);
    const savedCoords = localStorage.getItem('userCoords');
    if (savedCoords) setCurrentCoords(JSON.parse(savedCoords));
  }, []);

  const handleLogoRotate = () => {
    setIsLogoRotating(true);
    setTimeout(() => setIsLogoRotating(false), 600);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <nav className="bg-white text-gray-800 border-b border-gray-200 font-sans sticky top-0 z-[1000] shadow-sm">
        <div className="max-w-[1500px] mx-auto px-4 py-3">

          {/* ==================== DESKTOP VIEW ==================== */}
          {!isMobileView && (
            <div className="flex items-center justify-between gap-8">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 shrink-0 no-underline" onMouseEnter={handleLogoRotate} onClick={handleLogoRotate}>
                <div className="rounded-lg w-20 h-20 flex items-center justify-center overflow-hidden bg-white p-1">
                  <img
                    src="https://res.cloudinary.com/djtvxmttf/image/upload/v1778658121/a7ea1860-5474-4e8d-800b-72c68b9f6b71.png"
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="w-32 h-16">
                    <img 
                      src="https://res.cloudinary.com/djtvxmttf/image/upload/v1778752596/3b3dd98d-e461-4412-ba36-b5086a6e6331.png" 
                      alt="logo name" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </Link>

              {/* Search Bar - Desktop */}
              <div className="flex-1 max-w-xl relative" ref={searchRef}>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim() && searchResults.length > 0 && setShowSearchDropdown(true)}
                    placeholder="Search for services (e.g., Plumbing, AC Repair, Cleaning)..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Search Results Dropdown - Desktop */}
                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-50">
                    {searchResults.map((service) => (
                      <Link
                        key={service._id}
                        to={`/service/${service.slug}`}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {service.images && service.images[0]?.url ? (
                            <img src={service.images[0].url} alt={service.name} className="w-full h-full object-cover" />
                          ) : service.icon?.url ? (
                            <img src={service.icon.url} alt={service.name} className="w-full h-full object-contain p-2" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{service.name}</p>
                          <p className="text-xs text-gray-500">{service.category?.name || 'Service'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-emerald-600">₹{service.basePrice}</p>
                          <p className="text-xs text-gray-400">{service.priceUnit?.replace('_', ' ') || 'Starting'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Selector */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-gray-600">{location || 'Select Location'}</span>
                <button onClick={() => setShowLocationPopup(true)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Change
                </button>
              </div>

              {/* Right Icons */}
              <div className="flex items-center gap-3 shrink-0">
                <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 bg-white hover:bg-gray-50 rounded-full transition-colors border border-gray-200 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M18 13l1.5 6M9 21a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
                {user && <NotificationBell />}
                {user ? (
                  <div className="relative group">
                    <button className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 px-2 py-1.5 rounded-full transition-colors shadow-sm">
                      <div className="w-7 h-7 bg-blue-100 text-blue-700 font-bold rounded-full flex items-center justify-center text-xs">{getInitials(user.name || user.email)}</div>
                      <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">{user.name || user.email?.split('@')[0]}</span>
                      <svg className="w-4 h-4 text-gray-400 pr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                      <Link to="/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium">Profile</Link>
                      <Link to="/my-bookings" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium">My Bookings</Link>
                      {user.role === 'provider' && (
                        <>
                          <Link to="/provider" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium">Dashboard</Link>
                          <Link to="/provider/bookings" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium">Manage Bookings</Link>
                          <Link to="/provider/services" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium">My Services</Link>
                          <Link to="/provider/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium">Profile Settings</Link>
                          <button onClick={() => setShowLocationModal(true)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium">
                            Update Service Area
                          </button>
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
              </div>
            </div>
          )}

          {/* ==================== MOBILE VIEW ==================== */}
          {isMobileView && (
            <div className="flex flex-col gap-3">
              {/* Top Row - Logo, Search Icon, Location, Cart, Hamburger */}
              <div className="flex items-center justify-between gap-2">
                {/* Logo */}
                <Link to="/" className="flex shrink-0 items-center gap-2 no-underline" onClick={handleLogoRotate}>
                  <div className="rounded-lg w-14 h-14 flex items-center justify-center overflow-hidden bg-white p-1">
                    <img 
                      src="https://res.cloudinary.com/djtvxmttf/image/upload/v1778658121/a7ea1860-5474-4e8d-800b-72c68b9f6b71.png" 
                      alt="Logo" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <div className="w-24 h-12">
                    <img 
                      src="https://res.cloudinary.com/djtvxmttf/image/upload/v1778752596/3b3dd98d-e461-4412-ba36-b5086a6e6331.png" 
                      alt="logo name" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Search Icon */}
                  <button
                    onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                    className="p-2 text-gray-600 bg-gray-50 border border-gray-200 rounded-full transition-colors hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>

                  {/* Location Icon */}
                  <button
                    onClick={() => setShowLocationPopup(true)}
                    className="p-2 text-gray-600 bg-gray-50 border border-gray-200 rounded-full transition-colors hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>

                  {/* Cart Icon */}
                  <Link to="/cart" className="relative p-2 text-gray-600 bg-gray-50 border border-gray-200 rounded-full transition-colors hover:bg-gray-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M18 13l1.5 6M9 21a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z" />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow-sm">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </Link>

                  {/* Hamburger Menu */}
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="flex flex-col items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 w-9 h-9 rounded-xl transition-all shadow-md active:scale-95"
                  >
                    <span className="w-4 h-0.5 bg-white rounded-full"></span>
                    <span className="w-4 h-0.5 bg-white rounded-full"></span>
                    <span className="w-4 h-0.5 bg-white rounded-full"></span>
                  </button>
                </div>
              </div>

              {/* Expandable Search Bar - Mobile */}
              {mobileSearchOpen && (
                <div className="relative w-full animate-fadeIn" ref={mobileSearchRef}>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.trim() && searchResults.length > 0 && setShowSearchDropdown(true)}
                      placeholder="Search for services..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      autoFocus
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <button
                      onClick={() => setMobileSearchOpen(false)}
                      className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Search Results Dropdown - Mobile */}
                  {showSearchDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-80 overflow-y-auto z-50">
                      {searchResults.map((service) => (
                        <Link
                          key={service._id}
                          to={`/service/${service.slug}`}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            setSearchQuery('');
                            setMobileSearchOpen(false);
                          }}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {service.images && service.images[0]?.url ? (
                              <img src={service.images[0].url} alt={service.name} className="w-full h-full object-cover" />
                            ) : service.icon?.url ? (
                              <img src={service.icon.url} alt={service.name} className="w-full h-full object-contain p-1.5" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{service.name}</p>
                            <p className="text-xs text-gray-500">{service.category?.name || 'Service'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-emerald-600">₹{service.basePrice}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Categories Row */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categoriesLoading ? (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>)}
              </div>
            ) : categories.length > 0 ? (
              categories.map(cat => (
                <Link
                  key={cat._id}
                  to={`/category/${cat.slug}`}
                  className="shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium transition shadow-sm whitespace-nowrap"
                >
                  {cat.icon?.url ? (
                    <img src={cat.icon.url} alt={cat.name} className="w-4 h-4 object-contain" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  {cat.name}
                </Link>
              ))
            ) : (
              <div className="text-sm text-gray-400">No categories available</div>
            )}
          </div>
        </div>
      </nav>

      {/* Location Popup Modal */}
      {showLocationPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1200] flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowLocationPopup(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">📍 Select Location</h3>
              <button onClick={() => setShowLocationPopup(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <button
                onClick={getCurrentLocation}
                disabled={isLocating}
                className="w-full flex items-center justify-center gap-3 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 px-4 rounded-xl transition border border-blue-200 font-semibold"
              >
                {isLocating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                    <span>Locating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Use My Current Location</span>
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-400">OR SEARCH ADDRESS</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder="Type full address, city, or pincode..."
                  className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && searchAddressAndShowMap()}
                />
                <button
                  onClick={searchAddressAndShowMap}
                  disabled={isAddressSearching}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition"
                >
                  {isAddressSearching ? 'Searching...' : 'Search on Map'}
                </button>
              </div>

              {showMap && (
                <div className="space-y-2">
                  <div ref={mapContainerRef} className="h-[250px] w-full rounded-xl bg-gray-100 overflow-hidden border border-gray-200"></div>
                  <p className="text-xs text-gray-500 text-center">📍 Drag the marker to adjust exact location</p>
                  <button onClick={confirmMapLocation} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-semibold transition shadow-md">
                    Confirm This Location
                  </button>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-400">OR ENTER MANUALLY</span>
                </div>
              </div>

              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Enter city name (e.g., Mumbai, Delhi)"
                className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                onKeyPress={(e) => e.key === 'Enter' && saveCustomLocation()}
              />
              <button onClick={saveCustomLocation} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition">
                Save Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[1300] animate-slideUp">
          <div className="bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[1050] transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-[1100] transform transition-all duration-300 ease-out flex flex-col ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-lg font-bold border-2 border-white/30">
                    {getInitials(user.name || user.email)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{user.name || 'User'}</h3>
                    <p className="text-xs text-blue-100 mt-0.5">{user.email}</p>
                    {user.role === 'provider' && (
                      <span className="inline-block mt-1 text-[10px] bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-semibold">PROFESSIONAL</span>
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full text-center py-2">
                  <p className="text-sm text-blue-100 mb-2">Welcome to GharSeva!</p>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }} className="flex-1 bg-white text-blue-600 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition">
                      Login
                    </button>
                    <button onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }} className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-400 transition">
                      Sign Up
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Main Menu</p>
            <div className="space-y-1">
              <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
              <Link to="/services" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                All Services
              </Link>
              <Link to="/providers" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Providers
              </Link>
            </div>
          </div>

          {user && (
            <div className="px-4 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Account</p>
              <div className="space-y-1">
                <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
                <Link to="/my-bookings" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  My Bookings
                </Link>
                {user.role === 'provider' && (
                  <>
                    <Link to="/provider" className="flex items-center gap-3 px-3 py-2.5 text-amber-700 hover:bg-amber-50 rounded-xl transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Provider Dashboard
                    </Link>
                    <button onClick={() => { setShowLocationModal(true); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition font-medium text-left">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      Update Service Area
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {user?.role !== 'provider' && (
            <div className="px-4 mb-4">
              <Link to="/register-provider" className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl hover:shadow-md transition-all" onClick={() => setMobileMenuOpen(false)}>
                <div>
                  <p className="text-sm font-bold text-amber-700">Become a Professional</p>
                  <p className="text-xs text-amber-600 mt-0.5">Join GharSeva & grow your business</p>
                </div>
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {user && (
          <div className="border-t border-gray-100 p-4">
            <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition font-semibold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Provider Location Modal */}
      {showLocationModal && user?.role === 'provider' && (
        <ProviderLocationModal onClose={() => setShowLocationModal(false)} />
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.25s ease-out forwards; }
      `}</style>
    </>
  );
};

export default Navbar;