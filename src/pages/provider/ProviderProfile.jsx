import { useState, useEffect } from 'react';
import { fetchProviderProfile, updateProviderProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
        loadProfile();
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading profile...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Provider Profile</h1>
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
    </div>
  );
};

export default ProviderProfile;