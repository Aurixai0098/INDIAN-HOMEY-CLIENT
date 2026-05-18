// src/pages/provider/ProviderProfile.jsx
import { useState, useEffect } from 'react';
import { fetchProviderProfile, updateProviderProfile, fetchProviderReviews } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Star, MessageCircle, User, Calendar, Loader2 } from 'lucide-react';

// Star Rating Display Component
const StarRating = ({ rating, size = 'md', showNumber = true }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`${sizeClass} ${i < fullStars ? 'text-amber-400' : (i === fullStars && hasHalfStar ? 'text-amber-400' : 'text-gray-300')}`}>
            ★
          </span>
        ))}
      </div>
      {showNumber && <span className="text-sm font-medium text-gray-700 ml-1">{rating.toFixed(1)}</span>}
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ review }) => {
  const customerName = review.customer?.fullName || review.customer?.firstName || 'Anonymous';
  const customerAvatar = review.customer?.avatar?.url;
  const rating = review.rating?.overall || 0;
  const comment = review.comment;
  const date = review.createdAt;
  const title = review.title;

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {customerAvatar ? (
            <img src={customerAvatar} alt={customerName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
              {customerName[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-800">{customerName}</p>
            <StarRating rating={rating} size="sm" showNumber={false} />
          </div>
        </div>
        <span className="text-xs text-slate-400">{new Date(date).toLocaleDateString()}</span>
      </div>
      {title && <h4 className="font-medium text-slate-800 mb-1">{title}</h4>}
      <p className="text-slate-600 text-sm leading-relaxed">{comment}</p>
    </div>
  );
};

const ProviderProfile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    businessName: '',
    bio: '',
    experience: { years: 0, description: '' },
    isAvailable: true,
  });
  const [workingHours, setWorkingHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState({ average: 0, total: 0, five: 0, four: 0, three: 0, two: 0, one: 0 });
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'reviews'

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetchProviderProfile();
      if (res.success) {
        const prov = res.data.provider;
        setProfile(prov);
        setForm({
          businessName: prov.businessName || '',
          bio: prov.bio || '',
          experience: prov.experience || { years: 0, description: '' },
          isAvailable: prov.isAvailable ?? true,
        });
        setWorkingHours(prov.workingHours || []);
        
        // Load reviews after profile is loaded (we need provider _id)
        if (prov._id) {
          loadReviews(prov._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (providerId) => {
    setReviewsLoading(true);
    try {
      const res = await fetchProviderReviews(providerId, 1, 50);
      if (res.success) {
        setReviews(res.data.reviews || []);
        setReviewStats(res.data.stats || { average: 0, total: 0, five: 0, four: 0, three: 0, two: 0, one: 0 });
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleWorkingHourChange = (day, field, value) => {
    setWorkingHours(prev => {
      const existing = prev.find(w => w.day === day);
      if (existing) {
        return prev.map(w => w.day === day ? { ...w, [field]: value } : w);
      } else {
        return [...prev, { day, isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }], [field]: value }];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const updateData = {
        businessName: form.businessName,
        bio: form.bio,
        experience: form.experience,
        isAvailable: form.isAvailable,
        workingHours: workingHours.map(wh => ({
          day: wh.day,
          isWorking: wh.isWorking,
          slots: wh.isWorking ? [{ startTime: wh.startTime || '09:00', endTime: wh.endTime || '18:00' }] : [],
        })),
      };
      const res = await updateProviderProfile(updateData);
      if (res.success) {
        setMessage('Profile updated successfully');
        loadProfile(); // reload to get fresh data
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading profile...</div>;

  // Get average rating from profile rating object if available, otherwise from reviewStats
  const avgRating = profile?.rating?.average || reviewStats.average || 0;
  const totalReviews = profile?.rating?.count || reviewStats.total || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Provider Profile</h1>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Profile Settings
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'reviews' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Reviews & Ratings ({totalReviews})
        </button>
      </div>

      {/* Profile Settings Tab */}
      {activeTab === 'profile' && (
        <>
          {message && (
            <div className={`p-3 rounded-lg mb-4 ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Business Name</label>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={e => setForm({...form, businessName: e.target.value})}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    rows="3"
                    value={form.bio}
                    onChange={e => setForm({...form, bio: e.target.value})}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Experience (years)</label>
                    <input
                      type="number"
                      value={form.experience.years}
                      onChange={e => setForm({...form, experience: {...form.experience, years: parseInt(e.target.value)}})}
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Experience Description</label>
                    <input
                      type="text"
                      value={form.experience.description}
                      onChange={e => setForm({...form, experience: {...form.experience, description: e.target.value}})}
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isAvailable}
                      onChange={e => setForm({...form, isAvailable: e.target.checked})}
                    />
                    Available for new bookings
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="font-semibold mb-4">Working Hours</h2>
              <div className="space-y-3">
                {days.map(day => {
                  const wh = workingHours.find(w => w.day === day) || { day, isWorking: true, startTime: '09:00', endTime: '18:00' };
                  return (
                    <div key={day} className="flex flex-wrap items-center gap-3 border-b pb-3">
                      <div className="w-28 capitalize font-medium">{day}</div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={wh.isWorking}
                          onChange={e => handleWorkingHourChange(day, 'isWorking', e.target.checked)}
                        />
                        Working
                      </label>
                      {wh.isWorking && (
                        <>
                          <input
                            type="time"
                            value={wh.startTime || '09:00'}
                            onChange={e => handleWorkingHourChange(day, 'startTime', e.target.value)}
                            className="border rounded px-2 py-1"
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={wh.endTime || '18:00'}
                            onChange={e => handleWorkingHourChange(day, 'endTime', e.target.value)}
                            className="border rounded px-2 py-1"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {/* Rating Summary */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 pb-6 border-b border-slate-100 mb-6">
            <div className="text-center md:text-left">
              <div className="text-4xl font-bold text-slate-800">{avgRating.toFixed(1)}</div>
              <StarRating rating={avgRating} size="lg" showNumber={false} />
              <p className="text-sm text-slate-500 mt-1">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5,4,3,2,1].map(star => {
                const count = reviewStats[star === 5 ? 'five' : star === 4 ? 'four' : star === 3 ? 'three' : star === 2 ? 'two' : 'one'] || 0;
                const percent = totalReviews ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-8">{star}★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="w-8 text-xs text-gray-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No reviews yet. Once customers review your services, they will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProviderProfile;