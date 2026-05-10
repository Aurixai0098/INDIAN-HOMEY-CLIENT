import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories, fetchFeaturedServices, fetchPopularServices } from '../services/api';

const sliderImages = [
  "https://www.urbancompany.com/img?bucket=urbanclap-prod&quality=90&format=auto/w_1232,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1778178479978-7aada8.jpeg",
  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1200&h=400&fit=crop"
];

const reviews = [
  { name: "Ridhi Saluja", sector: "Sector 56", comment: "The services have definitely improved from the first time. Preferences are kept as top priority. Thank you for making our lives easier with Ghar Seva!", rating: 5, color: "bg-emerald-500" },
  { name: "Kirti", sector: "Sector 51", comment: "I'd say it was great value for money. The urgency was handled well, without compromising quality. Really satisfied with the experience.", rating: 5, color: "bg-blue-500" },
  { name: "Neha", sector: "Sector 57", comment: "The service was simple and effective. It met my expectations without any hassle. Good overall experience.", rating: 5, color: "bg-orange-500" },
  { name: "Ritika", sector: "Sector 57", comment: "Seamless experience from booking to completion. The staff was courteous, punctual, and did a fantastic job.", rating: 5, color: "bg-red-500" },
  { name: "Sameer", sector: "Sector 52", comment: "Really liked your service, it was smooth, efficient, and just what I needed. Would definitely recommend to others. ✨", rating: 5, color: "bg-teal-500" },
  { name: "Karishma", sector: "Suncity", comment: "Absolutely excellent service! The team was prompt and professional. Would love to use it again.", rating: 5, color: "bg-purple-500" },
];

const ServiceCard = ({ service }) => (
  <div className="group cursor-pointer tap-feedback">
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
  </div>
);

export default function Home() {
  const categoryScrollRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [loading, setLoading] = useState(true);

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
      if (featuredRes.success) setFeaturedServices(featuredRes.data.services);
      if (popularRes.success) setPopularServices(popularRes.data.services);
    } catch (err) {
      console.error("Error loading home data:", err);
    } finally {
      setLoading(false);
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading amazing services...</div>;
  }

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Hero Section - Improved */}
      <section className="relative bg-gradient-to-br from-emerald-600 to-teal-700 pt-8 pb-20 md:pt-12 md:pb-32 px-5 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center relative z-10 gap-8">
          <div className="md:w-1/2 text-white space-y-5 md:space-y-6 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
              Expert Professional <br className="hidden sm:block" /> Home Services, <br /> Book Online
            </h1>
            <p className="text-base md:text-lg opacity-90 max-w-md mx-auto md:mx-0">
              Service On Wheel helps you live smarter, giving you time to focus on what's most important.
            </p>
            <button className="bg-white text-gray-800 px-6 py-2.5 md:px-8 md:py-3 rounded-md font-semibold hover:bg-gray-100 transition shadow-lg active:scale-95 tap-feedback">
              Contact Us
            </button>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img src="https://www.serviceonwheel.com/images/banner-clean.png" alt="Cleaning Service" className="w-64 sm:w-80 md:w-full max-w-md drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Image Slider - Improved */}
      <section className="relative -mt-20 sm:-mt-32 md:-mt-48 lg:-mt-72 px-4 sm:px-6 z-20">
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
      </section>

      {/* Categories Slider - Improved */}
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
                {categories.map((cat) => (
                  <Link to={`/services/category/${cat.slug}`} key={cat._id} className="flex flex-col items-center min-w-[80px] sm:min-w-[100px] md:min-w-[120px] group cursor-pointer tap-feedback">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl mb-2 sm:mb-4 group-hover:bg-white group-hover:shadow-lg transition-all duration-300">
                      {cat.icon?.url ? <img src={cat.icon.url} alt={cat.name} className="w-10 h-10 object-contain" /> : (cat.name.charAt(0))}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-slate-600 text-center group-hover:text-emerald-600 transition-colors whitespace-nowrap">
                      {cat.name}
                    </span>
                  </Link>
                ))}
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

      {/* Featured Services Section - Improved */}
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

      {/* Popular Services Section - Improved */}
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

      {/* How It Works section - Improved */}
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

      {/* REVIEWS SECTION - MATCHING VIDEO (Auto-Scroll Infinite Loop) */}
      <section className="py-20 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Our Customer Reviews</h2>
          <p className="text-slate-500 italic">What our happy clients say about Ghar Seva</p>
        </div>
        
        {/* Row 1: Scrolling Left */}
        <div className="flex overflow-hidden mb-8">
          <div className="flex animate-marquee-left whitespace-nowrap">
            {[...reviews, ...reviews].map((review, i) => (
              <div key={i} className="inline-block w-[300px] md:w-[400px] bg-white rounded-2xl p-6 mx-4 shadow-lg border border-gray-100 whitespace-normal align-top transition-transform hover:scale-105">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <span key={j} className="text-emerald-500 text-lg">★</span>)}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{review.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${review.color || 'bg-emerald-500'} flex items-center justify-center text-white font-bold`}>
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
                    <p className="text-xs text-slate-400">{review.sector}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Scrolling Right */}
        <div className="flex overflow-hidden">
          <div className="flex animate-marquee-right whitespace-nowrap">
            {[...reviews, ...reviews].map((review, i) => (
              <div key={i} className="inline-block w-[300px] md:w-[400px] bg-white rounded-2xl p-6 mx-4 shadow-lg border border-gray-100 whitespace-normal align-top transition-transform hover:scale-105">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <span key={j} className="text-emerald-500 text-lg">★</span>)}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{review.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${review.color || 'bg-emerald-500'} flex items-center justify-center text-white font-bold`}>
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
                    <p className="text-xs text-slate-400">{review.sector}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .horizontal-scroll { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory; }
        .horizontal-scroll > * { scroll-snap-align: start; }
        .tap-feedback { cursor: pointer; -webkit-tap-highlight-color: transparent; }
        .tap-feedback:active { transform: scale(0.96); transition: transform 0.08s linear; }

        /* Animation Styles for Reviews */
        .animate-marquee-left { animation: marquee-left 45s linear infinite; display: flex; width: max-content; }
        .animate-marquee-right { animation: marquee-right 45s linear infinite; display: flex; width: max-content; }
        @keyframes marquee-left { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes marquee-right { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        .animate-marquee-left:hover, .animate-marquee-right:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}