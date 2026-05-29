// src/pages/OrderSuccessPage.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingId = location.state?.bookingId;

  useEffect(() => {
    if (!bookingId) {
      // If no bookingId, redirect to home after 3 seconds
      const timer = setTimeout(() => navigate('/'), 3000);
      return () => clearTimeout(timer);
    }
  }, [bookingId, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-4">
          Your booking has been successfully created.
        </p>
        {bookingId && (
          <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg mb-6">
            Booking ID: <span className="font-mono font-semibold">{bookingId}</span>
          </p>
        )}
        <div className="space-y-3">
          <Link
            to="/my-bookings"
            className="block w-full bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition"
          >
            View My Bookings
          </Link>
          <Link
            to="/"
            className="block w-full border border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            Continue Shopping
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-6">
          You will receive a confirmation email shortly.
        </p>
      </div>
    </div>
  );
};

export default OrderSuccessPage;