// src/pages/provider/ProviderProfile.jsx
import { useState, useEffect } from 'react';
import { fetchProviderProfile, updateProviderProfile, fetchProviderReviews } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Star, MessageCircle, User, Calendar, Loader2, CheckCircle, XCircle, 
  Briefcase, Clock, MapPin, Phone, Mail, Globe, Award, TrendingUp,
  Save, Edit2, Users, ThumbsUp, Heart, AlertCircle, ChevronRight,
  Building2, BadgeCheck, CircleCheckBig, Sparkles, DollarSign,
  CalendarDays, Settings, Info, Coffee, Moon, Sun
} from 'lucide-react';

// Star Rating Display Component
const StarRating = ({ rating, size = 'md', showNumber = true, className = '' }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className={`flex items-center gap-1 ${className}`}>
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
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all duration-300 group">
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
            <p className="font-semibold text-gray-800">{customerName}</p>
            <StarRating rating={rating} size="sm" showNumber={false} />
          </div>
        </div>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
      {title && <h4 className="font-medium text-gray-800 mb-1">{title}</h4>}
      <p className="text-gray-600 text-sm leading-relaxed">{comment}</p>
      {helpfulCount > 0 && (
        <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
          <ThumbsUp className="w-3 h-3" />
          <span>{helpfulCount} people found this helpful</span>
        </div>
      )}
    </div>
  );
};

// Modern Toggle Switch
const ModernToggle = ({ checked, onChange, label, description }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-sm transition-all">
      <div>
        <p className="font-medium text-gray-800 flex items-center gap-2">
          <CircleCheckBig className="w-4 h-4 text-emerald-500" />
          {label}
        </p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={onChange}
        />
        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
      </label>
    </div>
  );
};

// Floating Label Input Component
const FloatingInput = ({ id, label, value, onChange, type = "text", required = false, icon: Icon }) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.toString().length > 0;
  
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`peer w-full px-4 pt-5 pb-2 border rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
          focused || hasValue ? 'border-emerald-400' : 'border-gray-200'
        }`}
        placeholder=" "
        required={required}
      />
      {Icon && (
        <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
          focused || hasValue ? 'text-emerald-500' : 'text-gray-400'
        }`} />
      )}
      <label
        htmlFor={id}
        className={`absolute left-3 transition-all duration-200 pointer-events-none ${
          focused || hasValue
            ? 'text-[10px] -top-2 bg-white px-1 text-emerald-600'
            : 'text-sm text-gray-500 top-1/2 -translate-y-1/2'
        } ${Icon ? 'left-9' : 'left-3'}`}
      >
        {label}
      </label>
    </div>
  );
};

// Working Hours Card (Modern)
const WorkingHoursCard = ({ day, fullName, isWorking, startTime, endTime, onToggle, onStartChange, onEndChange }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl transition-all ${
      isWorking ? 'bg-white border border-gray-100 shadow-sm' : 'bg-gray-50 border border-gray-100'
    }`}>
      <div className="flex items-center gap-3 mb-2 sm:mb-0">
        <div className="w-24">
          <p className="font-medium text-gray-800 text-sm">{fullName}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isWorking}
            onChange={onToggle}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          <span className="ml-2 text-xs text-gray-500">{isWorking ? 'Open' : 'Closed'}</span>
        </label>
      </div>
      
      {isWorking && (
        <div className="flex items-center gap-2 ml-0 sm:ml-auto">
          <div className="relative">
            <Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="time"
              value={startTime}
              onChange={onStartChange}
              className="pl-7 pr-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <span className="text-gray-400 text-xs">to</span>
          <div className="relative">
            <Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="time"
              value={endTime}
              onChange={onEndChange}
              className="pl-7 pr-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Skeleton Loader
const ProfileSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded-lg w-64 mb-4"></div>
    <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl h-48 mb-8"></div>
    <div className="flex gap-2 mb-6">
      <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
      <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl h-96"></div>
      <div className="bg-white rounded-xl h-96"></div>
    </div>
  </div>
);

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
  const fullDayNames = {
    monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
    thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday'
  };

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

  const handleWorkingHourToggle = (day, isWorking) => {
    setWorkingHours(prev => {
      const existing = prev.find(w => w.day === day);
      if (existing) {
        return prev.map(w => w.day === day ? { ...w, isWorking } : w);
      } else {
        return [...prev, { day, isWorking, slots: [{ startTime: '09:00', endTime: '18:00' }] }];
      }
    });
  };

  const handleWorkingHourTime = (day, field, value) => {
    setWorkingHours(prev => {
      const existing = prev.find(w => w.day === day);
      if (existing) {
        return prev.map(w => w.day === day ? { ...w, [field]: value, slots: [{ startTime: field === 'startTime' ? value : w.startTime, endTime: field === 'endTime' ? value : w.endTime }] } : w);
      } else {
        return [...prev, { day, isWorking: true, startTime: field === 'startTime' ? value : '09:00', endTime: field === 'endTime' ? value : '18:00', slots: [{ startTime: field === 'startTime' ? value : '09:00', endTime: field === 'endTime' ? value : '18:00' }] }];
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
        loadProfile();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ProfileSkeleton />;

  const avgRating = profile?.rating?.average || reviewStats.average || 0;
  const totalReviews = profile?.rating?.count || reviewStats.total || 0;
  const completedBookings = profile?.stats?.completedBookings || 0;
  const totalEarnings = profile?.stats?.totalEarnings || 0;
  const isVerified = profile?.verificationStatus === 'verified';

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Toast Message */}
      {message.text && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl animate-slideInRight ${
          message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })} className="ml-2 hover:opacity-70">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Provider Profile</h1>
        <p className="text-gray-500 mt-1">Manage your business information, availability, and working hours</p>
      </div>

      {/* Hero Card - Profile Overview */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-xl mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800')] opacity-10 bg-cover bg-center"></div>
        <div className="relative p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar & Basic Info */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.businessName || user?.firstName || 'Provider')}&background=ffffff&color=10b981&size=100`}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-white/30 shadow-lg"
                />
                {isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 ring-2 ring-white">
                    <BadgeCheck className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile?.businessName || user?.businessName || `${user?.firstName} ${user?.lastName}`}</h2>
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  <StarRating rating={avgRating} size="sm" showNumber={true} />
                  <span className="text-sm opacity-90">({totalReviews} reviews)</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${form.isAvailable ? 'bg-emerald-500' : 'bg-gray-500'}`}>
                    {form.isAvailable ? '🟢 Available' : '⚫ Unavailable'}
                  </span>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-white/20 backdrop-blur-sm">
                      <CircleCheckBig className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all">
                <Briefcase className="w-5 h-5 mx-auto mb-1 opacity-80" />
                <p className="text-2xl font-bold">{completedBookings}</p>
                <p className="text-xs opacity-80">Completed Jobs</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all">
                <DollarSign className="w-5 h-5 mx-auto mb-1 opacity-80" />
                <p className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</p>
                <p className="text-xs opacity-80">Total Earnings</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all">
                <Award className="w-5 h-5 mx-auto mb-1 opacity-80" />
                <p className="text-2xl font-bold">{profile?.experience?.years || 0}+</p>
                <p className="text-xs opacity-80">Years Exp.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
            activeTab === 'profile' 
              ? 'bg-white text-emerald-600 border-b-2 border-emerald-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          Profile Settings
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
            activeTab === 'reviews' 
              ? 'bg-white text-emerald-600 border-b-2 border-emerald-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Reviews & Ratings
          {totalReviews > 0 && (
            <span className="ml-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{totalReviews}</span>
          )}
        </button>
      </div>

      {/* Profile Settings Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Information (Modern) */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-5 pb-2 border-b border-gray-100">
                  <User className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-gray-800">Basic Information</h3>
                </div>
                <div className="space-y-5">
                  {/* Business Name */}
                  <FloatingInput
                    id="businessName"
                    label="Business Name"
                    value={form.businessName}
                    onChange={e => setForm({...form, businessName: e.target.value})}
                    required={true}
                    icon={Building2}
                  />
                  
                  {/* Bio - Textarea with char counter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio / Description</label>
                    <textarea
                      rows="4"
                      value={form.bio}
                      onChange={e => setForm({...form, bio: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                      placeholder="Tell customers about your services, experience, and what makes you unique..."
                      maxLength="500"
                    />
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-400">Max 500 characters</p>
                      <p className="text-xs text-gray-400">{form.bio.length}/500</p>
                    </div>
                  </div>
                  
                  {/* Experience - Two column layout with modern inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                      <div className="relative">
                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={form.experience.years}
                          onChange={e => setForm({...form, experience: {...form.experience, years: parseFloat(e.target.value) || 0}})}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          placeholder="Years"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience Description</label>
                      <input
                        type="text"
                        value={form.experience.description}
                        onChange={e => setForm({...form, experience: {...form.experience, description: e.target.value}})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="e.g., 5+ years in plumbing"
                      />
                    </div>
                  </div>
                  
                  {/* Availability Toggle */}
                  <ModernToggle
                    checked={form.isAvailable}
                    onChange={(e) => setForm({...form, isAvailable: e.target.checked})}
                    label="Accepting new bookings"
                    description="When turned on, customers can book your services immediately"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Working Hours (Modern) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-5 pb-2 border-b border-gray-100">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-gray-800">Working Hours</h3>
              </div>
              <div className="space-y-3">
                {days.map(day => {
                  const wh = workingHours.find(w => w.day === day) || { 
                    day, 
                    isWorking: true, 
                    startTime: '09:00', 
                    endTime: '18:00',
                    slots: [{ startTime: '09:00', endTime: '18:00' }]
                  };
                  return (
                    <WorkingHoursCard
                      key={day}
                      day={day}
                      fullName={fullDayNames[day]}
                      isWorking={wh.isWorking}
                      startTime={wh.startTime || wh.slots?.[0]?.startTime || '09:00'}
                      endTime={wh.endTime || wh.slots?.[0]?.endTime || '18:00'}
                      onToggle={() => handleWorkingHourToggle(day, !wh.isWorking)}
                      onStartChange={(e) => handleWorkingHourTime(day, 'startTime', e.target.value)}
                      onEndChange={(e) => handleWorkingHourTime(day, 'endTime', e.target.value)}
                    />
                  );
                })}
              </div>
              <div className="mt-5 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Set your working hours so customers know when you're available for service
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                    <div key={star} className="flex items-center gap-2 text-sm group">
                      <span className="w-8 text-gray-600">{star}★</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full transition-all duration-500 group-hover:bg-amber-500" 
                          style={{ width: `${percent}%` }}
                        />
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

      {/* Animation styles */}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProviderProfile;