// src/components/NotificationBell.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { 
  fetchNotifications, 
  markNotificationRead, 
  markAllNotificationsRead
} from '../services/api';
import { Bell, CheckCheck, Clock, Loader2, MessageCircle, CalendarCheck, AlertCircle } from 'lucide-react';

// Play a short "ding" sound
const playNotificationSound = () => {
  try {
    const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed:', e));
  } catch (err) {
    console.log('Audio not supported');
  }
};

const NotificationBell = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const dropdownRef = useRef(null);
  const bellButtonRef = useRef(null);

  // Load initial notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetchNotifications(1, 30);
      if (res.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Polling fallback (every 60s)
  useEffect(() => {
    if (!user) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [user, loadNotifications]);

  // Real‑time socket listeners
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (data) => {
      if (data.senderRole === 'provider') {
        playNotificationSound();
        const newNotif = {
          _id: `msg_${Date.now()}`,
          type: 'message',
          title: 'New Message',
          message: data.message,
          isRead: false,
          createdAt: new Date().toISOString(),
          reference: { model: 'Booking', id: data.bookingId }
        };
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    };

    const handleBookingAccepted = (data) => {
      playNotificationSound();
      const newNotif = {
        _id: `booking_${data.bookingId}`,
        type: 'booking',
        title: 'Booking Confirmed',
        message: `Your booking has been accepted by ${data.provider?.businessName || 'a provider'}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        reference: { model: 'Booking', id: data.bookingId }
      };
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on('new-message', handleNewMessage);
    socket.on('booking-accepted', handleBookingAccepted);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('booking-accepted', handleBookingAccepted);
    };
  }, [socket, user]);

  const handleMarkRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read', err);
      loadNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) handleMarkRead(notif._id);
    setShowDropdown(false);
    if (notif.type === 'message' && notif.reference?.id) {
      navigate(`/my-bookings?openChat=${notif.reference.id}`);
    } else if (notif.type === 'booking' && notif.reference?.id) {
      navigate(`/my-bookings?highlight=${notif.reference.id}`);
    } else {
      navigate('/my-bookings');
    }
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'message':
        return <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center"><MessageCircle className="w-4 h-4 text-blue-600" /></div>;
      case 'booking':
        return <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center"><CalendarCheck className="w-4 h-4 text-emerald-600" /></div>;
      default:
        return <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center"><AlertCircle className="w-4 h-4 text-slate-600" /></div>;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.isRead;
    return true;
  });

  if (!user || user.role === 'provider') return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={bellButtonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2.5 rounded-xl transition-all duration-200 ${
          showDropdown ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
        }`}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[11px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-3 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-slate-50 to-white">
            <div>
              <h3 className="font-semibold text-slate-800">Notifications</h3>
              <p className="text-xs text-slate-400">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="flex border-b">
            {['all', 'unread'].map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`flex-1 py-2.5 text-xs font-medium capitalize transition-all ${activeFilter === f ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600'}`}>
                {f} {f === 'unread' && unreadCount > 0 && <span className="ml-1.5 bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
              </button>
            ))}
          </div>

          <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
            {isLoading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /><p className="text-xs text-slate-400 mt-2">Loading...</p></div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12"><Bell className="w-10 h-10 text-slate-300 mb-2" /><p className="text-sm text-slate-500">No notifications</p></div>
            ) : (
              filteredNotifications.map((notif, idx) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group flex gap-3 p-4 cursor-pointer transition-all duration-150 ${!notif.isRead ? 'bg-blue-50/60 hover:bg-blue-100/60' : 'hover:bg-slate-50'} ${idx !== filteredNotifications.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  {getNotificationIcon(notif.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notif.isRead ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>{notif.title}</p>
                      {!notif.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{notif.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{getRelativeTime(notif.createdAt)}</span>
                      {!notif.isRead && <button onClick={(e) => handleMarkRead(notif._id, e)} className="text-[11px] font-medium text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">Mark read</button>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default NotificationBell;