import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchProviderNotifications, markAllProviderNotificationsRead, mar9yMnTm4NSzvG9rrwjM2ec8xZgh1cafXH8 } from '../services/api';
import { Bell, CheckCheck, Clock, Loader2, BellRing, MessageCircle, CalendarCheck, DollarSign } from 'lucide-react';

const playNotificationSound = () => {
  try {
    const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed:', e));
  } catch (err) {
    console.log('Audio not supported');
  }
};

const ProviderNotificationBell = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const openChatId = searchParams.get('openChat');

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetchProviderNotifications();
      if (res.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'provider') return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!socket || user?.role !== 'provider') return;

    const handleNewMessage = (data) => {
      if (openChatId && data.bookingId === openChatId) return;

      if (data.senderRole === 'customer') {
        playNotificationSound();
        const newNotif = {
          _id: `msg_${Date.now()}`,
          type: 'message',
          title: 'New Customer Message',
          message: data.message,
          isRead: false,
          createdAt: new Date().toISOString(),
          reference: { model: 'Booking', id: data.bookingId }
        };
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    };

    const handleBookingRequest = (data) => {
      playNotificationSound();
      const newNotif = {
        _id: `req_${data.bookingId}`,
        type: 'booking',
        title: 'New Booking Request',
        message: `${data.customerName} requested "${data.serviceName}" for ${new Date(data.scheduledDate).toLocaleDateString()}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        reference: { model: 'Booking', id: data.bookingId }
      };
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    const handlePaymentReceived = (data) => {
      playNotificationSound();
      const newNotif = {
        _id: `payment_${data.bookingId}`,
        type: 'payment',
        title: 'Payment Received',
        message: `₹${data.amount} credited to your wallet for booking ${data.bookingId}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        reference: { model: 'Booking', id: data.bookingId }
      };
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on('new-message', handleNewMessage);
    socket.on('new-booking-request', handleBookingRequest);
    socket.on('payment-received', handlePaymentReceived);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('new-booking-request', handleBookingRequest);
      socket.off('payment-received', handlePaymentReceived);
    };
  }, [socket, user, openChatId]);

  const handleMarkRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await mar9yMnTm4NSzvG9rrwjM2ec8xZgh1cafXH8(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read', err);
      loadNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllProviderNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
      loadNotifications();
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) handleMarkRead(notif._id);
    setShowDropdown(false);
    if (notif.type === 'message' && notif.reference?.id) {
      navigate(`/provider/bookings?openChat=${notif.reference.id}`);
    } else if (notif.reference?.id) {
      navigate(`/provider/bookings/${notif.reference.id}`);
    } else {
      navigate('/provider/bookings');
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

  const getIcon = (type) => {
    switch(type) {
      case 'message': return <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center"><MessageCircle className="w-4 h-4 text-blue-600" /></div>;
      case 'booking': return <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center"><CalendarCheck className="w-4 h-4 text-amber-600" /></div>;
      case 'payment': return <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center"><DollarSign className="w-4 h-4 text-green-600" /></div>;
      default: return <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center"><Bell className="w-4 h-4 text-slate-600" /></div>;
    }
  };

  if (user?.role !== 'provider') return null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2 rounded-xl transition-all duration-200 ${showDropdown ? 'bg-emerald-50 text-emerald-600 ring-2 ring-emerald-200' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
      >
        <BellRing className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[11px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div ref={dropdownRef} className="absolute right-0 mt-3 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-white">
            <div><h3 className="font-semibold text-gray-800">Notifications</h3><p className="text-xs text-gray-400">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p></div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} disabled={markingAll} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 disabled:opacity-50">
                {markingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />} Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
            {isLoading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /><p className="text-xs text-gray-400 mt-2">Loading...</p></div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12"><Bell className="w-10 h-10 text-gray-300 mb-2" /><p className="text-sm text-gray-500">No notifications</p></div>
            ) : (
              notifications.map((notif, idx) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group flex gap-3 p-4 cursor-pointer transition-all duration-150 ${!notif.isRead ? 'bg-emerald-50/40 hover:bg-emerald-50' : 'hover:bg-gray-50'} ${idx !== notifications.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  {getIcon(notif.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-800' : 'font-medium text-gray-700'}`}>{notif.title}</p>
                      {!notif.isRead && <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0"></span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{notif.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{getRelativeTime(notif.createdAt)}</span>
                      {!notif.isRead && <button onClick={(e) => handleMarkRead(notif._id, e)} className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">Mark read</button>}
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
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default ProviderNotificationBell;