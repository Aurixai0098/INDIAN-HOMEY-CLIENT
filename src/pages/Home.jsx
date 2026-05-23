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
        <div className="flex items-center justify-center min-h-screen bg-gray-50 flex-col gap-4">
          {/* Container for logo + spinning ring */}
          <div className="relative w-28 h-28">
            {/* Spinning outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            {/* Centered logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dfqsa6hoc/image/upload/v1779533276/PhotoshopExtension_Image__1_-removebg-preview_fzvzvy.png"
                alt="INDIAN HOMEY"
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
          {/* Welcome text */}
          <p className="text-gray-800 font-semibold text-xl mt-2">Welcome to INDIAN HOMEY</p>
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

      
     {/* Categories/Offers Section - Banner Style */}
<section className="py-8 w-full bg-white">
  <div className="w-full px-4">
    <h2 className="text-xl font-bold text-gray-900 mb-6 px-2">All Catogerys</h2>

    <div className="relative flex items-center">
      {/* Scroll Buttons */}
      <button onClick={() => scrollCategory('left')} className="absolute left-2 z-20 p-2 bg-white shadow-xl rounded-full text-gray-600 hover:bg-gray-100 hidden md:flex">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>

      {/* Scrollable Container */}
      <div ref={categoryScrollRef} className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth px-2 pb-4">
        {categoriesLoading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="min-w-[300px] sm:min-w-[400px] h-[200px] bg-gray-100 rounded-2xl animate-pulse"></div>)
        ) : (
          categories.map((cat) => (
            <Link
              to={`/category/${cat.slug}`}
              key={cat._id}
              className="relative min-w-[300px] sm:min-w-[400px] h-[200px] rounded-2xl overflow-hidden group shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Background Image */}
              <img 
                src={cat.icon?.url || "https://via.placeholder.com/400x200"} 
                alt={cat.name} 
                className="w-full h-full object-cover" 
              />
              
              {/* Overlay Gradient for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent p-6 flex flex-col justify-center">
                <h3 className="text-white text-xl md:text-2xl font-bold mb-4">{cat.name}</h3>
                
                {/* Button */}
                <div className="bg-white text-black text-sm font-semibold py-2 px-4 rounded w-fit hover:bg-gray-100 transition-colors">
                  Book now
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <button onClick={() => scrollCategory('right')} className="absolute right-2 z-20 p-2 bg-white shadow-xl rounded-full text-gray-600 hover:bg-gray-100 hidden md:flex">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  </div>
</section>

{/* Featured Services Section - Unique Banner with Scroll Buttons */}
{featuredServices.length > 0 && (
  <section className="py-12 bg-white relative">
    <div className="px-4">
      {/* Header */}
      <div className="flex justify-center items-center mb-10">
        <h2 className="text-3xl md:text-6xl font-extrabold text-slate-900 font-merienda underline decoration-emerald-500 underline-offset-8">
          Featured Services
        </h2>
      </div>

      {/* Container with relative positioning for arrows */}
      <div className="relative group">
        
        {/* Left Scroll Button */}
        <button 
          onClick={() => {
            const container = document.getElementById('featured-scroll');
            container.scrollBy({ left: -400, behavior: 'smooth' });
          }}
          className="absolute -left-4 top-1/2 z-20 hidden md:flex bg-white p-3 rounded-full shadow-xl text-slate-800 hover:bg-emerald-500 hover:text-white transition-all transform -translate-y-1/2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        {/* Scrollable Container */}
        <div id="featured-scroll" className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-8 px-2">
          {featuredServices.slice(0, 8).map((service) => (
            <Link
              key={service._id}
              to={`/service/${service.slug}`}
              className="relative min-w-[320px] sm:min-w-[450px] h-[300px] rounded-3xl overflow-hidden group shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_-5px_rgba(16,185,129,0.4)] transition-all duration-500"
            >
              <img
                src={service.images?.[0]?.url || "https://via.placeholder.com/600x400"}
                alt={service.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
                <h4 className="text-white text-3xl font-bold font-merienda mb-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {service.name}
                </h4>
                <div className="flex items-end justify-between">
                  <p className="text-emerald-400 font-bold text-xl">₹{service.basePrice}</p>
                  <div className="bg-white text-black font-bold py-3 px-6 rounded-full transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    Book now →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Scroll Button */}
        <button 
          onClick={() => {
            const container = document.getElementById('featured-scroll');
            container.scrollBy({ left: 400, behavior: 'smooth' });
          }}
          className="absolute -right-4 top-1/2 z-20 hidden md:flex bg-white p-3 rounded-full shadow-xl text-slate-800 hover:bg-emerald-500 hover:text-white transition-all transform -translate-y-1/2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  </section>
)}

 {/* Popular Services Section - Horizontal Scrollable Banners */}
{popularServices.length > 0 && (
  <section className="py-12 bg-white relative">
    <div className="px-4">
      {/* Header */}
      <div className="flex flex-col justify-center items-center mb-10">
        <h2 className="text-3xl md:text-6xl font-extrabold text-slate-900 font-merienda mb-3">
          Popular Services
        </h2>
        <p className="text-xl text-slate-500 font-ubuntu underline underline-offset-4 decoration-emerald-500">
          Trending now – booked by thousands
        </p>
      </div>

      {/* Container with relative positioning for arrows */}
      <div className="relative group">
        
        {/* Left Scroll Button */}
        <button 
          onClick={() => {
            const container = document.getElementById('popular-scroll');
            container.scrollBy({ left: -400, behavior: 'smooth' });
          }}
          className="absolute -left-4 top-1/2 z-20 hidden md:flex bg-white p-3 rounded-full shadow-xl text-slate-800 hover:bg-emerald-500 hover:text-white transition-all transform -translate-y-1/2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        {/* Scrollable Container */}
        <div id="popular-scroll" className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-8 px-2">
          {popularServices.slice(0, 8).map((service) => (
            <Link
              key={service._id}
              to={`/service/${service.slug}`}
              className="relative min-w-[320px] sm:min-w-[450px] h-[300px] rounded-3xl overflow-hidden group shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_-5px_rgba(16,185,129,0.4)] transition-all duration-500"
            >
              {/* Background Image */}
              <img
                src={service.images?.[0]?.url || "https://via.placeholder.com/600x400"}
                alt={service.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Content Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
                <h4 className="text-white text-3xl font-bold font-merienda mb-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {service.name}
                </h4>
                <div className="flex items-end justify-between">
                  <p className="text-emerald-400 font-bold text-xl font-ubuntu">
                    ₹{service.basePrice}
                  </p>
                  <div className="bg-white text-black font-bold py-3 px-6 rounded-full transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    Book now →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Scroll Button */}
        <button 
          onClick={() => {
            const container = document.getElementById('popular-scroll');
            container.scrollBy({ left: 400, behavior: 'smooth' });
          }}
          className="absolute -right-4 top-1/2 z-20 hidden md:flex bg-white p-3 rounded-full shadow-xl text-slate-800 hover:bg-emerald-500 hover:text-white transition-all transform -translate-y-1/2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  </section>
)}
      {/* How It Works section */}
      <section className="py-14 md:py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl sm:text-6xl  text-slate-900    mb-2">How it works</h2>
            <p className="text-slate-500    md:text-3xl">3 simple steps to <span className='   '>INDIAN HOMEY</span> freedom</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-start">
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-white rounded-2xl shadow-md p-3 flex items-center justify-center mb-4">
                <img src="https://img.icons8.com/color/96/appointment-reminders--v1.png" alt="Step 1" className="w-16 sm:w-20" />
              </div>
              <span className="text-emerald-600   text-sm block mb-2   md:text-3xl">Step 1</span>
              <h4 className="text-lg sm:text-xl   text-slate-800   md:text-3xl">Book Online or Phone</h4>
              <p className="text-slate-500 text-sm mt-2    md:text-2xl">Choose your service and schedule at your convenience</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-white rounded-2xl shadow-md p-3 flex items-center justify-center mb-4">
                <img src="https://img.icons8.com/color/96/smartphone--v1.png" alt="Step 2" className="w-16 sm:w-20" />
              </div>
              <span className="text-emerald-600   text-sm block mb-2   md:text-3xl">Step 2</span>
              <h4 className="text-lg sm:text-xl   text-slate-800   md:text-3xl">Get Booking Details Via SMS</h4>
              <p className="text-slate-500 text-sm mt-2   md:text-2xl ">Receive confirmation and professional details</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-white rounded-2xl shadow-md p-3 flex items-center justify-center mb-4">
                <img src="https://img.icons8.com/color/96/money-transfer.png" alt="Step 3" className="w-16 sm:w-20" />
              </div>
              <span className="text-emerald-600   text-sm block mb-2   md:text-3xl">Step 3</span>
              <h4 className="text-lg sm:text-xl   text-slate-800   md:text-3xl">Pay After Work is Done</h4>
              <p className="text-slate-500 text-sm mt-2   md:text-3xl">Secure payment only after service completion</p>
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