import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  fetchNotifications, 
  markNotificationRead, 
  fetchProviderNotifications, 
  mar9yMnTm4NSzvG9rrwjM2ec8xZgh1cafXH8,
  markAllNotificationsRead,
  markAllProviderNotificationsRead
} from '../services/api';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread'
  const dropdownRef = useRef(null);
  const bellButtonRef = useRef(null);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowDropdown(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target) &&
        bellButtonRef.current &&
        !bellButtonRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let res;
      if (user.role === 'provider') {
        res = await fetchProviderNotifications();
      } else {
        res = await fetchNotifications(1, 30);
      }
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

  // Polling for new notifications
  useEffect(() => {
    if (!user) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, loadNotifications]);

  // Mark single notification as read
  const handleMarkRead = async (id, e) => {
    e?.stopPropagation();
    try {
      if (user?.role === 'provider') {
        await mar9yMnTm4NSzvG9rrwjM2ec8xZgh1cafXH8(id);
      } else {
        await markNotificationRead(id);
      }
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
      // Revert on error
      loadNotifications();
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      if (user?.role === 'provider') {
        await markAllProviderNotificationsRead();
      } else {
        await markAllNotificationsRead();
      }
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return (
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'message':
        return (
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        );
      case 'alert':
        return (
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  // Format relative time
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Filtered notifications
  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.isRead;
    return true;
  });

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        ref={bellButtonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className={`
          relative p-2.5 rounded-xl transition-all duration-200 ease-out
          ${showDropdown 
            ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-200' 
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-300
        `}
        aria-label="Notifications"
        aria-expanded={showDropdown}
      >
        <svg 
          className={`w-5 h-5 transition-transform duration-300 ${showDropdown ? 'scale-110' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span 
            className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm border-2 border-white animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div 
          className="
            absolute right-0 mt-3 w-[360px] max-w-[calc(100vw-1rem)] 
            bg-white rounded-2xl shadow-2xl border border-slate-200/80 
            z-50 overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-200
          "
          role="dialog"
          aria-label="Notifications panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-100">
            {['all', 'unread'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`
                  flex-1 py-2.5 text-xs font-medium capitalize transition-all duration-200
                  ${activeFilter === filter 
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }
                `}
              >
                {filter}
                {filter === 'unread' && unreadCount > 0 && (
                  <span className="ml-1.5 bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto scrollbar-thin">
            {isLoading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-xs text-slate-400 mt-3">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-500">
                  {activeFilter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="text-xs text-slate-400 mt-1 text-center">
                  {activeFilter === 'unread' 
                    ? 'You have read all your notifications' 
                    : 'When you get notifications, they will appear here'
                  }
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif, index) => (
                <div
                  key={notif._id}
                  onClick={(e) => !notif.isRead && handleMarkRead(notif._id, e)}
                  className={`
                    group flex gap-3 p-4 cursor-pointer transition-all duration-200
                    ${!notif.isRead 
                      ? 'bg-blue-50/60 hover:bg-blue-100/60' 
                      : 'hover:bg-slate-50'
                    }
                    ${index !== filteredNotifications.length - 1 ? 'border-b border-slate-50' : ''}
                  `}
                >
                  {/* Icon */}
                  {getNotificationIcon(notif.type)}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`
                        text-sm leading-snug
                        ${!notif.isRead ? 'font-semibold text-slate-800' : 'font-medium text-slate-600'}
                      `}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {getRelativeTime(notif.createdAt)}
                      </span>
                      {!notif.isRead && (
                        <button
                          onClick={(e) => handleMarkRead(notif._id, e)}
                          className="opacity-0 group-hover:opacity-100 text-[11px] text-blue-600 hover:text-blue-700 font-medium transition-opacity"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/50">
              <button 
                onClick={() => {
                  window.location.href = '/notifications';
                }}
                className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-700 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;