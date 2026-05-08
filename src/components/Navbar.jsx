import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout  , setShowAuth} = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [searchPlaceholder, setSearchPlaceholder] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLogoRotating, setIsLogoRotating] = useState(false);
  const [isLocating, setIsLocating] = useState(false); // new loader state

  const searchTimeout = useRef(null);
  const searchRef = useRef(null);
  const locationRef = useRef(null);

  // Array of service-related placeholders
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

  // Rotate placeholder every 3 seconds
  useEffect(() => {
    let placeholderIndex = 0;
    const interval = setInterval(() => {
      placeholderIndex = (placeholderIndex + 1) % servicePlaceholders.length;
      if (!isSearchFocused) {
        setSearchPlaceholder(servicePlaceholders[placeholderIndex]);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isSearchFocused]);

  // Handle click outside for search results and location picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logo rotation on hover or click
  const handleLogoRotate = () => {
    setIsLogoRotating(true);
    setTimeout(() => {
      setIsLogoRotating(false);
    }, 600);
  };

  // Search services
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
          console.error('Search error:', error);
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

  // Get current location – improved accuracy + loader
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    return;
  }

  setIsLocating(true);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();

        let address = '';
        if (data.address) {
          const addr = data.address;
          // Zyada specific cheezein pehle lein: road, amenity, neighbourhood, suburb
          const place = addr.road || addr.amenity || addr.neighbourhood || addr.suburb || addr.city_district || '';
          const city = addr.city || addr.town || addr.village || addr.state_district || '';
          const state = addr.state || '';
          address = [place, city, state].filter(Boolean).join(', ');
        }

        if (!address && data.display_name) {
          // Fallback: pehle ke do parts lein
          address = data.display_name.split(',').slice(0, 2).join(', ').trim();
        }

        const finalAddress = address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setLocation(finalAddress);
        setShowLocationPicker(false);
        localStorage.setItem('userLocation', finalAddress);
      } catch (error) {
        console.error('Error getting address:', error);
        const fallback = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setLocation(fallback);
        localStorage.setItem('userLocation', fallback);
      } finally {
        setIsLocating(false);
      }
    },
    (error) => {
      console.error('Geolocation error:', error);
      alert('Unable to get your location. Please check permissions.');
      setIsLocating(false);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // 👈 high accuracy options
  );
};

  // Save custom location
  const saveCustomLocation = () => {
    if (customLocation.trim()) {
      setLocation(customLocation);
      setShowLocationPicker(false);
      localStorage.setItem('userLocation', customLocation);
      setCustomLocation('');
    }
  };

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setLocation(savedLocation);
    }
  }, []);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/services/search?q=${searchQuery}&location=${location}`;
    }
  };

  // Select search result
  const selectSearchResult = (service) => {
    window.location.href = `/service/${service.id}`;
  };

  return (
    <>
      {/* Navbar with WHITE background and simple bottom line */}
      <nav className="navbar-white">
        <div className="navbar-container">
          {/* Top Row - Logo + Desktop Navigation */}
          <div className="navbar-top-row">
            {/* Logo Section with rotating animation on hover/click */}
            <div className="logo-section">
              <Link 
                to="/" 
                className="logo-link"
                onMouseEnter={handleLogoRotate}
                onClick={handleLogoRotate}
              >
                <div className="logo-wrapper">
                  <img 
                    src="https://res.cloudinary.com/djtvxmttf/image/upload/v1778086674/seva_uuvngp-removebg-preview_mq4ctm.png"
                    alt="GharSeva Logo"
                    className={`logo-image ${isLogoRotating ? 'logo-rotate' : ''}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/80x80?text=GS";
                    }}
                  />
                </div>
                <div className="logo-text">
                  <span className="brand-name">GharSeva</span>
                  <p className="brand-tagline">Home Services at Your Doorstep</p>
                </div>
              </Link>
              
              {/* Mobile Menu Button */}
              <button className="mobile-menu-btn">
                <svg className="mobile-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <div className="nav-links">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/services" className="nav-link">Services</Link>
              <Link to="/providers" className="nav-link">Providers</Link>
              <Link to="/register-as-professional" className="register-btn">
                Register as Professional
              </Link>
            </div>

            {/* User Actions */}
            <div className="user-actions">
              {user ? (
                <div className="user-dropdown">
                  <button className="user-dropdown-btn">
                    <span className="username">{user.name || user.email?.split('@')[0]}</span>
                    <svg className="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="dropdown-menu">
                    <Link to="/profile" className="dropdown-item">Profile</Link>
                    <Link to="/my-bookings" className="dropdown-item">Bookings</Link>
                    {user.role === 'provider' && (
                      <>
                        <Link to="/provider/profile" className="dropdown-item">My Services</Link>
                        <Link to="/provider/stats" className="dropdown-item">Stats</Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <Link to="/admin" className="dropdown-item">Admin Panel</Link>
                    )}
                    <button onClick={logout} className="dropdown-item logout-item">Logout</button>
                  </div>
                </div>
              ) : (
                <div className="auth-buttons">
                  <button onClick={()=>setShowAuth(true)} className='login-link'>Login</button>
                  <button onClick={()=>setShowAuth(true)} className='register-link'>Signup</button>
                  
                
                </div>
              )}
            </div>
          </div>

          {/* Search and Location Row */}
          <div className="search-location-row">
            {/* Location Picker */}
            <div className="location-picker" ref={locationRef}>
              <button
                onClick={() => setShowLocationPicker(!showLocationPicker)}
                className="location-btn"
              >
                <svg className="location-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {/* Show loader or location text */}
                {isLocating ? (
                  <span className="locating-text">
                    <span className="locating-spinner"></span> Locating…
                  </span>
                ) : (
                  <span className="location-text">
                    {location || 'Select Location'}
                  </span>
                )}
                <svg className="dropdown-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Location Picker Dropdown */}
              {showLocationPicker && (
                <div className="location-dropdown">
                  <div className="location-dropdown-content">
                    <h3 className="dropdown-title">Choose Location</h3>
                    <button
                      onClick={getCurrentLocation}
                      className="current-location-btn"
                      disabled={isLocating}
                    >
                      <svg className="location-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {isLocating ? 'Locating...' : 'Use Current Location'}
                    </button>
                    <div className="divider"></div>
                    <input
                      type="text"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder="Enter city/locality..."
                      className="location-input"
                      onKeyPress={(e) => e.key === 'Enter' && saveCustomLocation()}
                    />
                    <button
                      onClick={saveCustomLocation}
                      className="save-location-btn"
                    >
                      Save Location
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar */}
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
                    onFocus={() => {
                      setIsSearchFocused(true);
                      if (searchQuery.length > 1) setShowSearchResults(true);
                    }}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder={searchPlaceholder || servicePlaceholders[0]}
                    className="search-input"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                        setShowSearchResults(false);
                      }}
                      className="clear-search-btn"
                    >
                      <svg className="clear-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </form>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="search-results-dropdown">
                  {loading ? (
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <p className="loading-text">Searching services...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      {searchResults.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => selectSearchResult(service)}
                          className="search-result-item"
                        >
                          <div className="result-info">
                            <h4 className="result-name">{service.name}</h4>
                            <p className="result-category">{service.category}</p>
                          </div>
                          <div className="result-details">
                            <div className="rating">
                              <span className="star">★</span>
                              <span>{service.rating}</span>
                            </div>
                            <p className="price">₹{service.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.length > 1 ? (
                    <div className="no-results">
                      <p>No services found for "{searchQuery}"</p>
                      <p className="no-results-hint">Try different keywords or check your location</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <Link to="/" className="mobile-nav-item">
          <svg className="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="mobile-nav-label">Home</span>
        </Link>
        <Link to="/services" className="mobile-nav-item">
          <svg className="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="mobile-nav-label">Services</span>
        </Link>
        <Link to="/register-as-professional" className="mobile-nav-item special">
          <svg className="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="mobile-nav-label">Register</span>
        </Link>
        {user ? (
          <Link to="/profile" className="mobile-nav-item">
            <svg className="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="mobile-nav-label">Profile</span>
          </Link>
        ) : (
          <Link to="/login" className="mobile-nav-item">
            <svg className="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="mobile-nav-label">Login</span>
          </Link>
        )}
      </div>

      {/* Spacer for mobile bottom nav */}
      <div className="mobile-bottom-spacer"></div>

      <style>{`
        /* Google Fonts - Poppins & other modern fonts */
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Poppins:wght@300;400;500;600;700;800&display=swap');

        /* Navbar Styles - White Background with Simple Bottom Line */
        .navbar-white {
          background-color: #ffffff;
          width: 100%;
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid #e5e7eb;
          font-family: 'Poppins', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, sans-serif;
        }

        .navbar-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0.75rem 1.5rem;
        }

        /* Top Row */
        .navbar-top-row {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        @media (min-width: 1024px) {
          .navbar-top-row {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        /* Logo Section */
        .logo-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        @media (min-width: 1024px) {
          .logo-section {
            width: auto;
          }
        }

        .logo-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          cursor: pointer;
        }

        .logo-wrapper {
          position: relative;
        }

        .logo-image {
          height: 4rem;
          width: auto;
          object-fit: contain;
          transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .logo-rotate {
          animation: rotateLogo 0.6s ease-in-out;
        }

        @keyframes rotateLogo {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .logo-text {
          display: none;
        }

        @media (min-width: 640px) {
          .logo-text {
            display: block;
          }
        }

        .brand-name {
          font-size: 1.875rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .brand-tagline {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.125rem;
        }

        /* Mobile Menu Button */
        .mobile-menu-btn {
          display: block;
          padding: 0.5rem;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #374151;
        }

        @media (min-width: 1024px) {
          .mobile-menu-btn {
            display: none;
          }
        }

        .mobile-menu-icon {
          width: 1.5rem;
          height: 1.5rem;
        }

        /* Desktop Navigation Links */
        .nav-links {
          display: none;
          gap: 1.5rem;
          align-items: center;
        }

        @media (min-width: 1024px) {
          .nav-links {
            display: flex;
          }
        }

        .nav-link {
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: #3b82f6;
        }

        .register-btn {
          background: linear-gradient(135deg, #eab308 0%, #f59e0b 100%);
          color: #1f2937;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.2s;
        }

        .register-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        /* User Actions */
        .user-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .user-dropdown {
          position: relative;
        }

        .user-dropdown-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #374151;
          font-family: inherit;
          font-weight: 500;
          padding: 0.5rem;
        }

        .user-dropdown-btn:hover {
          color: #3b82f6;
        }

        .dropdown-icon {
          width: 1rem;
          height: 1rem;
        }

        .dropdown-menu {
          position: absolute;
          right: 0;
          margin-top: 0.5rem;
          width: 12rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s;
          z-index: 20;
        }

        .user-dropdown:hover .dropdown-menu {
          opacity: 1;
          visibility: visible;
        }

        .dropdown-item {
          display: block;
          padding: 0.5rem 1rem;
          color: #374151;
          text-decoration: none;
          transition: background 0.2s;
        }

        .dropdown-item:hover {
          background: #f3f4f6;
        }

        .logout-item {
          color: #dc2626;
        }

        .auth-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .login-link {
          color: #374151;
          text-decoration: none;
            font-weight: 600;
          padding: 0.25rem 0.75rem;
          transition: color 0.2s;
        }

        .login-link:hover {
          color: #3b82f6;
        }

        .register-link {
          background: #3b82f6;
          color: white;
          padding: 0.25rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s;
        }

        .register-link:hover {
          background: #2563eb;
          transform: scale(1.05);
        }

        /* Search and Location Row */
        .search-location-row {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        @media (min-width: 768px) {
          .search-location-row {
            flex-direction: row;
          }
        }

        /* Location Picker */
        .location-picker {
          position: relative;
        }

        .location-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          padding: 0.625rem 1rem;
          border-radius: 0.5rem;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          font-family: inherit;
        }

        .location-btn:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .location-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .location-text {
          flex: 1;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }

        /* Loader for location */
        .locating-text {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .locating-spinner {
          display: inline-block;
          width: 0.875rem;
          height: 0.875rem;
          border: 2px solid #d1d5db;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .dropdown-arrow {
          width: 1rem;
          height: 1rem;
        }

        /* Location Dropdown */
        .location-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 0.5rem;
          width: 20rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          z-index: 30;
        }

        .location-dropdown-content {
          padding: 1rem;
        }

        .dropdown-title {
          color: #1f2937;
          font-weight: 600;
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }

        .current-location-btn {
          width: 100%;
          background: #eff6ff;
          color: #3b82f6;
          padding: 0.5rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s;
        }

        .current-location-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .current-location-btn:hover:not(:disabled) {
          background: #dbeafe;
        }

        .location-icon-sm {
          width: 1.25rem;
          height: 1.25rem;
        }

        .divider {
          border-top: 1px solid #e5e7eb;
          margin: 0.75rem 0;
        }

        .location-input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          margin-bottom: 0.75rem;
          font-family: inherit;
        }

        .location-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .save-location-btn {
          width: 100%;
          background: #3b82f6;
          color: white;
          padding: 0.5rem;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-weight: 500;
          transition: background 0.2s;
        }

        .save-location-btn:hover {
          background: #2563eb;
        }

        /* Search Wrapper */
        .search-wrapper {
          flex: 1;
          position: relative;
        }

        .search-form {
          width: 100%;
        }

        .search-input-wrapper {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1.25rem;
          height: 1.25rem;
          color: #9ca3af;
        }

        .search-input {
          width: 100%;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          color: #1f2937;
          padding: 0.625rem 2.5rem 0.625rem 2.5rem;
          border-radius: 0.5rem;
          font-family: inherit;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .clear-search-btn {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          cursor: pointer;
          color: #9ca3af;
        }

        .clear-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        /* Search Results Dropdown */
        .search-results-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 0.5rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          max-height: 24rem;
          overflow-y: auto;
          z-index: 30;
        }

        .loading-state {
          padding: 1rem;
          text-align: center;
          color: #6b7280;
        }

        .spinner {
          display: inline-block;
          width: 1.5rem;
          height: 1.5rem;
          border: 2px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-text {
          margin-top: 0.5rem;
        }

        .search-result-item {
          padding: 0.75rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #f3f4f6;
          transition: background 0.2s;
        }

        .search-result-item:hover {
          background: #f9fafb;
        }

        .result-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 0.875rem;
        }

        .result-category {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.125rem;
        }

        .result-details {
          text-align: right;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: #f59e0b;
        }

        .star {
          font-size: 0.75rem;
        }

        .price {
          font-size: 0.75rem;
          font-weight: 600;
          color: #10b981;
          margin-top: 0.25rem;
        }

        .no-results {
          padding: 1rem;
          text-align: center;
          color: #6b7280;
        }

        .no-results-hint {
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        /* Mobile Bottom Navigation */
        .mobile-bottom-nav {
          display: flex;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #e5e7eb;
          padding: 0.5rem 1rem;
          justify-content: space-around;
          align-items: center;
          z-index: 50;
        }

        @media (min-width: 1024px) {
          .mobile-bottom-nav {
            display: none;
          }
        }

        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          color: #6b7280;
          transition: color 0.2s;
        }

        .mobile-nav-item:hover {
          color: #3b82f6;
        }

        .mobile-nav-item.special {
          color: #eab308;
        }

        .mobile-nav-icon {
          width: 1.5rem;
          height: 1.5rem;
        }

        .mobile-nav-label {
          font-size: 0.625rem;
          margin-top: 0.25rem;
        }

        .mobile-bottom-spacer {
          height: 4rem;
        }

        @media (min-width: 1024px) {
          .mobile-bottom-spacer {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;