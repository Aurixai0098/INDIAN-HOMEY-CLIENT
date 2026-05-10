// src/pages/ServiceDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchServiceBySlug, fetchCategories } from '../services/api';
import { useCart } from '../context/CartContext';

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();

  const [service, setService] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSidebar, setLoadingSidebar] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

 useEffect(()=>{
    window.scrollTo(0,0)
  },[])

  const loadService = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchServiceBySlug(slug);
      if (res.success && res.data.service) {
        setService(res.data.service);
        setRelatedServices(res.data.relatedServices || []);
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
    loadService();
    loadAllCategories();
  }, [slug]);

  const handleAddToCart = () => {
    addToCart(service);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Service not found</h1>
          <p className="text-gray-600 mb-6">{error || 'The service you are looking for does not exist.'}</p>
          <Link to="/" className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 transition">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* MAIN CONTENT */}
          <main className="flex-1">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-4">
              <Link to="/" className="hover:text-emerald-600">Home</Link> / 
              <Link to={`/category/${service.category?.slug}`} className="hover:text-emerald-600 ml-1">
                {service.category?.name}
              </Link> / 
              <span className="text-gray-700 ml-1">{service.name}</span>
            </div>

            {/* Image + Basic Info + Includes/Excludes Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* LEFT: Image */}
                <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                  {service.images && service.images.length > 0 ? (
                    <img
                      src={service.images[0].url}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image available
                    </div>
                  )}
                </div>

                {/* RIGHT: Title, Rating, Description, Price, Add to Cart */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{service.name}</h1>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500">★</span>
                      <span className="font-medium">{service.rating?.average || 0}</span>
                      <span className="text-gray-400">({service.rating?.count || 0} reviews)</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500 text-sm">{service.bookingsCount || 0}+ bookings</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>

                  {/* Price & Add to Cart */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
                    <div>
                      <span className="text-3xl font-bold text-emerald-600">₹{service.basePrice}</span>
                      <span className="text-gray-400 ml-1">
                        /{service.priceUnit?.replace('_', ' ') || 'service'}
                      </span>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-2 shadow-md"
                    >
                      {added ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Added to Cart
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* INCLUDES / EXCLUDES / REQUIREMENTS - 3 small boxes below the image+info row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 pt-0 border-t border-gray-100">
                {service.includes && service.includes.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      What's Included
                    </h3>
                    <ul className="space-y-1.5 text-sm text-gray-600">
                      {service.includes.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-500 text-xs">✓</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {service.excludes && service.excludes.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Exclusions
                    </h3>
                    <ul className="space-y-1.5 text-sm text-gray-600">
                      {service.excludes.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-400 text-xs">✗</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {service.requirements && service.requirements.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Requirements
                    </h3>
                    <ul className="space-y-1.5 text-sm text-gray-600">
                      {service.requirements.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-500 text-xs">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Related Services */}
            {relatedServices.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">You might also like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {relatedServices.map(rel => (
                    <Link key={rel._id} to={`/service/${rel.slug}`} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition group">
                      <div className="aspect-video bg-gray-100 overflow-hidden">
                        <img
                          src={rel.images?.[0]?.url || 'https://via.placeholder.com/400x300'}
                          alt={rel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-gray-800 line-clamp-1">{rel.name}</h3>
                        <p className="text-emerald-600 font-bold mt-1">₹{rel.basePrice}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* RIGHT SIDEBAR - All Categories (unchanged) */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-24 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-bold text-gray-800">All Categories</h2>
              </div>
              <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-100">
                {loadingSidebar ? (
                  <div className="p-4 space-y-2">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse"></div>)}
                  </div>
                ) : (
                  allCategories.map(cat => (
                    <Link
                      key={cat._id}
                      to={`/category/${cat.slug}`}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors ${
                        cat._id === service.category?._id
                          ? 'bg-emerald-50 text-emerald-700 font-medium border-l-4 border-emerald-600'
                          : 'text-gray-700'
                      }`}
                    >
                      {cat.icon?.url ? (
                        <img src={cat.icon.url} alt={cat.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <span className="text-lg">📁</span>
                      )}
                      <span className="text-sm">{cat.name}</span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;