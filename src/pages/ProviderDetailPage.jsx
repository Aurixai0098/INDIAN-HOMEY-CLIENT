// src/pages/ProviderDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProviderDetailsById, fetchProviderReviews } from '../services/api';
import { useCart } from '../context/CartContext';
import { 
  Star, MapPin, Clock, Shield, Phone, MessageCircle, 
  Briefcase, ChevronRight, CheckCircle, ShoppingCart, 
  Award, Users, Heart, Share2
} from 'lucide-react';

// Service Card Component
const ServiceCard = ({ service, providerId, onAddToCart }) => {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(service, providerId);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">{service.name}</h3>
          <p className="text-gray-500 text-sm mt-1 leading-relaxed">
            {service.description || service.shortDescription || 'Professional service delivered with care and expertise.'}
          </p>
          <div className="flex flex-wrap gap-3 mt-3">
            {service.duration && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3" /> {service.duration} min
              </span>
            )}
            {service.isPopular && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                <Award className="w-3 h-3" /> Popular
              </span>
            )}
          </div>
        </div>
        <div className="text-right md:text-left min-w-[140px]">
          <div className="text-2xl font-bold text-emerald-600">₹{service.basePrice}</div>
          <div className="text-xs text-gray-400 mb-2">{service.priceUnit?.replace('_', ' ') || 'per service'}</div>
          <button
            onClick={handleAdd}
            className={`w-full md:w-auto px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              added 
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {added ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ review }) => {
  return (
    <div className="border-b border-gray-100 pb-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
          {review.customer?.firstName?.[0] || 'U'}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div>
              <p className="font-semibold text-gray-800">{review.customer?.fullName || 'Anonymous'}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium">{review.rating?.overall?.toFixed(1)}</span>
                <span className="text-xs text-gray-400">• {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
            {review.isVerifiedPurchase && (
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Verified Purchase</span>
            )}
          </div>
          <p className="text-gray-600 text-sm mt-2 leading-relaxed">{review.comment}</p>
        </div>
      </div>
    </div>
  );
};

// Main Component
const ProviderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');

  useEffect(() => {
    loadProvider();
    window.scrollTo(0, 0);
  }, [id]);

  const loadProvider = async () => {
    setLoading(true);
    try {
      const res = await fetchProviderDetailsById(id);
      if (res.success) {
        setProvider(res.data.provider);
        const reviewsRes = await fetchProviderReviews(id);
        if (reviewsRes.success) setReviews(reviewsRes.data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (service, providerId) => {
    addToCart(service, 1, null, providerId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Provider Not Found</h2>
        <p className="text-gray-500 mb-6">The professional you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 transition">Go Home</Link>
      </div>
    );
  }

  const avgRating = provider.rating?.average || 0;
  const reviewCount = provider.rating?.count || 0;
  const services = provider.services?.flatMap(s => s.subServices) || [];
  const isOnline = provider.isAvailable && (new Date() - new Date(provider.lastActive) < 60000);
  const completedJobs = provider.stats?.completedBookings || 0;
  const yearsExp = provider.experience?.years || 0;
  const serviceArea = provider.serviceArea?.cities?.slice(0, 2).join(', ') || 'Service area not set';

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-emerald-600 transition">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/category/${provider.category?.slug}`} className="hover:text-emerald-600 transition">
              {provider.category?.name}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-800 font-medium">{provider.businessName}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative">
              <img
                src={provider.user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.businessName)}&background=ffffff&color=10b981&size=120&length=2`}
                alt={provider.businessName}
                className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-white shadow-xl"
              />
              {isOnline && (
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{provider.businessName}</h1>
                {provider.verificationStatus === 'verified' && (
                  <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-lg">{avgRating.toFixed(1)}</span>
                  <span className="text-white/80 text-sm">({reviewCount} reviews)</span>
                </div>
                <div className={`flex items-center gap-1 text-sm ${isOnline ? 'text-green-200' : 'text-gray-300'}`}>
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></span>
                  {isOnline ? 'Available Now' : 'Offline'}
                </div>
              </div>
              <p className="text-white/90 text-sm md:text-base max-w-2xl leading-relaxed">{provider.bio}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8 pt-4 border-t border-white/20">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-300">
                <Award className="w-5 h-5" />
                <span className="font-bold text-xl">{yearsExp}+</span>
              </div>
              <p className="text-xs text-white/70">Years Experience</p>
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-300">
                <MapPin className="w-5 h-5" />
                <span className="font-bold text-xl truncate">{serviceArea.split(',')[0]}</span>
              </div>
              <p className="text-xs text-white/70">Service Area</p>
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-300">
                <Users className="w-5 h-5" />
                <span className="font-bold text-xl">{completedJobs.toLocaleString()}+</span>
              </div>
              <p className="text-xs text-white/70">Completed Jobs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-6 w-fit">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'services'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Services & Pricing
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'reviews'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Reviews ({reviewCount})
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'details'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Details
          </button>
        </div>

        {activeTab === 'services' && (
          <div className="space-y-4">
            {services.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No services offered yet.</p>
              </div>
            ) : (
              services.map(service => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  providerId={provider._id}
                  onAddToCart={handleAddToCart}
                />
              ))
            )}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => navigate('/checkout')}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition shadow-md"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Customer Reviews</h3>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-lg">{avgRating.toFixed(1)}</span>
                <span className="text-gray-400">out of 5</span>
              </div>
            </div>
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              <div className="space-y-5">
                {reviews.map(review => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" /> Working Hours
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {provider.workingHours?.map(wh => (
                  <div key={wh.day} className="flex justify-between border-b border-gray-100 py-2">
                    <span className="capitalize text-gray-600">{wh.day}</span>
                    <span className={wh.isWorking ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                      {wh.isWorking ? `${wh.slots[0]?.startTime} - ${wh.slots[0]?.endTime}` : 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" /> Service Area
              </h3>
              <p className="text-gray-600"><strong>Cities:</strong> {provider.serviceArea?.cities?.join(', ') || 'None'}</p>
              <p className="text-gray-600 mt-1"><strong>Pincodes:</strong> {provider.serviceArea?.pincodes?.join(', ') || 'None'}</p>
              {provider.serviceArea?.radius && <p className="text-gray-600 mt-1"><strong>Radius:</strong> {provider.serviceArea.radius} km</p>}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-600" /> Contact
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                <a href={`tel:${provider.user?.phone}`} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 transition">
                  <Phone className="w-4 h-4" /> Call Provider
                </a>
                <a href={`https://wa.me/${provider.user?.phone}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </div>
              <p className="text-gray-500 text-sm mt-3">Email: {provider.user?.email || 'Not available'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-40">
        <button onClick={() => navigate('/cart')} className="bg-white border border-gray-200 pl-3 pr-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 hover:shadow-2xl transition group">
          <div className="relative">
            <div className="w-11 h-11 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">0</span>
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-gray-800 group-hover:text-emerald-600 transition">View Cart</div>
            <div className="text-[11px] text-gray-400 font-medium">0 Items | ₹0</div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ProviderDetailPage;