// src/context/BookingRequestContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { acceptBooking } from '../services/api';

const BookingRequestContext = createContext();

export const useBookingRequests = () => {
  const context = useContext(BookingRequestContext);
  if (!context) throw new Error('useBookingRequests must be used within BookingRequestProvider');
  return context;
};

let audioCtx = null;
const playNotybell = async () => {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    const response = await fetch('/notybell.mp3');
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start(0);
  } catch (err) { console.warn('Sound play failed:', err); }
};

export const BookingRequestProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [activePopup, setActivePopup] = useState(null);

  useEffect(() => {
    if (!socket || user?.role !== 'provider') return;

    const handleNewRequest = (data) => {
      console.log('🔔 New booking request (global):', data);
      playNotybell();
      setIncomingRequests(prev => [...prev, data]);
      setActivePopup(data);
      const timer = setTimeout(() => {
        setActivePopup(prev => prev?.bookingId === data.bookingId ? null : prev);
      }, 30000);
      return () => clearTimeout(timer);
    };

    const handleBookingTaken = (data) => {
      setIncomingRequests(prev => prev.filter(req => req.bookingId !== data.bookingId));
      setActivePopup(prev => prev?.bookingId === data.bookingId ? null : prev);
    };

    socket.on('new-booking-request', handleNewRequest);
    socket.on('booking-taken', handleBookingTaken);

    return () => {
      socket.off('new-booking-request', handleNewRequest);
      socket.off('booking-taken', handleBookingTaken);
    };
  }, [socket, user]);

  const acceptRequest = async (bookingId) => {
    try {
      await acceptBooking(bookingId);
      setIncomingRequests(prev => prev.filter(r => r.bookingId !== bookingId));
      setActivePopup(null);
    } catch (err) {
      console.error('Accept failed:', err);
      alert('Failed to accept booking: ' + err.message);
    }
  };

  const dismissPopup = () => setActivePopup(null);

  return (
    <BookingRequestContext.Provider value={{
      incomingRequests,
      activePopup,
      acceptRequest,
      dismissPopup,
      setIncomingRequests
    }}>
      {children}
    </BookingRequestContext.Provider>
  );
};