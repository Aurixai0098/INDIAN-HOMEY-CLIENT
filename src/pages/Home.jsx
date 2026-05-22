// src/pages/Home.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories, fetchFeaturedServices, fetchPopularServices } from '../services/api';
import InfiniteReviewsMarquee from '../components/SliderImages';
import InfiniteProvidersMarquee from '../components/InfiniteProvidersMarquee';   // ✅ NEW

// Clickable Service Card
const ServiceCard = ({ service }) => (
  <Link to={`/service/${service.slug}`} className="group cursor-pointer tap-feedback block">
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 mb-3 md:mb-4 aspect-square md:aspect-[4/3] flex items-center justify-center p-2">
      <img
        src={service.images?.[0]?.url || "https://via.placeholder.com/400x400?text=Service"}
        alt={service.name}
        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
    </div>
    <h4 className="text-center font-bold text-slate-800 text-sm sm:text-base md:text-lg px-1">{service.name}</h4>
    <p className="text-center text-emerald-600 font-semibold text-sm">₹{service.basePrice} {service.priceUnit?.replace('_', ' ')}</p>
  </Link>
);

export default function Home() {
  const categoryScrollRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(80);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  // Check screen size and get navbar height
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setWindowHeight(window.innerHeight);
    };

    // Get navbar height dynamically
    const getNavbarHeight = () => {
      const navbar = document.querySelector('nav');
      if (navbar) {
        setNavbarHeight(navbar.offsetHeight);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('resize', getNavbarHeight);
    
    // Small delay to ensure navbar is rendered
    setTimeout(getNavbarHeight, 100);
    getNavbarHeight();

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('resize', getNavbarHeight);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, featuredRes, popularRes] = await Promise.all([
        fetchCategories(),
        fetchFeaturedServices(),
        fetchPopularServices()
      ]);
      if (categoriesRes.success) setCategories(categoriesRes.data.categories);
      else setCategories([]);
      if (featuredRes.success) setFeaturedServices(featuredRes.data.services);
      else setFeaturedServices([]);
      if (popularRes.success) setPopularServices(popularRes.data.services);
      else setPopularServices([]);
    } catch (err) {
      console.error("Error loading home data:", err);
    } finally {
      setLoading(false);
      setCategoriesLoading(false);
    }
  };

  const scrollCategory = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = window.innerWidth < 640 ? 280 : 400;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Different images for different screen sizes
  const desktopBgImage = "https://res.cloudinary.com/djtvxmttf/image/upload/v1778755088/banner_1_vl9ona.png";
  const mobileBgImage = "https://res.cloudinary.com/djtvxmttf/image/upload/v1778755202/banner_mobile_1_ottjgx.png";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing services...</p>
        </div>
      </div>
    );
  }

  // Calculate hero height based on screen size
  const heroMinHeight = isMobile ? 'calc(100vh - 60px)' : 'calc(100vh - 80px)';

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Hero Section - Fixed overlap issue using calc() */}
      <section
        className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat flex items-center"
        style={{
          backgroundImage: `url('${isMobile ? mobileBgImage : desktopBgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: heroMinHeight,
          height: 'auto'
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0  z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full py-12 md:py-16">
          <div className="flex flex-col items-center text-center">
            {/* Logo/Brand Name */}
            {/* <div className="mb-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg tracking-tight">
                INDIAN HOMEY
              </h1>
            </div>
             */}
            {/* <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg mb-4">
                Expert Professional
                <br />
                Home Services,
                <br />
                Book Online
              </h2>
              <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto mt-4 drop-shadow">
                Service On Wheel helps you live smarter, giving you time to focus on what's most important.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/services" 
                  className="inline-flex items-center justify-center px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Book Now
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link 
                  to="/providers" 
                  className="inline-flex items-center justify-center px-8 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold rounded-full transition-all border border-white/30"
                >
                  Find Professionals
                </Link>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* Categories Slider - Clean design without borders */}
      <section className="py-8 md:py-12 px-4 sm:px-6 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => scrollCategory('left')} 
              className="shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-slate-600 hover:bg-gray-200 active:scale-95 transition-all tap-feedback"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            
            <div ref={categoryScrollRef} className="flex flex-1 items-center gap-6 md:gap-8 overflow-x-auto no-scrollbar horizontal-scroll py-4">
              {categoriesLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <div key={i} className="flex flex-col items-center min-w-[90px] sm:min-w-[110px]">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
                    <div className="w-14 h-3 bg-gray-100 rounded mt-3 animate-pulse"></div>
                  </div>
                ))
              ) : (
                categories.map((cat) => (
                  <Link 
                    to={`/category/${cat.slug}`} 
                    key={cat._id} 
                    className="flex flex-col items-center min-w-[90px] sm:min-w-[110px] group cursor-pointer tap-feedback transition-all duration-300 hover:transform hover:-translate-y-1"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:bg-emerald-50">
                      {cat.icon?.url ? (
                        <img src={cat.icon.url} alt={cat.name} className="w-12 h-12 object-contain" />
                      ) : (
                        <span className="text-3xl sm:text-4xl text-gray-400">{cat.name.charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-sm sm:text-base font-medium text-gray-700 text-center mt-3 group-hover:text-emerald-600 transition-colors whitespace-nowrap">
                      {cat.name}
                    </span>
                  </Link>
                ))
              )}
            </div>
            
            <button 
              onClick={() => scrollCategory('right')} 
              className="shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-slate-600 hover:bg-gray-200 active:scale-95 transition-all tap-feedback"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      {featuredServices.length > 0 && (
        <section className="py-12 md:py-16 px-4 sm:px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2">Featured Services</h2>
                <p className="text-slate-500 text-sm md:text-base">Most popular services chosen by our customers</p>
              </div>
              <Link to="/services" className="flex items-center gap-2 text-slate-800 font-semibold hover:text-emerald-600 transition-all group whitespace-nowrap text-sm md:text-base">
                View All Services
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 md:gap-6">
              {featuredServices.slice(0, 8).map(service => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Services Section */}
      {popularServices.length > 0 && (
        <section className="py-12 md:py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2">Popular Services</h2>
                <p className="text-slate-500 text-sm md:text-base">Trending now – booked by thousands</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 md:gap-6">
              {popularServices.slice(0, 8).map(service => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works section */}
      <section className="py-14 md:py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">How it works</h2>
            <p className="text-slate-500">3 simple steps to Ghar Seva freedom</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-start">
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-white rounded-2xl shadow-md p-3 flex items-center justify-center mb-4">
                <img src="https://img.icons8.com/color/96/appointment-reminders--v1.png" alt="Step 1" className="w-16 sm:w-20" />
              </div>
              <span className="text-emerald-600 font-bold text-sm block mb-2">Step 1</span>
              <h4 className="text-lg sm:text-xl font-bold text-slate-800">Book Online or Phone</h4>
              <p className="text-slate-500 text-sm mt-2">Choose your service and schedule at your convenience</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-white rounded-2xl shadow-md p-3 flex items-center justify-center mb-4">
                <img src="https://img.icons8.com/color/96/smartphone--v1.png" alt="Step 2" className="w-16 sm:w-20" />
              </div>
              <span className="text-emerald-600 font-bold text-sm block mb-2">Step 2</span>
              <h4 className="text-lg sm:text-xl font-bold text-slate-800">Get Booking Details Via SMS</h4>
              <p className="text-slate-500 text-sm mt-2">Receive confirmation and professional details</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-white rounded-2xl shadow-md p-3 flex items-center justify-center mb-4">
                <img src="https://img.icons8.com/color/96/money-transfer.png" alt="Step 3" className="w-16 sm:w-20" />
              </div>
              <span className="text-emerald-600 font-bold text-sm block mb-2">Step 3</span>
              <h4 className="text-lg sm:text-xl font-bold text-slate-800">Pay After Work is Done</h4>
              <p className="text-slate-500 text-sm mt-2">Secure payment only after service completion</p>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ NEW: Infinite Providers Section */}
      <InfiniteProvidersMarquee />

      {/* Customer Reviews */}
      <InfiniteReviewsMarquee />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .horizontal-scroll { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory; }
        .horizontal-scroll > * { scroll-snap-align: start; }
        .tap-feedback { cursor: pointer; -webkit-tap-highlight-color: transparent; }
        .tap-feedback:active { transform: scale(0.96); transition: transform 0.08s linear; }
      `}</style>
    </div>
  );
}