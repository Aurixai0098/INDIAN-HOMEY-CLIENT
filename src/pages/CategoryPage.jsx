import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchCategoryBySlug } from '../services/api';
import { useCart } from '../context/CartContext';

import {
  ShoppingCart, Check, Search, Filter, ChevronRight, Star, Clock,
  MapPin, ArrowLeft, Sparkles, PackageOpen, TrendingUp,
  Grid3X3, LayoutList, SlidersHorizontal, Heart, Home, BookOpen
} from 'lucide-react';

// Shimmer Loading Skeleton
const ShimmerCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-slate-200"></div>
    <div className="p-4 space-y-3">
      <div className="h-5 bg-slate-200 rounded-lg w-3/4"></div>
      <div className="h-4 bg-slate-200 rounded-lg w-full"></div>
      <div className="h-4 bg-slate-200 rounded-lg w-2/3"></div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-7 bg-slate-200 rounded-lg w-20"></div>
        <div className="h-9 bg-slate-200 rounded-xl w-28"></div>
      </div>
    </div>
  </div>
);

const ShimmerSidebar = () => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
    <div className="p-4 border-b border-slate-100 bg-slate-50 h-12"></div>
    <div className="p-4 space-y-4">
      <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
      <div className="h-20 bg-slate-200 rounded-xl w-full"></div>
    </div>
  </div>
);

// Helper to get rating
const getRating = (service) => {
  if (!service.rating) return 0;
  if (typeof service.rating === 'object') {
    return service.rating.average || 0;
  }
  return Number(service.rating) || 0;
};

const getRatingCount = (service) => {
  if (!service.rating) return 0;
  if (typeof service.rating === 'object') {
    return service.rating.count || 0;
  }
  return 0;
};

// Service Card Component with Book Now button
const ServiceCard = ({ service, onAddToCart, onBookNow, viewMode }) => {
  const [added, setAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const ratingValue = getRating(service);
  const ratingCount = getRatingCount(service);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(service);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBookNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onBookNow(service);
  };

  const gradients = [
    'from-rose-400 to-orange-300', 'from-emerald-400 to-teal-300',
    'from-blue-400 to-indigo-300', 'from-violet-400 to-purple-300',
    'from-amber-400 to-yellow-300', 'from-cyan-400 to-blue-300',
  ];
  const gradientIndex = service.name?.length % gradients.length || 0;
  const fallbackGradient = gradients[gradientIndex];

  // List View
  if (viewMode === 'list') {
    return (
      <div
        className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/service/${service.slug}`} className="flex flex-col sm:flex-row">
          <div className="sm:w-48 md:w-56 aspect-[4/3] sm:aspect-square bg-slate-100 relative overflow-hidden flex-shrink-0">
            {!imageLoaded && (
              <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient} opacity-30 animate-pulse`} />
            )}
            <img
              src={service.images?.[0]?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.name)}&background=random&size=400`}
              alt={service.name}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${isHovered ? 'scale-110' : 'scale-100'}`}
            />
            {service.isPopular && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Popular
              </div>
            )}
          </div>
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-600 transition-colors">{service.name}</h3>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
                  className={`p-1.5 rounded-lg transition-colors ${liked ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
                </button>
              </div>
              <p className="text-slate-500 text-sm mt-2 line-clamp-2">{service.shortDescription || service.description?.substring(0, 120)}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-medium text-slate-600">{ratingValue.toFixed(1)}</span>
                  <span className="text-xs text-slate-400">({ratingCount})</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Same day</span>
                </div>
                {service.tags?.slice(0, 2).map((tag, idx) => (
                  <span key={idx} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-50">
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  ₹{service.basePrice}
                </span>
                <span className="text-slate-400 text-sm ml-1">/{service.priceUnit?.replace('_', ' ') || 'service'}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBookNow}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  Book Now
                </button>
                <button
                  onClick={handleAdd}
                  disabled={added}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg flex items-center justify-center gap-1.5 active:scale-95
                    ${added
                      ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 hover:shadow-xl'
                    }`}
                >
                  {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  {added ? 'Added' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Grid View
  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/service/${service.slug}`} className="block">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2">
          <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
            {!imageLoaded && (
              <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient} opacity-30 animate-pulse`} />
            )}
            <img
              src={service.images?.[0]?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.name)}&background=random&size=400`}
              alt={service.name}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${isHovered ? 'scale-110' : 'scale-100'}`}
            />
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/90 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Available Now</span>
                </div>
              </div>
            </div>
            {service.isPopular && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Popular
              </div>
            )}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {ratingValue.toFixed(1)}
            </div>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
              className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg ${liked ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-400 hover:text-red-500'}`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-white' : ''}`} />
            </button>
          </div>
          <div className="p-5">
            <h3 className="font-bold text-lg text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">{service.name}</h3>
            <p className="text-slate-500 text-sm mt-1.5 mb-3 line-clamp-2 leading-relaxed">{service.shortDescription || service.description?.substring(0, 100)}</p>
            {service.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {service.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-[11px] bg-slate-50 border border-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md font-medium">{tag}</span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">₹{service.basePrice}</span>
                <span className="text-slate-400 text-sm ml-1">/{service.priceUnit?.replace('_', ' ') || 'service'}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
      {/* Action Buttons floating overlapping the card slightly */}
      <div className="px-5 pb-5 -mt-2 flex gap-2 relative z-10">
        <button
          onClick={handleBookNow}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 flex items-center justify-center gap-1.5"
        >
          <BookOpen className="w-4 h-4" />
          Book
        </button>
        <button
          onClick={handleAdd}
          disabled={added}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg flex items-center justify-center gap-1.5 active:scale-95
            ${added
              ? 'bg-emerald-500 text-white shadow-emerald-500/30'
              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 hover:shadow-xl'
            }`}
        >
          {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          {added ? 'Added' : 'Add'}
        </button>
      </div>
    </div>
  );
};

// Main CategoryPage Component
const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('list');
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const loadCategory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCategoryBySlug(slug);
      if (res.success) {
        setCategory(res.data.category);
        setServices(res.data.services || []);
        setRatingStats(res.data.ratingStats || null);
      } else {
        setError('Category not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategory();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = (service) => addToCart(service);
  const handleBookNow = (service) => {
    addToCart(service);
    navigate('/checkout');
  };

  // Filter & Sort
  const filteredServices = services
    .filter(s => {
      const q = searchQuery.toLowerCase();
      return (s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)) &&
             s.basePrice >= priceRange[0] && s.basePrice <= priceRange[1];
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.basePrice - b.basePrice;
      if (sortBy === 'price-high') return b.basePrice - a.basePrice;
      if (sortBy === 'rating') return (getRating(b) || 0) - (getRating(a) || 0);
      if (sortBy === 'popular') return (b.bookingsCount || 0) - (a.bookingsCount || 0);
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 h-48 md:h-64 animate-pulse"></div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-72 flex-shrink-0"><ShimmerSidebar /></div>
            <div className="flex-1">
              <div className="h-8 bg-slate-200 rounded-lg w-64 mb-6 animate-pulse"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <ShimmerCard key={i} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <PackageOpen className="w-12 h-12 text-slate-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-3">Category Not Found</h1>
          <p className="text-slate-500 mb-8">{error || 'The category you are looking for does not exist or has been removed.'}</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-20">
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-emerald-400 font-medium">{category.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"></div>
                <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl">
                  {category.icon?.url ? (
                    <img src={category.icon.url} alt={category.name} className="w-16 h-16 md:w-20 md:h-20 object-contain" />
                  ) : (
                    <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-emerald-400" />
                  )}
                </div>
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">{category.name}</h1>
                <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">{category.description}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mt-6 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <PackageOpen className="w-4 h-4 text-emerald-400" />
                    <span>{services.length} Services</span>
                  </div>
                  {ratingStats && ratingStats.count > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>{ratingStats.average.toFixed(1)} avg rating</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span>Available in your area</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Breakdown Widget Component (Right Side) */}
            {ratingStats && ratingStats.count > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-xl w-full max-w-md lg:w-[350px] flex-shrink-0 relative overflow-hidden">
                <div className="flex items-center gap-5">
                  {/* Left: Big Rating */}
                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-bold text-white tracking-tighter">{ratingStats.average.toFixed(1)}</span>
                    <div className="flex items-center gap-1 mt-1 mb-1.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-3.5 h-3.5 ${star <= Math.round(ratingStats.average) ? 'text-amber-400 fill-amber-400' : 'text-slate-500 fill-slate-500/30'}`} />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-300 whitespace-nowrap">Based on {ratingStats.count} reviews</span>
                  </div>
                  
                  {/* Right: Bars */}
                  <div className="flex-1 space-y-2 text-xs font-medium text-slate-300">
                    {[
                      { stars: 5, count: ratingStats.five },
                      { stars: 4, count: ratingStats.four },
                      { stars: 3, count: ratingStats.three },
                      { stars: 2, count: ratingStats.two },
                      { stars: 1, count: ratingStats.one }
                    ].map(row => (
                      <div key={row.stars} className="flex items-center gap-2">
                        <span className="w-4 text-right">{row.stars}★</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                            style={{ width: `${(row.count / ratingStats.count) * 100}%` }}
                          ></div>
                        </div>
                        <span className="w-4 text-right">{row.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 33.3C840 37 960 43 1080 45C1200 47 1320 45 1380 44L1440 43V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar (Only Search, Price Filter, Promo) */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-6 space-y-6">
              
              {/* Search Box */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="font-semibold text-slate-800 mb-3 text-sm">Find Service</h3>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search in this category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  Price Filter
                </h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600">₹{priceRange[0]}</div>
                    <div className="text-slate-400 text-sm">-</div>
                    <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600">₹{priceRange[1]}</div>
                  </div>
                </div>
              </div>

              {/* Promotional Banner */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Sparkles className="w-5 h-5 text-emerald-100" />
                    </div>
                    <span className="font-bold tracking-wide">Special Offer</span>
                  </div>
                  <h4 className="text-xl font-bold mb-1">Get 20% Off</h4>
                  <p className="text-emerald-100 text-sm mb-5 leading-relaxed">Book your first service with us and get an instant discount applied.</p>
                  <button className="w-full bg-white text-emerald-700 font-bold py-3 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm active:scale-95">
                    Explore Services
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  <span className="text-emerald-600 mr-2">{filteredServices.length}</span> 
                  {filteredServices.length === 1 ? 'Service' : 'Services'} Available
                </h2>
                {searchQuery && (
                  <p className="text-slate-500 text-sm mt-0.5">Showing results for "{searchQuery}"</p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-9 pr-8 py-2.5 bg-transparent text-sm font-medium text-slate-700 outline-none appearance-none cursor-pointer w-full"
                  >
                    <option value="default">Sort: Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popular">Most Popular</option>
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
                
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {filteredServices.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-8 border-white shadow-sm">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {searchQuery ? 'No matching services found' : 'No services available yet'}
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  {searchQuery
                    ? `We couldn't find anything matching "${searchQuery}" under this category. Try tweaking your search or price range.`
                    : 'We are constantly adding new services. Check back later for updates in this category!'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => {setSearchQuery(''); setPriceRange([0, 10000]);}}
                    className="mt-6 px-6 py-2.5 bg-emerald-50 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"
              }>
                {filteredServices.map(service => (
                  <ServiceCard
                    key={service._id}
                    service={service}
                    onAddToCart={handleAddToCart}
                    onBookNow={handleBookNow}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;