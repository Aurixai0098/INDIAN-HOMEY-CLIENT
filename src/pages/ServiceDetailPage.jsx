import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchServiceBySlug, fetchCategories } from '../services/api';
import { useCart } from '../context/CartContext';

import {
  ShoppingCart, Check, Star, Clock, ShieldCheck, Truck, ChevronRight,
  ChevronLeft, ChevronDown, Heart, Share2, MapPin, Award, Users,
  Sparkles, X, ImageIcon, ArrowRight, Home, Tag, MessageCircle, Zap, BookOpen,
  ChevronUp, Loader2
} from 'lucide-react';

// Shimmer Skeleton (same as before)
const ShimmerSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 bg-slate-200 rounded-lg w-64"></div>
    <div className="grid md:grid-cols-2 gap-6">
      <div className="aspect-video bg-slate-200 rounded-2xl"></div>
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded-lg w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded-lg w-full"></div>
        <div className="h-4 bg-slate-200 rounded-lg w-2/3"></div>
        <div className="h-12 bg-slate-200 rounded-xl w-40"></div>
      </div>
    </div>
  </div>
);

// Image Gallery (unchanged)
const ImageGallery = ({ images, name }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 group cursor-pointer" onClick={() => setLightboxOpen(true)}>
        <img
          src={images[currentIndex].url}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </>
        )}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all
                ${currentIndex === idx ? 'border-emerald-500 shadow-md' : 'border-transparent hover:border-slate-300'}`}
            >
              <img src={img.url} alt={`${name} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <img
            src={images[currentIndex].url}
            alt={name}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1); }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-white text-sm font-medium">{currentIndex + 1} / {images.length}</span>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1); }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Accordion Component (unchanged)
const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-slate-800">{title}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
};

// Review Card (single column - full width)
const ReviewCard = ({ review }) => {
  const customerName = review.customer?.fullName || review.customer?.firstName || 'Anonymous';
  const customerAvatar = review.customer?.avatar?.url;
  const rating = review.rating?.overall || 0;
  const comment = review.comment;
  const date = review.createdAt;
  const title = review.title;

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {customerAvatar ? (
            <img src={customerAvatar} alt={customerName} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {customerName[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-800 text-sm">{customerName}</p>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
              ))}
            </div>
          </div>
        </div>
        <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
      {title && <h4 className="font-medium text-slate-800 mb-1">{title}</h4>}
      <p className="text-sm text-slate-600 leading-relaxed">{comment}</p>
    </div>
  );
};

// Reviews Modal Component (paginated, one review per row)
const ReviewsModal = ({ reviews, onClose }) => {
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 10, reviews.length));
      setLoading(false);
    }, 300);
  };

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  return (
    <div className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-slate-800">All Reviews</h2>
            <p className="text-sm text-slate-500">{reviews.length} customer {reviews.length === 1 ? 'review' : 'reviews'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Reviews List - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {visibleReviews.map((review, idx) => (
            <ReviewCard key={idx} review={review} />
          ))}
          
          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                {loading ? 'Loading...' : `Load more (${reviews.length - visibleCount} remaining)`}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-400">
          Showing {visibleCount} of {reviews.length} reviews
        </div>
      </div>
    </div>
  );
};

// Related Service Card
const RelatedCard = ({ service }) => (
  <Link to={`/service/${service.slug}`} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
    <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
      <img
        src={service.images?.[0]?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.name)}&background=random&size=400`}
        alt={service.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-800">
        ₹{service.basePrice}
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">{service.name}</h3>
      <div className="flex items-center gap-2 mt-2">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-medium text-slate-600">{service.rating?.average || '4.5'}</span>
        </div>
        <span className="text-slate-300">|</span>
        <span className="text-xs text-slate-500">{service.bookingsCount || '0'}+ bookings</span>
      </div>
    </div>
  </Link>
);

// Sidebar Category Item
const CategoryItem = ({ cat, isActive }) => (
  <Link
    to={`/category/${cat.slug}`}
    className={`flex items-center gap-3 px-4 py-3.5 transition-all duration-200 group
      ${isActive
        ? 'bg-gradient-to-r from-emerald-50 to-white text-emerald-700 font-semibold'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
      ${isActive
        ? 'bg-emerald-100 text-emerald-600 shadow-sm'
        : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-sm'
      }`}
    >
      {cat.icon?.url ? (
        <img src={cat.icon.url} alt={cat.name} className="w-5 h-5 object-contain" />
      ) : (
        <Tag className="w-4 h-4" />
      )}
    </div>
    <span className="text-sm">{cat.name}</span>
    {isActive && <ChevronRight className="w-4 h-4 text-emerald-500 ml-auto" />}
  </Link>
);

// Main ServiceDetailPage Component
const ServiceDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [service, setService] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSidebar, setLoadingSidebar] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const loadService = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchServiceBySlug(slug);
      if (res.success && res.data.service) {
        setService(res.data.service);
        setRelatedServices(res.data.relatedServices || []);
        setReviews(res.data.reviews || []);
      } else {
        setError('Service not found');
      }
    } catch (err) {
      console.error('Error loading service:', err);
      setError(err.message || 'Failed to load service');
    } finally {
      setLoading(false);
    }
  };

  const loadAllCategories = async () => {
    setLoadingSidebar(true);
    try {
      const res = await fetchCategories();
      if (res.success) setAllCategories(res.data.categories || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoadingSidebar(false);
    }
  };

  useEffect(() => {
    loadService();
    loadAllCategories();
  }, [slug]);

  const handleAddToCart = () => {
    addToCart(service);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBookNow = () => {
    addToCart(service);
    navigate('/cart');
  };

  if (loading) return <ShimmerSkeleton />;

  if (error || !service) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="w-12 h-12 text-slate-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-3">Service Not Found</h1>
          <p className="text-slate-500 mb-8">{error || 'The service you are looking for does not exist or has been removed.'}</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 font-medium">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const avgRating = service.rating?.average || 0;
  const reviewCount = service.rating?.count || reviews.length || 0;
  const displayReviews = reviews.length > 0 ? reviews : [];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
              <Home className="w-3.5 h-3.5" /> Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/category/${service.category?.slug}`} className="hover:text-emerald-600 transition-colors">
              {service.category?.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 font-medium">{service.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-8">
            {/* Hero Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-6">
                  <ImageGallery images={service.images} name={service.name} />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center border-l border-slate-100">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">{service.name}</h1>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => setLiked(!liked)} className={`p-2.5 rounded-xl transition-all ${liked ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                        <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
                      </button>
                      <button className="p-2.5 bg-slate-100 text-slate-400 hover:bg-slate-200 rounded-xl transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-amber-700">{avgRating.toFixed(1)}</span>
                      <span className="text-amber-600 text-sm">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{service.bookingsCount || '0'}+ bookings</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Same day service</span>
                    </div>
                  </div>

                  <p className="text-slate-600 leading-relaxed mb-6">{service.description}</p>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Provider
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-200">
                      <Truck className="w-3.5 h-3.5" /> Free Cancellation
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg border border-purple-200">
                      <Award className="w-3.5 h-3.5" /> Best Price
                    </span>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        ₹{service.basePrice}
                      </span>
                      <span className="text-slate-400 text-sm">/{service.priceUnit?.replace('_', ' ') || 'service'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleAddToCart}
                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg flex-1
                          ${added
                            ? 'bg-emerald-500 text-white shadow-emerald-500/30 scale-[0.98]'
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95'
                          }`}
                      >
                        {added ? <><Check className="w-5 h-5 animate-bounce" /> Added to Cart!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
                      </button>
                      <button
                        onClick={handleBookNow}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 flex-1"
                      >
                        <BookOpen className="w-5 h-5" /> Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Accordions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {service.includes && service.includes.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-slate-800">What's Included</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {service.includes.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {service.excludes && service.excludes.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <X className="w-4 h-4 text-red-500" />
                    </div>
                    <h3 className="font-bold text-slate-800">Exclusions</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {service.excludes.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {service.requirements && service.requirements.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-slate-800">Requirements</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {service.requirements.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Reviews Section - with "View all" modal trigger */}
            {displayReviews.length > 0 ? (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Customer Reviews</h2>
                    <p className="text-slate-500 text-sm mt-1">{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'} from verified customers</p>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-amber-700">{avgRating.toFixed(1)}</span>
                  </div>
                </div>
                
                {/* Show first 4 reviews (one per row) */}
                <div className="space-y-4">
                  {displayReviews.slice(0, 4).map((review, idx) => (
                    <ReviewCard key={idx} review={review} />
                  ))}
                </div>
                
                {displayReviews.length > 4 && (
                  <button
                    onClick={() => setShowAllReviews(true)}
                    className="w-full mt-6 py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                  >
                    View all {displayReviews.length} reviews
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 text-center">
                <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-700">No reviews yet</h3>
                <p className="text-slate-500 text-sm">Be the first to review this service after booking.</p>
              </div>
            )}

            {/* Related Services */}
            {relatedServices.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">You might also like</h2>
                  <Link to={`/category/${service.category?.slug}`} className="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1 transition-colors">
                    View all <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {relatedServices.map(rel => <RelatedCard key={rel._id} service={rel} />)}
                </div>
              </div>
            )}
          </main>

          {/* Sidebar (unchanged) */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-6 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-500">Price</span>
                  <span className="text-2xl font-bold text-slate-800">₹{service.basePrice}</span>
                </div>
                <button
                  onClick={handleAddToCart}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg
                    ${added ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 hover:shadow-xl active:scale-95'}`}
                >
                  {added ? <><Check className="w-5 h-5" /> Added!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
                </button>
                <button
                  onClick={handleBookNow}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20 hover:shadow-xl active:scale-95"
                >
                  <BookOpen className="w-5 h-5" /> Book Now
                </button>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure payment</div>
                  <div className="flex items-center gap-2 text-xs text-slate-500"><Truck className="w-3.5 h-3.5 text-blue-500" /> Free cancellation</div>
                  <div className="flex items-center gap-2 text-xs text-slate-500"><Clock className="w-3.5 h-3.5 text-amber-500" /> Same day service</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h2 className="font-bold text-slate-800 flex items-center gap-2"><Tag className="w-4 h-4 text-emerald-600" /> Categories</h2>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {loadingSidebar ? (
                    <div className="p-4 space-y-3">{/* skeletons */}</div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {allCategories.map(cat => <CategoryItem key={cat._id} cat={cat} isActive={cat._id === service.category?._id} />)}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20">
                <div className="flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5 text-emerald-200" /><span className="font-bold text-sm">First Booking Offer</span></div>
                <p className="text-emerald-100 text-sm mb-3">Get 15% off on your first service booking!</p>
                <button className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">Book Now</button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Reviews Modal */}
      {showAllReviews && (
        <ReviewsModal reviews={displayReviews} onClose={() => setShowAllReviews(false)} />
      )}
    </div>
  );
};

export default ServiceDetailPage;