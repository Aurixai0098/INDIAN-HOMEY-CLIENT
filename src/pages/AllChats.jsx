import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyBookings } from '../services/api';
import { MessageCircle } from 'lucide-react';

const AllChats = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchMyBookings(1, 100).then(res => {
      if (res.success) setBookings(res.data.bookings);
    });
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">All Conversations</h1>
      {bookings.filter(b => b.status !== 'cancelled').map(booking => (
        <div key={booking._id} className="flex justify-between items-center bg-white p-4 rounded-xl border mb-3">
          <div>
            <p className="font-medium">{booking.bookingId}</p>
            <p className="text-sm text-gray-500">{booking.customer?.fullName || 'Customer'}</p>
          </div>
          <Link to={`/my-bookings?openChat=${booking._id}`} className="p-2 bg-emerald-100 rounded-xl">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
          </Link>
        </div>
      ))}
    </div>
  );
};

export default AllChats;