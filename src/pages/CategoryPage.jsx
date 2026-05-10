// src/pages/CategoryPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchCategoryBySlug, fetchCategories } from '../services/api';
import { useCart } from '../context/CartContext';

const ServiceCard = ({ service, onAddToCart }) => {
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();      // Prevent navigation when clicking on button
    e.stopPropagation();     // Stop event from bubbling to parent Link
    onAddToCart(service);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group">
      <Link to={`/service/${service.slug}`} className="block">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
          <div className="aspect-video bg-gray-100 overflow-hidden">
            <img
              src={service.images?.[0]?.url || 'https://via.placeholder.com/400x300?text=Service'}
              alt={service.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">{service.name}</h3>
            <p className="text-gray-500 text-sm mb-3 line-clamp-2">
              {service.shortDescription || service.description?.substring(0, 80)}
            </p>
            <div className="flex items-center justify-between mt-2">
              <div>
                <span className="text-2xl font-bold text-emerald-600">₹{service.basePrice}</span>
                <span className="text-gray-400 text-sm ml-1">
                  /{service.priceUnit?.replace('_', ' ') || 'service'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
      {/* Button outside the Link to prevent navigation on click */}
      <div className="px-4 pb-4 -mt-2">
        <button
          onClick={handleAdd}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-1"
        >
          {added ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Added
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
};

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

  // Load current category & its services
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

  // Load all categories for sidebar
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
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Category not found</h1>
          <p className="text-gray-600 mb-6">{error || 'The category you are looking for does not exist.'}</p>
          <Link to="/" className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 transition">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
          {category.icon?.url && (
            <img src={category.icon.url} alt={category.name} className="w-24 h-24 object-contain bg-white/10 rounded-2xl p-4" />
          )}
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">{category.name}</h1>
            <p className="text-emerald-100 max-w-2xl">{category.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDEBAR - All Categories */}
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
                        cat.slug === slug ? 'bg-emerald-50 text-emerald-700 font-medium border-l-4 border-emerald-600' : 'text-gray-700'
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

          {/* MAIN CONTENT - Services List */}
          <main className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  {services.length} {services.length === 1 ? 'Service' : 'Services'} available
                </h2>
                <p className="text-gray-500 text-sm mt-1">Choose the best service for your home</p>
              </div>
            </div>

            {services.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <div className="text-5xl mb-4">🧹</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No services yet</h3>
                <p className="text-gray-500">We are adding services in this category soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                  <ServiceCard key={service._id} service={service} onAddToCart={addToCart} />
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