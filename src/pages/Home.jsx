// src/pages/Home.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories, fetchFeaturedServices, fetchPopularServices } from '../services/api';
import InfiniteReviewsMarquee from '../components/SliderImages';

const sliderImages = [
  "https://www.urbancompany.com/img?bucket=urbanclap-prod&quality=90&format=auto/w_1232,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1778178479978-7aada8.jpeg",
  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1200&h=400&fit=crop"
];

const reviews = [
  {
    id: 1,
    name: "Rajat Jangra",
    date: "24/04/2026",
    rating: 5,
    comment: "Excellent service! The plumber arrived on time and fixed the leakage perfectly. Highly recommended for home services.",
    image: "https://ui-avatars.com/api/?name=Rajat+Jangra&background=10b981&color=fff"
  },
  {
    id: 2,
    name: "Rahul Rao",
    date: "20/03/2026",
    rating: 5,
    comment: "AC servicing was very professional. They cleaned everything and checked for gas leaks too. Very satisfied.",
    image: "https://ui-avatars.com/api/?name=Rahul+Rao&background=3b82f6&color=fff"
  },
  {
    id: 3,
    name: "Amit Kumar",
    date: "15/02/2026",
    rating: 4,
    comment: "The cleaning team did a great job with the deep cleaning of my kitchen. It looks brand new now.",
    image: "https://ui-avatars.com/api/?name=Amit+Kumar&background=f59e0b&color=fff"
  },
  {
    id: 4,
    name: "Sandeep Saini",
    date: "10/01/2026",
    rating: 5,
    comment: "Best platform for local experts. I booked an electrician for wiring work and he was very skilled.",
    image: "https://ui-avatars.com/api/?name=Sandeep+Saini&background=ef4444&color=fff"
  }
];

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
  const reviewScrollRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size for responsive background
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === sliderImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
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
      const scrollAmount = window.innerWidth < 640 ? 220 : 350;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const scrollReview = (direction) => {
    if (reviewScrollRef.current) {
      const scrollAmount = window.innerWidth < 640 ? 280 : 380;
      reviewScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Different images for different screen sizes
  const desktopBgImage = "https://res.cloudinary.com/djtvxmttf/image/upload/v1778416255/ChatGPT_Image_May_10_2026_05_59_03_PM_fmuelr.png";
  const mobileBgImage = "https://res.cloudinary.com/dfqsa6hoc/image/upload/v1778677612/l0_pebpwe.png";

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

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Hero Section with Responsive Background */}
      <section
        className="relative pt-8 pb-20 md:pt-32 md:pb-32 px-5 sm:px-6 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('${isMobile ? mobileBgImage : desktopBgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: isMobile ? '70vh' : 'auto'
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 z-0"></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center relative z-10 gap-8">
          <div className="md:w-1/2 text-white space-y-5 md:space-y-6 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
              Expert Professional
              <br className="hidden sm:block" /> 
              Home Services,
              <br />
              Book Online
            </h1>
            <p className="text-base md:text-lg opacity-90 max-w-md mx-auto md:mx-0">
              Service On Wheel helps you live smarter, giving you time to focus on what's most important.
            </p>
            <button className="bg-white text-gray-800 px-6 py-2.5 md:px-8 md:py-3 rounded-md font-semibold hover:bg-gray-100 transition shadow-lg active:scale-95 tap-feedback">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Image Slider - Uncommented and working */}
      {/* <section className="relative -mt-20 sm:-mt-32 md:-mt-0 lg:-mt-72 px-4 sm:px-6 z-20">
        <div className="max-w-6xl mx-auto relative group">
          <div className="overflow-hidden rounded-xl md:rounded-2xl shadow-xl aspect-video md:aspect-[21/9]">
            <div className="flex transition-transform duration-700 ease-in-out h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {sliderImages.map((img, idx) => (
                <img key={idx} src={img} alt={`Slide ${idx}`} className="w-full h-full object-cover shrink-0" loading="lazy" />
              ))}
            </div>
          </div>
          <button
            onClick={() => setCurrentSlide(prev => (prev === 0 ? sliderImages.length - 1 : prev - 1))}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-white transition-all opacity-70 group-hover:opacity-100 tap-feedback"
          >
            ❮
          </button>
          <button
            onClick={() => setCurrentSlide(prev => (prev === sliderImages.length - 1 ? 0 : prev + 1))}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-white transition-all opacity-70 group-hover:opacity-100 tap-feedback"
          >
            ❯
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {sliderImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all w-2 h-2 rounded-full ${currentSlide === idx ? 'bg-white w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </section> */}

      {/* Categories Slider (Dynamic from API) */}
      <section className="relative mt-6 sm:mt-4 px-4 sm:px-6 pb-10 md:pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={() => scrollCategory('left')} className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-100 text-slate-600 hover:bg-emerald-50 active:scale-95 transition-all tap-feedback">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div ref={categoryScrollRef} className="flex flex-1 items-start gap-4 sm:gap-6 md:gap-10 overflow-x-auto no-scrollbar horizontal-scroll py-3">
                {categoriesLoading ? (
                  // Skeleton loaders
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="flex flex-col items-center min-w-[80px] sm:min-w-[100px] md:min-w-[120px]">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-2xl animate-pulse"></div>
                      <div className="w-12 h-3 bg-gray-200 rounded mt-2 animate-pulse"></div>
                    </div>
                  ))
                ) : (
                  categories.map((cat) => (
                    <Link to={`/category/${cat.slug}`} key={cat._id} className="flex flex-col items-center min-w-[80px] sm:min-w-[100px] md:min-w-[120px] group cursor-pointer tap-feedback">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl mb-2 sm:mb-4 group-hover:bg-white group-hover:shadow-lg transition-all duration-300">
                        {cat.icon?.url ? <img src={cat.icon.url} alt={cat.name} className="w-10 h-10 object-contain" /> : cat.name.charAt(0)}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-slate-600 text-center group-hover:text-emerald-600 transition-colors whitespace-nowrap">
                        {cat.name}
                      </span>
                    </Link>
                  ))
                )}
              </div>
              <button onClick={() => scrollCategory('right')} className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-100 text-slate-600 hover:bg-emerald-50 active:scale-95 transition-all tap-feedback">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      {featuredServices.length > 0 && (
        <section className="py-12 md:py-20 px-5 sm:px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2">Featured Services</h2>
                <p className="text-slate-500 italic text-sm md:text-base">Most popular services chosen by our customers</p>
              </div>
              <Link to="/services" className="flex items-center gap-2 text-slate-800 font-semibold hover:text-emerald-600 transition-all group whitespace-nowrap text-sm md:text-base">
                View All Services
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
              {featuredServices.map(service => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Services Section */}
      {popularServices.length > 0 && (
        <section className="py-12 md:py-20 px-5 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2">Popular Services</h2>
                <p className="text-slate-500 italic text-sm md:text-base">Trending now – booked by thousands</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
              {popularServices.map(service => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works section */}
      <section className="py-14 md:py-20 px-5 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 md:mb-16 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">How it works</h2>
            <p className="text-slate-500">3 simple steps to Ghar Seva freedom</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-start relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-white rounded-2xl shadow-lg p-3 flex items-center justify-center border border-gray-50">
                <img src="https://img.icons8.com/color/96/appointment-reminders--v1.png" alt="Step 1" className="w-16 sm:w-20" />
              </div>
              <div>
                <span className="text-emerald-600 font-bold text-sm block mb-1">Step 1</span>
                <h4 className="text-lg sm:text-xl font-bold text-slate-800">Book Online or Phone</h4>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-white rounded-2xl shadow-lg p-3 flex items-center justify-center border border-gray-50">
                <img src="https://img.icons8.com/color/96/smartphone--v1.png" alt="Step 2" className="w-16 sm:w-20" />
              </div>
              <div>
                <span className="text-emerald-600 font-bold text-sm block mb-1">Step 2</span>
                <h4 className="text-lg sm:text-xl font-bold text-slate-800">Get Booking Details Via SMS</h4>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-white rounded-2xl shadow-lg p-3 flex items-center justify-center border border-gray-50">
                <img src="https://img.icons8.com/color/96/money-transfer.png" alt="Step 3" className="w-16 sm:w-20" />
              </div>
              <div>
                <span className="text-emerald-600 font-bold text-sm block mb-1">Step 3</span>
                <h4 className="text-lg sm:text-xl font-bold text-slate-800">Pay After Work is Done</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
         <InfiniteReviewsMarquee/>

    
      

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




























