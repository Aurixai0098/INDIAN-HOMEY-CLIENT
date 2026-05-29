// src/pages/CategoryPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchCategoryBySlug, searchProviders } from '../services/api';
import { useCart } from '../context/CartContext';
import { 
  Star, MapPin, Filter, ChevronRight, CheckCircle2, 
  ShoppingCart, X, CalendarCheck
} from 'lucide-react';

const ProviderCard = ({ provider, onAddToCart, onBookNow, distance, isInCart }) => {
  const navigate = useNavigate();
  const avgRating = provider.rating?.average || 0;
  const reviewCount = provider.rating?.count || 0;
  const experience = provider.experience || 0;
  const minPrice = provider.minPrice || 0;
  
  let servicesList = provider.servicesList || ['Tap Repair', 'Pipe Fixing', 'Bathroom Fitting'];
  if (!Array.isArray(servicesList)) {
    servicesList = typeof servicesList === 'string' 
      ? servicesList.split(',').map(s => s.trim())
      : ['Tap Repair', 'Pipe Fixing', 'Bathroom Fitting'];
  }
  const displayServices = servicesList.slice(0, 3).join(', ');

  const defaultImages = {
    "A1 Plumbing Services": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80",
    "Quick Flow Plumbers": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=300&q=80",
    "Delhi Plumbing Experts": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80",
    "Water Tank Solutions": "https://images.unsplash.com/photo-1542013936693-8848e57423e3?auto=format&fit=crop&w=300&q=80"
  };
  const providerImage = provider.image || defaultImages[provider.businessName] || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80";

  const handleCardClick = () => {
    if (provider.id) navigate(`/provider/${provider.id}`);
  };

  return (
    <div 
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-5 items-start relative cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <div className="relative w-full sm:w-44 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
        <img src={providerImage} alt={provider.businessName} className="w-full h-full object-cover" />
        {provider.isTopRated === true && (
          <span className="absolute top-2 left-2 bg-[#00875a] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Top Rated</span>
        )}
      </div>
      <div className="flex-1 flex flex-col md:flex-row justify-between w-full h-full min-h-[128px]">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-lg text-gray-900">{provider.businessName}</h3>
            <CheckCircle2 className="w-4 h-4 text-[#00b074] fill-white" />
          </div>
          <p className="text-gray-500 text-sm">{displayServices}</p>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 pt-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-bold text-gray-800">{avgRating.toFixed(1)}</span>
            <span>({reviewCount})</span>
            <span className="text-gray-300 mx-0.5">•</span>
            <span>{experience} Years Experience</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400 pt-3">
            <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" />{provider.location || 'New Delhi, Delhi'}</div>
            <div className="flex items-center gap-1"><span className="text-gray-400 text-xs">⇋</span>{distance || '2.5'} km away</div>
          </div>
        </div>
        <div className="flex flex-row md:flex-col justify-between md:justify-start items-end gap-2 mt-4 md:mt-0 min-w-[160px]">
          <div className="text-right md:mb-2">
            <div className="text-2xl font-bold text-gray-900">₹{minPrice}</div>
            <div className="text-gray-400 text-xs mt-0.5">per service</div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            {isInCart ? (
              <button disabled className="flex-1 md:flex-initial bg-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-md flex items-center justify-center gap-1 cursor-default">
                <CheckCircle2 className="w-3.5 h-3.5" /> Added
              </button>
            ) : (
              <button onClick={(e) => { e.stopPropagation(); onAddToCart(provider); }} className="flex-1 md:flex-initial bg-[#00aa6c] hover:bg-[#00915c] text-white text-xs font-medium px-3 py-1.5 rounded-md transition flex items-center justify-center gap-1">
                <ShoppingCart className="w-3.5 h-3.5" /> Add
              </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); onBookNow(provider); }} className="flex-1 md:flex-initial border border-[#00aa6c] text-[#00aa6c] hover:bg-emerald-50 text-xs font-medium px-3 py-1.5 rounded-md transition flex items-center justify-center gap-1">
              <CalendarCheck className="w-3.5 h-3.5" /> Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, cartCount, cartTotal } = useCart();
  
  const [category, setCategory] = useState(null);
  const [categoryRatingStats, setCategoryRatingStats] = useState(null);
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [priceMax, setPriceMax] = useState(100000);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [availability, setAvailability] = useState('all');
  
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [tempPriceRange, setTempPriceRange] = useState([0, 100000]);
  const [tempSelectedRatings, setTempSelectedRatings] = useState([]);
  const [tempAvailability, setTempAvailability] = useState('all');
  const ratingOptions = [5,4,3,2,1];

  const isProviderInCart = (providerId, serviceId) => {
    return cartItems.some(
      item => item.providerId === providerId && item.serviceId === serviceId
    );
  };

  useEffect(() => { loadCategoryAndProviders(); }, [slug]);

  const loadCategoryAndProviders = async () => {
    setLoading(true);
    try {
      const catRes = await fetchCategoryBySlug(slug);
      if (catRes.success) {
        setCategory(catRes.data.category);
        setCategoryRatingStats(catRes.data.ratingStats || null);
      } else setCategory({ name: slug, description: '' });
      
      const providersRes = await searchProviders(null, null, 100, catRes.data.category?._id);
      if (providersRes.success && providersRes.data.providers) {
        let providerList = providersRes.data.providers.map(p => ({
          ...p,
          id: p.id || p._id,
          servicesList: p.servicesList || [],
          distance: (Math.random() * 10 + 0.5).toFixed(1)
        }));
        setProviders(providerList);
        setFilteredProviders(providerList);
        
        const maxPrice = Math.max(...providerList.map(p => p.minPrice || 0), 100000);
        setPriceMax(maxPrice);
        setPriceRange([0, maxPrice]);
        setTempPriceRange([0, maxPrice]);
      } else { setProviders([]); setFilteredProviders([]); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!providers.length) return;
    let filtered = [...providers];
    if (searchTerm) {
      filtered = filtered.filter(p => p.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) || p.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    filtered = filtered.filter(p => (p.minPrice || 0) >= priceRange[0] && (p.minPrice || 0) <= priceRange[1]);
    if (selectedRatings.length) {
      filtered = filtered.filter(p => selectedRatings.some(rating => (p.rating?.average || 0) >= rating));
    }
    if (availability === 'now') filtered = filtered.filter(p => p.isOnline === true);
    else if (availability === 'later') filtered = filtered.filter(p => p.isOnline === false);
    setFilteredProviders(filtered);
  }, [providers, searchTerm, priceRange, selectedRatings, availability]);

  const toggleRating = (rating) => {
    if (selectedRatings.includes(rating)) setSelectedRatings(selectedRatings.filter(r => r !== rating));
    else setSelectedRatings([...selectedRatings, rating]);
  };
  const clearFilters = () => { setSearchTerm(''); setPriceRange([0, priceMax]); setSelectedRatings([]); setAvailability('all'); };
  const openMobileFilters = () => { setTempPriceRange([...priceRange]); setTempSelectedRatings([...selectedRatings]); setTempAvailability(availability); setMobileFilterOpen(true); };
  const applyMobileFilters = () => { setPriceRange(tempPriceRange); setSelectedRatings(tempSelectedRatings); setAvailability(tempAvailability); setMobileFilterOpen(false); };

  const getRealServiceFromProvider = (provider) => {
    if (provider.serviceId) {
      return {
        _id: provider.serviceId,
        name: (provider.servicesList && provider.servicesList.length > 0) ? provider.servicesList[0] : provider.businessName,
        basePrice: provider.minPrice || 199,
        priceUnit: 'service',
        category: { _id: category?._id },
        providerName: provider.businessName
      };
    }
    console.warn('Provider has no serviceId – cannot add to cart directly', provider);
    return null;
  };

  const handleAddToCart = (provider) => {
    const realService = getRealServiceFromProvider(provider);
    if (realService) {
      addToCart(realService, 1, null, provider.id, realService.providerName);
    } else {
      alert('This provider does not have a valid service. Please view their profile and select a service.');
    }
  };

  // ✅ Direct checkout without cart
  const handleBookNow = (provider) => {
    const realService = getRealServiceFromProvider(provider);
    if (realService) {
      const directBookingData = {
        serviceId: realService._id,
        providerId: provider.id,
        providerName: provider.businessName,
        serviceName: realService.name,
        price: realService.basePrice,
        priceUnit: realService.priceUnit,
        categoryId: category?._id,
        image: provider.image || null,
      };
      navigate('/checkout', { state: { directBooking: directBookingData } });
    } else {
      navigate(`/provider/${provider.id}`);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#00aa6c] border-t-transparent"></div></div>;

  const totalProviders = filteredProviders.length;
  const avgCategoryRating = categoryRatingStats?.average || 0;
  const totalReviews = categoryRatingStats?.count || 0;
  const ratingBreakdown = categoryRatingStats || { five:0, four:0, three:0, two:0, one:0 };
  const totalR = totalReviews || 1;
  const ratingPercentages = { 5: (ratingBreakdown.five/totalR)*100, 4: (ratingBreakdown.four/totalR)*100, 3: (ratingBreakdown.three/totalR)*100, 2: (ratingBreakdown.two/totalR)*100, 1: (ratingBreakdown.one/totalR)*100 };

  return (
    <div className="bg-[#f8fafc] min-h-screen text-gray-700 font-sans antialiased pb-24">
      {/* TOP BANNER HEADER SECTION */}
      <div className="bg-[#111e30] text-white py-6 px-6">
        <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#23cc81] rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 10-2.828-2.828m2.828 2.828l-3.414-3.414m3.414 3.414a2 2 0 11-2.828 2.828m-1.414-1.414l3.414 3.414m-12-11.414h1.5a2 2 0 012 2v1.5M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
            <div><h1 className="text-xl sm:text-2xl font-bold tracking-tight">{category?.name}</h1><p className="text-gray-400 text-xs sm:text-sm mt-0.5">{category?.description}</p></div>
          </div>
          <div className="bg-[#1a2b42] rounded-xl p-4 border border-gray-800 w-full sm:w-64 flex items-center justify-between gap-4">
            <div className="text-center pl-2"><div className="text-3xl font-bold text-white">{avgCategoryRating.toFixed(1)}</div><div className="flex gap-0.5 my-1 justify-center">{[...Array(5)].map((_,s) => <Star key={s} className={`w-3 h-3 ${s+1 <= Math.round(avgCategoryRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-500'}`} />)}</div><div className="text-[10px] text-gray-400">({totalReviews} Reviews)</div></div>
            <div className="flex-1 space-y-0.5">{ [5,4,3,2,1].map(s => (<div key={s} className="flex items-center gap-1.5 text-[10px] text-gray-400"><span className="w-3 text-right">{s}★</span><div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{ width: `${ratingPercentages[s]}%` }}></div></div><span className="w-6 text-right text-[9px] text-gray-500">{Math.round(ratingPercentages[s])}%</span></div>)) }</div>
          </div>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="max-w-[1240px] mx-auto px-4 pt-4 pb-2"><div className="flex items-center gap-1.5 text-xs text-gray-400"><Link to="/" className="hover:text-gray-600 flex items-center gap-1">⌂ Home</Link><ChevronRight className="w-3 h-3" /><span className="text-[#00aa6c] font-medium">{category?.name || 'Category'}</span></div></div>

      {/* MAIN GRID */}
      <div className="max-w-[1240px] mx-auto px-4 mt-2">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* DESKTOP FILTERS */}
          <aside className="hidden lg:block bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-5 sticky top-24">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100"><h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5"><Filter className="w-4 h-4 text-gray-500" /> Filters</h3><button onClick={clearFilters} className="text-xs text-[#00aa6c] font-medium hover:underline">Reset</button></div>
            <div><label className="text-xs font-bold text-gray-900 block mb-1.5">Service Category</label><select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs"><option>All {category?.name} Services</option></select></div>
            <div className="space-y-3">
              <div><label className="text-xs font-bold text-gray-900 block mb-1.5">Location</label><select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs"><option>Delhi</option></select></div>
              <div className="space-y-2"><div className="flex items-center justify-between text-xs text-gray-500"><span>State</span><select className="w-40 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs"><option>Delhi</option></select></div><div className="flex items-center justify-between text-xs text-gray-500"><span>District</span><select className="w-40 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs"><option>New Delhi</option></select></div><div className="flex items-center justify-between text-xs text-gray-500"><span>Locality</span><select className="w-40 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-400"><option>Select Locality</option></select></div></div>
            </div>
            <div><label className="text-xs font-bold text-gray-900 block mb-2">Price Range</label>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm">₹{priceRange[0]}</span>
                <input type="range" min="0" max={priceMax} step="100" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])} className="flex-1 accent-emerald-500" />
                <span className="text-sm">₹{priceRange[1]}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-gray-200 rounded-lg p-2 flex items-center text-xs text-gray-500"><span className="mr-1">₹</span><input type="text" readOnly value={priceRange[0]} className="w-full focus:outline-none text-gray-800" /></div>
                <div className="bg-white border border-gray-200 rounded-lg p-2 flex items-center text-xs text-gray-500"><span className="mr-1">₹</span><input type="text" readOnly value={priceRange[1]} className="w-full focus:outline-none text-gray-800" /></div>
              </div>
            </div>
            <div><label className="text-xs font-bold text-gray-900 block mb-2">Rating</label><div className="grid grid-cols-4 gap-1.5 text-[11px]">{ratingOptions.map(r => (<button key={r} onClick={() => toggleRating(r)} className={`py-1 px-1 rounded flex items-center justify-center gap-0.5 transition ${selectedRatings.includes(r) ? 'border border-amber-300 bg-amber-50/40 text-gray-700 font-medium' : 'border border-gray-200 text-gray-500'}`}>★ {r}+</button>))}</div></div>
            <div className="space-y-2 pt-1"><label className="text-xs font-bold text-gray-900 block mb-1">Availability</label><label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer"><input type="checkbox" checked={availability === 'now'} onChange={() => setAvailability('now')} className="w-4 h-4 rounded text-[#00aa6c] accent-[#00aa6c]" /><span>Available Now</span></label><label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer"><input type="checkbox" checked={availability === 'later'} onChange={() => setAvailability('later')} className="w-4 h-4 rounded text-[#00aa6c] accent-[#00aa6c]" /><span>Book for Later</span></label></div>
            <button className="w-full py-2.5 bg-[#00aa6c] hover:bg-[#00915c] text-white rounded-lg text-xs font-bold transition mt-2">Apply Filters</button>
          </aside>
          
          {/* RIGHT CONTENT */}
          <main className="lg:col-span-3 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <button onClick={openMobileFilters} className="lg:hidden flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm"><Filter className="w-4 h-4" /> Filters</button>
                <h2 className="font-bold text-gray-800 text-sm">{totalProviders} {totalProviders === 1 ? 'Provider' : 'Providers'} Found</h2>
              </div>
              <div className="flex items-center gap-2"><span className="text-xs text-gray-400">Sort By:</span><select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white text-gray-700"><option>Recommended</option><option>Price: Low to High</option><option>Rating: High to Low</option></select></div>
            </div>
            <div className="relative"><input type="text" placeholder="Search providers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00aa6c] focus:border-transparent" /><svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
            <div className="space-y-4">
              {filteredProviders.map(provider => (
                <ProviderCard 
                  key={provider.id}
                  provider={provider}
                  onAddToCart={handleAddToCart}
                  onBookNow={handleBookNow}
                  distance={provider.distance}
                  isInCart={isProviderInCart(provider.id, provider.serviceId)}
                />
              ))}
              {filteredProviders.length === 0 && <div className="bg-white rounded-xl p-8 text-center text-gray-500">No providers found matching your filters.</div>}
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-3 flex justify-center items-center mt-6 shadow-sm"><div className="flex items-center gap-1.5 text-xs"><button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-400 hover:bg-gray-50">‹</button><button className="w-8 h-8 flex items-center justify-center bg-[#00aa6c] text-white font-bold rounded-md">1</button><button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50">2</button><button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50">3</button><span className="px-1 text-gray-400">...</span><button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50">8</button><button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-400 hover:bg-gray-50">›</button></div></div>
          </main>
        </div>
      </div>

      {/* FLOATING CART BUTTON */}
      <div className="fixed bottom-6 right-6 z-50"><button onClick={() => navigate('/cart')} className="bg-white border border-gray-100 pl-3 pr-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 hover:shadow-2xl transition group"><div className="relative"><div className="w-11 h-11 bg-[#23cc81] rounded-xl flex items-center justify-center text-white"><ShoppingCart className="w-5 h-5 fill-current" /></div><span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{cartCount || 0}</span></div><div className="text-left"><div className="text-xs font-bold text-gray-800 group-hover:text-[#00aa6c] transition">View Cart</div><div className="text-[11px] text-gray-400 font-medium">{cartCount || 0} Items | <span className="text-gray-900 font-bold">₹{cartTotal ? cartTotal.toFixed(0) : '0'}</span></div></div></button></div>

      {/* MOBILE FILTER DRAWER */}
      {mobileFilterOpen && (<div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end lg:hidden" onClick={() => setMobileFilterOpen(false)}><div className="bg-white w-full max-h-[85vh] rounded-t-3xl overflow-y-auto animate-slideUp" onClick={e => e.stopPropagation()}><div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center"><h3 className="font-bold text-lg">Filters</h3><button onClick={() => setMobileFilterOpen(false)} className="p-1"><X className="w-5 h-5" /></button></div><div className="p-5 space-y-5">
        <div><label className="text-sm font-bold text-gray-900 block mb-1">Service Category</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"><option>All {category?.name} Services</option></select></div>
        <div><label className="text-sm font-bold text-gray-900 block mb-1">Location</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"><option>Delhi</option></select></div>
        <div className="flex items-center justify-between text-sm"><span className="text-gray-500">State</span><select className="w-40 border border-gray-200 rounded-lg px-2 py-1.5 text-sm"><option>Delhi</option></select></div>
        <div className="flex items-center justify-between text-sm"><span className="text-gray-500">District</span><select className="w-40 border border-gray-200 rounded-lg px-2 py-1.5 text-sm"><option>New Delhi</option></select></div>
        <div className="flex items-center justify-between text-sm"><span className="text-gray-500">Locality</span><select className="w-40 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-400"><option>Select Locality</option></select></div>
        <div><label className="text-sm font-bold text-gray-900 block mb-2">Price Range</label>
          <div className="flex items-center gap-3 mb-2"><span className="text-sm">₹{tempPriceRange[0]}</span><input type="range" min="0" max={priceMax} step="100" value={tempPriceRange[1]} onChange={(e) => setTempPriceRange([tempPriceRange[0], parseInt(e.target.value)])} className="flex-1 accent-emerald-500" /><span className="text-sm">₹{tempPriceRange[1]}</span></div>
          <div className="grid grid-cols-2 gap-3"><div className="bg-white border border-gray-200 rounded-lg p-2 flex items-center text-sm"><span className="mr-1">₹</span><input type="text" readOnly value={tempPriceRange[0]} className="w-full focus:outline-none" /></div><div className="bg-white border border-gray-200 rounded-lg p-2 flex items-center text-sm"><span className="mr-1">₹</span><input type="text" readOnly value={tempPriceRange[1]} className="w-full focus:outline-none" /></div></div>
        </div>
        <div><label className="text-sm font-bold text-gray-900 block mb-2">Rating</label><div className="grid grid-cols-4 gap-2 text-sm">{ratingOptions.map(r => (<button key={r} onClick={() => { if (tempSelectedRatings.includes(r)) setTempSelectedRatings(tempSelectedRatings.filter(rt => rt !== r)); else setTempSelectedRatings([...tempSelectedRatings, r]); }} className={`py-1.5 rounded flex items-center justify-center gap-1 transition ${tempSelectedRatings.includes(r) ? 'border border-amber-300 bg-amber-50 text-gray-800 font-medium' : 'border border-gray-200 text-gray-500'}`}>★ {r}+</button>))}</div></div>
        <div className="space-y-2"><label className="text-sm font-bold text-gray-900 block">Availability</label><label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" checked={tempAvailability === 'now'} onChange={() => setTempAvailability('now')} className="w-4 h-4 rounded text-[#00aa6c]" /><span>Available Now</span></label><label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" checked={tempAvailability === 'later'} onChange={() => setTempAvailability('later')} className="w-4 h-4 rounded text-[#00aa6c]" /><span>Book for Later</span></label></div>
        <div className="flex gap-3 pt-4 pb-6"><button onClick={() => { setMobileFilterOpen(false); clearFilters(); }} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium">Reset</button><button onClick={applyMobileFilters} className="flex-1 py-2.5 bg-[#00aa6c] text-white rounded-xl text-sm font-medium">Apply Filters</button></div>
      </div></div></div>)}
      <style>{`@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}.animate-slideUp{animation:slideUp 0.3s ease-out;}`}</style>
    </div>
  );
};
export default CategoryPage;