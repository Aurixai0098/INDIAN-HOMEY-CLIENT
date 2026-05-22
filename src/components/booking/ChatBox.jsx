import { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const ChatBox = ({ bookingId, providerName, customerName, onClose }) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const isProvider = user?.role === 'provider';
  const partnerName = isProvider ? customerName : providerName;

  // Load chat history (optional – if fails, chat still works)
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/v1/chat/${bookingId}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.success) setMessages(data.data.messages || []);
        }
      } catch (err) {
        console.warn('Chat history load failed, but chat works:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [bookingId]);

  // Socket listeners for real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      if (data.bookingId === bookingId) {
        setMessages(prev => {
          // Avoid duplicates
          if (data._id && prev.some(m => m._id === data._id)) return prev;
          return [...prev, data];
        });
      }
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-sent', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-sent', handleNewMessage);
    };
  }, [socket, bookingId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    if (!socket || !isConnected) {
      alert('Connection issue. Please refresh.');
      return;
    }

    const messageData = {
      bookingId,
      message: newMessage.trim(),
      senderId: user._id,
      senderRole: user.role,
      type: 'text',
    };

    // Optimistic update
    const tempId = 'temp_' + Date.now();
    setMessages(prev => [...prev, {
      _tempId: tempId,
      message: messageData.message,
      senderRole: user.role,
      createdAt: new Date().toISOString()
    }]);

    socket.emit('send-message', messageData);
    setNewMessage('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[500px]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-gray-800">Chat with {partnerName || 'Customer'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No messages yet. Say hello!</div>
          ) : (
            messages.map((msg, idx) => {
              const isOwn = msg.senderRole === user.role;
              return (
                <div key={msg._id || msg._tempId || idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-3 rounded-xl ${isOwn ? 'bg-emerald-600 text-white' : 'bg-white border text-gray-800'}`}>
                    <p className="text-sm break-words">{msg.message}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-emerald-100' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg._tempId ? ' ✓' : ''}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t bg-white flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;