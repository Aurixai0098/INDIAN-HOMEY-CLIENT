import { useState, useEffect } from 'react';
import { fetchAdminBookings } from '../../services/api';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminBookings(page, 20, statusFilter);
      if (res.success) {
        setBookings(res.data.bookings);
        setTotalPages(Math.ceil(res.data.pagination.total / res.data.pagination.limit));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [page, statusFilter]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bookings</h1>
      <div className="mb-4">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="border p-2 rounded">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50"><tr><th>Booking ID</th><th>Customer</th><th>Provider</th><th>Status</th><th>Total</th><th>Date</th></tr></thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b._id} className="border-t"><td className="px-4 py-2">{b.bookingId}</td><td>{b.customer?.fullName}</td><td>{b.provider?.businessName}</td><td className="capitalize">{b.status}</td><td>₹{b.pricing?.total}</td><td>{new Date(b.createdAt).toLocaleDateString()}</td></tr>
            ))}
            {bookings.length === 0 && <tr><td colSpan="6" className="text-center py-4">No bookings found</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="px-3 py-1 bg-gray-200 rounded">Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p+1)} className="px-3 py-1 bg-gray-200 rounded">Next</button>
      </div>
    </div>
  );
};

export default AdminBookings;