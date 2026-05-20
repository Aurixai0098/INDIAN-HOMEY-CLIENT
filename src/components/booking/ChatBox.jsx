// src/components/booking/ChatBox.jsx
import { useState, useEffect, useRef } from 'react';
import { Send, X, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { fetchBookingById } from '../../services/api';

const ChatBox = ({ bookingId, providerName, customerName, onClose }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProviderOnline, setIsProviderOnline] = useState(false);
  const messagesEndRef = useRef(null);
  const isProvider = user?.role === 'provider';

  // Load chat history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/v1/chat/${bookingId}`);
        const data = await res.json();
        if (data.success) setMessages(data.data.messages || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [bookingId]);

  // Check provider online status (simple check using lastActive)
  useEffect(() => {
    const checkProviderStatus = async () => {
      try {
        const bookingRes = await fetchBookingById(bookingId);
        if (bookingRes.success && bookingRes.data.booking.provider) {
          const providerId = bookingRes.data.booking.provider._id;
          // Try to fetch provider status from a dedicated endpoint
          // If not available, we can check socket connection status
          // For now, we assume provider is online if socket is connected
          // but we will also try a fallback endpoint
          const statusRes = await fetch(`/api/v1/providers/status/${providerId}`).catch(() => null);
          if (statusRes && statusRes.ok) {
            const statusData = await statusRes.json();
            setIsProviderOnline(statusData.data?.isOnline || false);
          } else {
            // Fallback: if the socket is connected and the provider is not the current user, assume online
            // Actually we can't know without backend. Set a default false.
            setIsProviderOnline(false);
          }
        }
      } catch (err) {
        console.error('Failed to get provider status', err);
      }
    };
    checkProviderStatus();
    const interval = setInterval(checkProviderStatus, 30000);
    return () => clearInterval(interval);
  }, [bookingId]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (data) => {
      if (data.bookingId === bookingId) {
        setMessages(prev => [...prev, data]);
      }
    };
    socket.on('new-message', handleNewMessage);
    return () => socket.off('new-message', handleNewMessage);
  }, [socket, bookingId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    if (!socket) {
      alert('Socket not connected. Please refresh the page.');
      return;
    }
    socket.emit('send-message', {
      bookingId,
      message: newMessage,
      senderId: user._id,
      senderRole: user.role,
    });
    setNewMessage('');
  };

  const displayName = isProvider ? customerName : providerName;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[500px]">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-bold">Chat with {displayName}</h3>
            <div className="flex items-center gap-1 text-xs">
              {isProviderOnline ? (
                <span className="flex items-center gap-1 text-green-600"><Wifi className="w-3 h-3" /> Online</span>
              ) : (
                <span className="flex items-center gap-1 text-gray-500"><WifiOff className="w-3 h-3" /> Offline</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.senderRole === user.role ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-2 rounded-lg ${msg.senderRole === user.role ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <p className="text-sm break-words">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-3 border-t flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
          />
          <button onClick={sendMessage} className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;