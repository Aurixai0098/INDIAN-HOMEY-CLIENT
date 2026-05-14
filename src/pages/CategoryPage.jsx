 
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchCategoryBySlug, fetchCategories } from '../services/api';
import { useCart } from '../context/CartContext';

// Modern Lucide Icons (install: npm install lucide-react)
import {
  ShoppingCart,
  Check,
  Search,
  Filter,
  ChevronRight,
  Star,
  Clock,
  MapPin,
  ArrowLeft,
  Sparkles,
  PackageOpen,
  Tag,
  TrendingUp,
  Grid3X3,
  LayoutList,
  SlidersHorizontal,
  Heart,
  Home
} from 'lucide-react';

// ─── Shimmer Loading Skeleton ─────────────────────────────────────
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
    <div className="p-4 space-y-3">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
          <div className="h-4 bg-slate-200 rounded-lg flex-1"></div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Helper to safely get rating value ─────────────────────────────
const getRating = (service) => {
  if (!service.rating) return '4.8';
  if (typeof service.rating === 'object') {
    return service.rating.average?.toString() || '4.8';
  }
  return service.rating?.toString() || '4.8';
};

const getRatingCount = (service) => {
  if (!service.rating) return '0';
  if (typeof service.rating === 'object') {
    return service.rating.count?.toString() || '0';
  }
  return '0';
};

// ─── Service Card Component ─────────────────────────────────────────
const ServiceCard = ({ service, onAddToCart, viewMode }) => {
  const [added, setAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(service);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const gradients = [
    'from-rose-400 to-orange-300',
    'from-emerald-400 to-teal-300',
    'from-blue-400 to-indigo-300',
    'from-violet-400 to-purple-300',
    'from-amber-400 to-yellow-300',
    'from-cyan-400 to-blue-300',
  ];
  const gradientIndex = service.name?.length % gradients.length || 0;
  const fallbackGradient = gradients[gradientIndex];

  const ratingValue = getRating(service);
  const ratingCount = getRatingCount(service);

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
                  className={`p-1.5 rounded-lg transition-colors ${liked ? 'text-red-500' : 'text-slate-300 hover:text-red-400'}`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
                </button>
              </div>
              <p className="text-slate-500 text-sm mt-1 line-clamp-2">{service.shortDescription || service.description?.substring(0, 120)}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-medium text-slate-600">{ratingValue}</span>
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
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  ₹{service.basePrice}
                </span>
                <span className="text-slate-400 text-sm ml-1">/{service.priceUnit?.replace('_', ' ') || 'service'}</span>
              </div>
              <button
                onClick={handleAdd}
                disabled={added}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg flex items-center gap-2
                  ${added
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95'
                  }`}
              >
                {added ? <><Check className="w-4 h-4" /> Added</> : <><ShoppingCart className="w-4 h-4" /> Add</>}
              </button>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/service/${service.slug}`} className="block">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2">
          {/* Image */}
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
              {ratingValue}
            </div>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
              className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg ${liked ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-400 hover:text-red-500'}`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-bold text-lg text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">{service.name}</h3>
            <p className="text-slate-500 text-sm mb-3 line-clamp-2 leading-relaxed">{service.shortDescription || service.description?.substring(0, 100)}</p>
            {service.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {service.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">{tag}</span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">₹{service.basePrice}</span>
                <span className="text-slate-400 text-sm ml-1">/{service.priceUnit?.replace('_', ' ') || 'service'}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Floating Add Button */}
      <div className="px-5 pb-5 -mt-2">
        <button
          onClick={handleAdd}
          disabled={added}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all shadow-lg flex items-center justify-center gap-2
            ${added
              ? 'bg-emerald-500 text-white shadow-emerald-500/30 scale-[0.98]'
              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]'
            }`}
        >
          {added ? <><Check className="w-4 h-4 animate-bounce" /> Added to Cart</> : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────
const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSidebar, setLoadingSidebar] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const loadCategory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCategoryBySlug(slug);
      if (res.success) {
        setCategory(res.data.category);
        setServices(res.data.services || []);
      } else {
        setError('Category not found');
        setCategory(null);
        setServices([]);
      }
    } catch (err) {
      console.error('Error loading category:', err);
      setError(err.message || 'Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const loadAllCategories = async () => {
    setLoadingSidebar(true);
    try {
      const res = await fetchCategories();
      if (res.success) {
        setAllCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoadingSidebar(false);
    }
  };

  useEffect(() => {
    loadCategory();
    loadAllCategories();
    window.scrollTo(0, 0);
  }, [slug]);

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
      if (sortBy === 'rating') return (parseFloat(getRating(b)) || 0) - (parseFloat(getRating(a)) || 0);
      if (sortBy === 'popular') return (b.bookingsCount || 0) - (a.bookingsCount || 0);
      return 0;
    });

  // ─── Loading State ────────────────────────────────────────────────
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

  // ─── Error State ──────────────────────────────────────────────────
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
      {/* ═══ HERO BANNER ═══ */}
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

          <div className="flex flex-col md:flex-row items-center gap-8">
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
              <div className="flex items-center justify-center md:justify-start gap-6 mt-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <PackageOpen className="w-4 h-4 text-emerald-400" />
                  <span>{services.length} Services</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>4.8 avg rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>Available in your area</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 33.3C840 37 960 43 1080 45C1200 47 1320 45 1380 44L1440 43V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ─── LEFT SIDEBAR ─── */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-6 space-y-6">
              {/* Search */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Price Filter */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  Price Range
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">₹{priceRange[0]}</span>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="flex-1 accent-emerald-500"
                    />
                    <span className="text-sm text-slate-500">₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    Categories
                  </h2>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {loadingSidebar ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse"></div>)}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {allCategories.map(cat => {
                        const isActive = cat.slug === slug;
                        return (
                          <Link
                            key={cat._id}
                            to={`/category/${cat.slug}`}
                            className={`flex items-center gap-3 px-4 py-3.5 transition-all duration-200 group
                              ${isActive
                                ? 'bg-gradient-to-r from-emerald-50 to-white text-emerald-700 font-semibold'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
                              ${isActive ? 'bg-emerald-100 text-emerald-600 shadow-sm' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-sm'}`}>
                              {cat.icon?.url ? (
                                <img src={cat.icon.url} alt={cat.name} className="w-5 h-5 object-contain" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                            </div>
                            <span className="text-sm flex-1">{cat.name}</span>
                            {isActive && <ChevronRight className="w-4 h-4 text-emerald-500" />}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Promo */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-emerald-200" />
                  <span className="font-bold text-sm">New User Offer</span>
                </div>
                <p className="text-emerald-100 text-sm mb-3">Get 20% off on your first booking!</p>
                <button className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white text-sm font-medium py-2 rounded-xl transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          </aside>

          {/* ─── MAIN CONTENT AREA ─── */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                  {filteredServices.length} {filteredServices.length === 1 ? 'Service' : 'Services'}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {searchQuery ? `Showing results for "${searchQuery}"` : 'Choose the best service for your needs'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer shadow-sm"
                  >
                    <option value="default">Sort by: Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popular">Most Popular</option>
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Services */}
            {filteredServices.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  {searchQuery ? 'No matching services' : 'No services yet'}
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  {searchQuery
                    ? `We couldn't find any services matching "${searchQuery}". Try a different search term.`
                    : 'We are adding services in this category soon. Check back later!'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-6 text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7"
                : "space-y-4"
              }>
                {filteredServices.map(service => (
                  <ServiceCard key={service._id} service={service} onAddToCart={addToCart} viewMode={viewMode} />
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
 
