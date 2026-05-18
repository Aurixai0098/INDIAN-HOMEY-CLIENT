// src/pages/provider/ProviderProfile.jsx
import { useState, useEffect } from 'react';
import { fetchProviderProfile, updateProviderProfile, fetchProviderReviews } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Star, MessageCircle, User, Calendar, Loader2, CheckCircle, XCircle, 
  Briefcase, Clock, MapPin, Phone, Mail, Globe, Award, TrendingUp,
  Save, Edit2, Users, ThumbsUp, Heart, AlertCircle, ChevronRight
} from 'lucide-react';

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

// Review Card Component (Enhanced)
const ReviewCard = ({ review }) => {
  const customerName = review.customer?.fullName || review.customer?.firstName || 'Anonymous';
  const customerAvatar = review.customer?.avatar?.url;
  const rating = review.rating?.overall || 0;
  const comment = review.comment;
  const date = review.createdAt;
  const title = review.title;
  const helpfulCount = review.helpful?.count || 0;

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {customerAvatar ? (
            <img src={customerAvatar} alt={customerName} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
              {customerName[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-800">{customerName}</p>
            <StarRating rating={rating} size="sm" showNumber={false} />
          </div>
        </div>
        <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
      {title && <h4 className="font-medium text-slate-800 mb-1">{title}</h4>}
      <p className="text-slate-600 text-sm leading-relaxed">{comment}</p>
      {helpfulCount > 0 && (
        <div className="flex items-center gap-1 mt-3 text-xs text-slate-400">
          <ThumbsUp className="w-3 h-3" />
          <span>{helpfulCount} people found this helpful</span>
        </div>
      )}
    </div>
  );
};

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center cursor-pointer gap-3">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
        />
        <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${checked ? 'transform translate-x-4' : ''}`}></div>
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
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
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState({ average: 0, total: 0, five: 0, four: 0, three: 0, two: 0, one: 0 });
  const [activeTab, setActiveTab] = useState('profile');

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

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
        
        if (prov._id) loadReviews(prov._id);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load profile' });
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
    setMessage({ type: '', text: '' });
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
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        loadProfile(); // reload fresh data
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const avgRating = profile?.rating?.average || reviewStats.average || 0;
  const totalReviews = profile?.rating?.count || reviewStats.total || 0;
  const completedBookings = profile?.stats?.completedBookings || 0;
  const totalEarnings = profile?.stats?.totalEarnings || 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Provider Profile</h1>
        <p className="text-gray-500 mt-1">Manage your business information and availability</p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
              <img
                src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.businessName || user?.firstName || 'Provider')}&background=ffffff&color=10b981&size=80`}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile?.businessName || user?.businessName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={avgRating} size="sm" showNumber={true} />
                <span className="text-sm opacity-90">({totalReviews} reviews)</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${form.isAvailable ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'}`}>
                  {form.isAvailable ? 'Available' : 'Unavailable'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-white/20 backdrop-blur-sm">
                  {profile?.verificationStatus === 'verified' ? '✓ Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{completedBookings}</p>
              <p className="text-xs opacity-90">Completed Jobs</p>
            </div>
            <div>
              <p className="text-2xl font-bold">${totalEarnings.toLocaleString()}</p>
              <p className="text-xs opacity-90">Total Earnings</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{profile?.experience?.years || 0}+</p>
              <p className="text-xs opacity-90">Years Exp.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
            activeTab === 'profile' 
              ? 'bg-white text-emerald-600 border-b-2 border-emerald-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Briefcase className="w-4 h-4 inline mr-2" />
          Profile Settings
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
            activeTab === 'reviews' 
              ? 'bg-white text-emerald-600 border-b-2 border-emerald-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <MessageCircle className="w-4 h-4 inline mr-2" />
          Reviews & Ratings
          {totalReviews > 0 && <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{totalReviews}</span>}
        </button>
      </div>

      {/* Profile Settings Tab */}
      {activeTab === 'profile' && (
        <>
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                      <input
                        type="text"
                        value={form.businessName}
                        onChange={e => setForm({...form, businessName: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="Your business name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Description</label>
                      <textarea
                        rows="4"
                        value={form.bio}
                        onChange={e => setForm({...form, bio: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="Tell customers about your services..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                        <input
                          type="number"
                          min="0"
                          value={form.experience.years}
                          onChange={e => setForm({...form, experience: {...form.experience, years: parseInt(e.target.value) || 0}})}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience Description</label>
                        <input
                          type="text"
                          value={form.experience.description}
                          onChange={e => setForm({...form, experience: {...form.experience, description: e.target.value}})}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500"
                          placeholder="e.g., 5+ years in plumbing"
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <ToggleSwitch
                        checked={form.isAvailable}
                        onChange={(e) => setForm({...form, isAvailable: e.target.checked})}
                        label="Accepting new bookings"
                      />
                      <p className="text-xs text-gray-500 mt-1">When turned on, customers can book your services.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Working Hours */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  Working Hours
                </h3>
                <div className="space-y-3">
                  {days.map(day => {
                    const wh = workingHours.find(w => w.day === day) || { day, isWorking: true, startTime: '09:00', endTime: '18:00' };
                    return (
                      <div key={day} className="flex flex-wrap items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <div className="w-16 font-medium text-gray-700 text-sm">{dayLabels[day]}</div>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={wh.isWorking}
                            onChange={e => handleWorkingHourChange(day, 'isWorking', e.target.checked)}
                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                          />
                          <span className="ml-2 text-sm text-gray-600">Working</span>
                        </label>
                        {wh.isWorking && (
                          <div className="flex items-center gap-2 ml-auto">
                            <input
                              type="time"
                              value={wh.startTime || '09:00'}
                              onChange={e => handleWorkingHourChange(day, 'startTime', e.target.value)}
                              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500"
                            />
                            <span className="text-gray-400 text-sm">–</span>
                            <input
                              type="time"
                              value={wh.endTime || '18:00'}
                              onChange={e => handleWorkingHourChange(day, 'endTime', e.target.value)}
                              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Rating Summary Header */}
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="text-center md:text-left">
                <div className="text-5xl font-bold text-gray-800">{avgRating.toFixed(1)}</div>
                <StarRating rating={avgRating} size="lg" showNumber={false} />
                <p className="text-sm text-gray-500 mt-1">Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
              </div>
              <div className="flex-1 space-y-1.5 max-w-md">
                {[5,4,3,2,1].map(star => {
                  const key = star === 5 ? 'five' : star === 4 ? 'four' : star === 3 ? 'three' : star === 2 ? 'two' : 'one';
                  const count = reviewStats[key] || 0;
                  const percent = totalReviews ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-8 text-gray-600">{star}★</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="w-10 text-xs text-gray-500">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">No reviews yet</h3>
              <p className="text-gray-500">Once customers review your services, they will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
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