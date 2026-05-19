// src/pages/Home.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories, fetchFeaturedServices, fetchPopularServices, fetchFeaturedProviders, fetchFeaturedReviews } from '../services/api';
import { ShieldCheck, Star } from 'lucide-react';

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
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [featuredReviews, setFeaturedReviews] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, featuredRes, popularRes, providersRes, reviewsRes] = await Promise.all([
        fetchCategories(),
        fetchFeaturedServices(),
        fetchPopularServices(),
        fetchFeaturedProviders(10), // Limit to 10 best providers
        fetchFeaturedReviews(10)    // Limit to 10 best reviews
      ]);
      if (categoriesRes.success) setCategories(categoriesRes.data.categories);
      if (featuredRes.success) setFeaturedServices(featuredRes.data.services);
      if (popularRes.success) setPopularServices(popularRes.data.services);
      if (providersRes.success) setFeaturedProviders(providersRes.data.providers || []);
      if (reviewsRes.success) setFeaturedReviews(reviewsRes.data.reviews || []);
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

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Hero Section */}
      <section
        className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat flex items-center"
        style={{
          backgroundImage: `url('${isMobile ? mobileBgImage : desktopBgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: isMobile ? 'calc(100vh - 60px)' : 'calc(100vh - 80px)',
          height: 'auto'
        }}
      >
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full py-12 md:py-16">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6"><h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg tracking-tight">INDIAN HOMEY</h1></div>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg mb-4">Expert Professional<br/>Home Services,<br/>Book Online</h2>
              <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto mt-4 drop-shadow">Service On Wheel helps you live smarter, giving you time to focus on what's most important.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/services" className="inline-flex items-center justify-center px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">Book Now</Link>
                <Link to="/providers" className="inline-flex items-center justify-center px-8 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold rounded-full transition-all border border-white/30">Find Professionals</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Slider */}
      <section className="py-8 md:py-12 px-4 sm:px-6 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => scrollCategory('left')} className="shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-slate-600 hover:bg-gray-200 active:scale-95 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <div ref={categoryScrollRef} className="flex flex-1 items-center gap-6 md:gap-8 overflow-x-auto no-scrollbar horizontal-scroll py-4">
                {categories.map((cat) => (
                  <Link to={`/category/${cat.slug}`} key={cat._id} className="flex flex-col items-center min-w-[90px] sm:min-w-[110px] group cursor-pointer tap-feedback transition-all duration-300 hover:-translate-y-1">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:bg-emerald-50">
                      {cat.icon?.url ? <img src={cat.icon.url} alt={cat.name} className="w-12 h-12 object-contain" /> : <span className="text-3xl text-gray-400">{cat.name.charAt(0)}</span>}
                    </div>
                    <span className="text-sm sm:text-base font-medium text-gray-700 text-center mt-3 group-hover:text-emerald-600 whitespace-nowrap">{cat.name}</span>
                  </Link>
                ))}
            </div>
            <button onClick={() => scrollCategory('right')} className="shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-slate-600 hover:bg-gray-200 active:scale-95 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      {featuredServices.length > 0 && (
        <section className="py-12 md:py-16 px-4 sm:px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
              <div><h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-2">Featured Services</h2></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 md:gap-6">
              {featuredServices.slice(0, 8).map(service => <ServiceCard key={service._id} service={service} />)}
            </div>
          </div>
        </section>
      )}

      {/* Popular Services Section */}
      {popularServices.length > 0 && (
        <section className="py-12 md:py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
              <div><h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-2">Popular Services</h2></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 md:gap-6">
              {popularServices.slice(0, 8).map(service => <ServiceCard key={service._id} service={service} />)}
            </div>
          </div>
        </section>
      )}

      {/* REAL PROVIDERS SCROLLING MARQUEE (Top Tier Providers) */}
      {featuredProviders.length > 0 && (
        <section className="py-10 bg-slate-50 border-t border-slate-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 text-center">Top Rated Professionals</h2>
          </div>
          <div className="relative flex overflow-x-hidden bg-slate-50 group">
            <div className="animate-marquee flex whitespace-nowrap gap-6 py-4 px-4 items-center group-hover:paused">
              {/* Duplicate array mapping for smooth seamless scroll */}
              {[...featuredProviders, ...featuredProviders].map((provider, idx) => {
                const stats = provider.stats || {};
                const name = provider.businessName || `${provider.user?.firstName} ${provider.user?.lastName}`;
                return (
                  <div key={`${provider._id}-${idx}`} className="flex items-center gap-6 bg-gradient-to-r from-[#109b59] to-[#0d8c4f] text-white py-4 px-6 rounded-2xl min-w-max shadow-xl border border-[#16b576] hover:-translate-y-1 transition-transform cursor-pointer">
                    
                    {/* Avatar & Name */}
                    <div className="flex items-center gap-4 min-w-[280px]">
                      <img src={provider.user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ffffff&color=0f9d58`} alt={name} className="w-16 h-16 rounded-full object-cover border-2 border-white/30 shadow-sm" />
                      <div>
                        <h3 className="font-bold text-lg leading-tight tracking-wide">{name}</h3>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="flex items-center">
                            {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(stats.ratingAvg || 5) ? 'text-amber-400 fill-amber-400' : 'text-white/30'}`} />)}
                          </div>
                          <span className="text-sm font-semibold">{stats.ratingAvg?.toFixed(1) || '5.0'}</span>
                          <span className="text-xs text-emerald-100">({stats.ratingCount || 0} reviews)</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="bg-emerald-500/80 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide border border-emerald-400/50">Available</span>
                          <span className="flex items-center gap-1 border border-white/40 bg-white/10 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3"/> Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats columns */}
                    <div className="flex items-center gap-8 pl-6 border-l border-white/20">
                      <div className="text-center flex flex-col items-center">
                          <span className="text-2xl font-bold">{stats.completedJobs || 0}</span>
                          <span className="text-[11px] font-medium text-emerald-100 mt-0.5 tracking-wide">Completed Jobs</span>
                      </div>
                      <div className="text-center flex flex-col items-center">
                          <span className="text-2xl font-bold">₹{(stats.totalEarnings || 0).toLocaleString('en-IN')}</span>
                          <span className="text-[11px] font-medium text-emerald-100 mt-0.5 tracking-wide">Total Earnings</span>
                      </div>
                      <div className="text-center flex flex-col items-center">
                          <span className="text-2xl font-bold">{provider.experience || 1}+</span>
                          <span className="text-[11px] font-medium text-emerald-100 mt-0.5 tracking-wide">Years Exp.</span>
                      </div>
                      <div className="text-center flex flex-col items-center">
                          <span className="text-2xl font-bold">₹{(stats.walletBalance || 0).toLocaleString('en-IN')}</span>
                          <span className="text-[11px] font-medium text-emerald-100 mt-0.5 tracking-wide">Wallet Balance</span>
                          <span className="text-[10px] text-emerald-200 mt-1 opacity-80">Withdrawn: ₹{(stats.withdrawn || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* REAL CUSTOMER REVIEWS SCROLLING MARQUEE */}
      {featuredReviews.length > 0 && (
        <section className="py-10 bg-white overflow-hidden pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 text-center">What Our Customers Say</h2>
          </div>
          <div className="relative flex overflow-x-hidden bg-white group">
            <div className="animate-marquee flex whitespace-nowrap gap-6 py-4 px-4 items-center group-hover:paused" style={{ animationDirection: 'reverse' }}>
              {[...featuredReviews, ...featuredReviews].map((review, idx) => {
                const customerName = review.customer?.firstName ? `${review.customer.firstName} ${review.customer.lastName || ''}` : 'Verified Customer';
                return (
                  <div key={`review-${review._id}-${idx}`} className="bg-slate-50 border border-slate-100 p-6 rounded-2xl min-w-[350px] max-w-[350px] shadow-sm hover:shadow-md transition-shadow whitespace-normal cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={review.customer?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}`} alt="User" className="w-12 h-12 rounded-full border border-slate-200" />
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{customerName}</h4>
                        <div className="flex items-center text-amber-400 mt-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating?.overall ? 'fill-amber-400' : 'text-slate-300'}`} />)}
                        </div>
                      </div>
                    </div>
                    {review.title && <h5 className="font-semibold text-slate-800 text-sm mb-1">{review.title}</h5>}
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 italic">"{review.comment}"</p>
                    {review.service && <div className="mt-3 text-xs font-semibold text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded">Service: {review.service.name}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Global Styles for Animations */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .horizontal-scroll { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory; }
        .horizontal-scroll > * { scroll-snap-align: start; }
        .tap-feedback { cursor: pointer; -webkit-tap-highlight-color: transparent; }
        .tap-feedback:active { transform: scale(0.96); transition: transform 0.08s linear; }

        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .paused {
          animation-play-state: paused !important;
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(calc(-50% - 0.75rem)); }
        }
      `}</style>
    </div>
  );
}