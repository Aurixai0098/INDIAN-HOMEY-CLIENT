// src/pages/admin/AdminEmailCampaigns.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail, Users, Briefcase, Send, Search, Filter, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Loader2, RefreshCw, Eye, Clock, Calendar,
  UserPlus, FileText, Edit3, Trash2, AlertCircle, X
} from 'lucide-react';
import {
  fetchProviderEmails,
  fetchUserEmails,
  sendEmailCampaign,
  fetchCampaignHistory
} from '../../services/api';

const formatDate = (date) => new Date(date).toLocaleString('en-IN');

const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center gap-3">
      <div className={`p-3 rounded-lg ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

// Multi-select dropdown component
const MultiSelectDropdown = ({ options, selected, onChange, placeholder, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(search.toLowerCase()) ||
    opt.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (opt) => {
    const exists = selected.find(s => s.id === opt.id);
    if (exists) {
      onChange(selected.filter(s => s.id !== opt.id));
    } else {
      onChange([...selected, opt]);
    }
  };

  const selectAll = () => {
    onChange([...filteredOptions]);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white flex justify-between items-center"
      >
        <span className="text-gray-700">
          {selected.length > 0 ? `${selected.length} selected` : placeholder}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-hidden flex flex-col">
          <div className="p-2 border-b">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-7 pr-2 py-1 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 mt-2 text-xs">
              <button onClick={selectAll} className="text-blue-600 hover:underline">Select All</button>
              <button onClick={clearAll} className="text-red-600 hover:underline">Clear All</button>
            </div>
          </div>
          <div className="overflow-y-auto max-h-60">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-gray-400">No options found</div>
            ) : (
              filteredOptions.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selected.find(s => s.id === opt.id)}
                    onChange={() => toggleSelect(opt)}
                    className="rounded"
                  />
                  <div>
                    <p className="text-sm font-medium">{opt.name}</p>
                    <p className="text-xs text-gray-500">{opt.email}</p>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Email Preview Modal
const EmailPreviewModal = ({ email, onClose, onSend }) => {
  const [sending, setSending] = useState(false);
  const handleSend = async () => {
    setSending(true);
    try {
      await onSend();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold flex items-center gap-2"><Eye size={18} /> Email Preview</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500 mb-2">To: {email.audienceCount} recipients</p>
            <p className="text-sm text-gray-500 mb-2">Subject: <span className="font-medium">{email.subject}</span></p>
            <div className="mt-4 pt-3 border-t">
              <p className="whitespace-pre-wrap text-gray-700">{email.message}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-4 border-t bg-gray-50">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
          <button onClick={handleSend} disabled={sending} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {sending ? 'Sending...' : 'Send Campaign'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const AdminEmailCampaigns = () => {
  const [activeTab, setActiveTab] = useState('compose'); // compose, history
  const [audienceType, setAudienceType] = useState('all_providers'); // all_providers, all_users, specific_providers, specific_users
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [providersList, setProvidersList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [stats, setStats] = useState({ totalSent: 0, totalCampaigns: 0 });

  // Fetch provider list for dropdown
  const loadProviders = useCallback(async (search = '') => {
    setLoadingProviders(true);
    try {
      const res = await fetchProviderEmails(search);
      if (res.success) setProvidersList(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingProviders(false); }
  }, []);

  // Fetch user list for dropdown
  const loadUsers = useCallback(async (search = '') => {
    setLoadingUsers(true);
    try {
      const res = await fetchUserEmails(search);
      if (res.success) setUsersList(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingUsers(false); }
  }, []);

  // Load campaign history
  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetchCampaignHistory(historyPage, 20);
      if (res.success) {
        setHistory(res.data.campaigns);
        setHistoryTotalPages(Math.ceil(res.data.pagination.total / res.data.pagination.limit));
        setStats({
          totalSent: res.data.stats.totalSent,
          totalCampaigns: res.data.stats.totalCampaigns
        });
      }
    } catch (err) { console.error(err); }
    finally { setHistoryLoading(false); }
  };

  useEffect(() => {
    if (audienceType === 'specific_providers') loadProviders();
    if (audienceType === 'specific_users') loadUsers();
  }, [audienceType, loadProviders, loadUsers]);

  useEffect(() => {
    if (activeTab === 'history') loadHistory();
  }, [activeTab, historyPage]);

  const getAudienceCount = () => {
    switch(audienceType) {
      case 'all_providers': return 'All providers';
      case 'all_users': return 'All users';
      case 'specific_providers': return `${selectedProviders.length} provider(s) selected`;
      case 'specific_users': return `${selectedUsers.length} user(s) selected`;
      default: return '';
    }
  };

  const handleSendCampaign = async () => {
    if (!subject.trim()) {
      alert('Please enter a subject');
      return;
    }
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    const payload = {
      audienceType,
      subject,
      message,
    };
    if (audienceType === 'specific_providers') payload.providerIds = selectedProviders.map(p => p.id);
    if (audienceType === 'specific_users') payload.userIds = selectedUsers.map(u => u.id);

    setSending(true);
    try {
      await sendEmailCampaign(payload);
      alert('Campaign sent successfully!');
      setSubject('');
      setMessage('');
      setSelectedProviders([]);
      setSelectedUsers([]);
      setShowPreview(false);
      if (activeTab === 'history') loadHistory();
    } catch (err) {
      alert(err.message || 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Mail className="text-blue-600" size={24} /> Email Campaigns
        </h1>
        <p className="text-gray-500 mt-1">Create and send email campaigns to providers and users</p>
      </div>

      {/* Stats Cards (when on history tab) */}
      {activeTab === 'history' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <StatCard label="Total Campaigns" value={stats.totalCampaigns} icon={FileText} color="blue" />
          <StatCard label="Total Emails Sent" value={stats.totalSent} icon={Send} color="green" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('compose')}
          className={`px-4 py-2 font-medium ${activeTab === 'compose' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Compose Campaign
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Campaign History
        </button>
      </div>

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form className="space-y-5">
            {/* Audience Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setAudienceType('all_providers')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                    audienceType === 'all_providers'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase size={16} /> All Providers
                </button>
                <button
                  type="button"
                  onClick={() => setAudienceType('all_users')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                    audienceType === 'all_users'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users size={16} /> All Users
                </button>
                <button
                  type="button"
                  onClick={() => setAudienceType('specific_providers')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                    audienceType === 'specific_providers'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase size={16} /> Specific Providers
                </button>
                <button
                  type="button"
                  onClick={() => setAudienceType('specific_users')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                    audienceType === 'specific_users'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users size={16} /> Specific Users
                </button>
              </div>
              <p className="text-sm text-gray-500">{getAudienceCount()}</p>
            </div>

            {/* Specific Providers Dropdown */}
            {audienceType === 'specific_providers' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Providers</label>
                <MultiSelectDropdown
                  options={providersList.map(p => ({ id: p._id, name: p.businessName, email: p.email }))}
                  selected={selectedProviders}
                  onChange={setSelectedProviders}
                  placeholder="Search and select providers..."
                  isLoading={loadingProviders}
                />
              </div>
            )}

            {/* Specific Users Dropdown */}
            {audienceType === 'specific_users' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Users</label>
                <MultiSelectDropdown
                  options={usersList.map(u => ({ id: u._id, name: u.fullName, email: u.email }))}
                  selected={selectedUsers}
                  onChange={setSelectedUsers}
                  placeholder="Search and select users..."
                  isLoading={loadingUsers}
                />
              </div>
            )}

            {/* Email Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Your email subject..."
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Email Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your email content here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            {/* Summary & Actions */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-sm font-medium text-blue-800 mb-1">📧 Campaign Summary</p>
              <p className="text-sm text-blue-700">Audience: <span className="font-semibold">{getAudienceCount()}</span></p>
              <p className="text-sm text-blue-700">Subject: {subject || '(empty)'}</p>
              <p className="text-sm text-blue-700">Message length: {message.length} characters</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                disabled={!subject.trim() || !message.trim()}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Eye size={16} /> Preview
              </button>
              <button
                type="button"
                onClick={handleSendCampaign}
                disabled={sending || !subject.trim() || !message.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {sending ? 'Sending...' : 'Send Campaign'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {historyLoading ? (
                  <tr><td colSpan="5" className="text-center py-10"><Loader2 className="animate-spin mx-auto text-blue-600" size={24} /></td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-10 text-gray-400">No campaigns sent yet</td></tr>
                ) : (
                  history.map((campaign) => (
                    <tr key={campaign._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{campaign.subject}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">{campaign.message.substring(0, 60)}...</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.audienceType === 'all_providers' ? 'bg-purple-100 text-purple-700' :
                          campaign.audienceType === 'all_users' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {campaign.audienceType === 'all_providers' ? 'All Providers' :
                           campaign.audienceType === 'all_users' ? 'All Users' :
                           campaign.audienceType === 'specific_providers' ? 'Specific Providers' : 'Specific Users'}
                        </span>
                       </td>
                      <td className="px-6 py-4 text-sm">{campaign.recipientCount}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(campaign.createdAt)}</td>
                      <td className="px-6 py-4">
                        {campaign.status === 'sent' ? (
                          <span className="text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Sent</span>
                        ) : (
                          <span className="text-yellow-600 flex items-center gap-1"><Clock size={14} /> Processing</span>
                        )}
                       </td>
                     </tr>
                  ))
                )}
              </tbody>
             </table>
          </div>
          {historyTotalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t">
              <span className="text-sm text-gray-500">Page {historyPage} of {historyTotalPages}</span>
              <div className="flex gap-2">
                <button disabled={historyPage === 1} onClick={() => setHistoryPage(p => p-1)} className="p-2 border rounded disabled:opacity-50"><ChevronLeft size={16} /></button>
                <button disabled={historyPage === historyTotalPages} onClick={() => setHistoryPage(p => p+1)} className="p-2 border rounded disabled:opacity-50"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <EmailPreviewModal
          email={{ audienceCount: getAudienceCount(), subject, message }}
          onClose={() => setShowPreview(false)}
          onSend={handleSendCampaign}
        />
      )}
    </div>
  );
};

export default AdminEmailCampaigns;