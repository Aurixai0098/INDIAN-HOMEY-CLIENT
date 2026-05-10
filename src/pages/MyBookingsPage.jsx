// src/pages/MyBookingsPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyBookings } from '../services/api';

const BookingCard = ({ booking }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

 useEffect(()=>{
    window.scrollTo(0,0)
  },[])

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 mb-4">
      <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
        <div>
          <h3 className="font-bold text-gray-800">{booking.bookingId}</h3>
          <p className="text-sm text-gray-500">{new Date(booking.scheduledDate).toLocaleDateString()} • {booking.scheduledTime.start} - {booking.scheduledTime.end}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status] || 'bg-gray-100'}`}>
          {booking.status?.toUpperCase()}
        </span>
      </div>
      <div className="border-t pt-3 mt-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Provider:</span>
          <span className="font-medium">{booking.provider?.businessName || 'N/A'}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-600">Items:</span>
          <span>{booking.items.map(i => i.serviceName).join(', ')}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-600">Total Amount:</span>
          <span className="font-bold text-emerald-600">₹{booking.pricing?.total}</span>
        </div>
        {booking.status === 'completed' && !booking.hasReviewed && (
          <Link to={`/review/${booking._id}`} className="inline-block mt-3 text-emerald-600 text-sm hover:underline">
            Write a Review
          </Link>
        )}
      </div>
    </div>
  );
};

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await fetchMyBookings(1, 20);
      if (res.success) {
        setBookings(res.data.bookings || []);
      } else {
        setError('Failed to load bookings');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-xl font-semibold mb-2">No bookings yet</h2>
          <p className="text-gray-500 mb-4">Looks like you haven't booked any service.</p>
          <Link to="/" className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700">Browse Services</Link>
        </div>
      ) : (
        <div>
          {bookings.map(booking => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;