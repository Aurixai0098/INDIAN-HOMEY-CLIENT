// src/pages/admin/AdminCouponsOffers.jsx
import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../services/api';

const AdminCouponsOffers = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({ code: '', discountType: 'percentage', discountValue: 10, minOrder: 0, maxDiscount: null, validUntil: '', usageLimit: 1, isActive: true });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetchCoupons();
      if (res.success) setCoupons(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadCoupons(); }, []);

  const handleSave = async () => {
    try {
      if (editingCoupon) await updateCoupon(editingCoupon._id, formData);
      else await createCoupon(formData);
      loadCoupons();
      setShowModal(false);
      resetForm();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this coupon?')) {
      await deleteCoupon(id);
      loadCoupons();
    }
  };

  const resetForm = () => { setFormData({ code: '', discountType: 'percentage', discountValue: 10, minOrder: 0, maxDiscount: null, validUntil: '', usageLimit: 1, isActive: true }); setEditingCoupon(null); };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><Ticket className="text-purple-600" /> Coupons & Offers</h1><button onClick={()=>{resetForm(); setShowModal(true);}} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={16}/> Add Coupon</button></div>
      <div className="bg-white rounded-xl overflow-hidden"><table className="min-w-full"><thead className="bg-gray-50"><tr><th>Code</th><th>Discount</th><th>Min Order</th><th>Valid Till</th><th>Uses Left</th><th>Status</th><th>Actions</th></tr></thead><tbody>{coupons.map(c=> (<tr key={c._id}><td className="font-mono">{c.code}</td><td>{c.discountType==='percentage'?`${c.discountValue}%`:`₹${c.discountValue}`}</td><td>₹{c.minOrder}</td><td>{new Date(c.validUntil).toLocaleDateString()}</td><td>{c.usageLimit - c.usedCount}</td><td>{c.isActive? <CheckCircle className="text-green-600"/> : <XCircle className="text-red-600"/>}</td><td><button onClick={()=>{setEditingCoupon(c); setFormData(c); setShowModal(true);}}><Edit2 size={16}/></button><button onClick={()=>handleDelete(c._id)} className="ml-2 text-red-600"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
      {showModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center"><div className="bg-white rounded-xl p-6 w-96"><h3 className="text-lg font-bold mb-4">{editingCoupon?'Edit Coupon':'New Coupon'}</h3><div className="space-y-3"><input placeholder="Code" className="border p-2 w-full" value={formData.code} onChange={e=>setFormData({...formData, code: e.target.value.toUpperCase()})}/><select className="border p-2 w-full" value={formData.discountType} onChange={e=>setFormData({...formData, discountType:e.target.value})}><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option></select><input type="number" placeholder="Discount Value" className="border p-2 w-full" value={formData.discountValue} onChange={e=>setFormData({...formData, discountValue: parseFloat(e.target.value)})}/><input type="number" placeholder="Minimum Order Amount" className="border p-2 w-full" value={formData.minOrder} onChange={e=>setFormData({...formData, minOrder: parseFloat(e.target.value)})}/><input type="date" className="border p-2 w-full" value={formData.validUntil?.split('T')[0]} onChange={e=>setFormData({...formData, validUntil: e.target.value})}/><input type="number" placeholder="Usage Limit" className="border p-2 w-full" value={formData.usageLimit} onChange={e=>setFormData({...formData, usageLimit: parseInt(e.target.value)})}/><label className="flex items-center gap-2"><input type="checkbox" checked={formData.isActive} onChange={e=>setFormData({...formData, isActive: e.target.checked})}/> Active</label><div className="flex gap-2 mt-4"><button onClick={()=>setShowModal(false)} className="flex-1 bg-gray-200 py-2 rounded">Cancel</button><button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-2 rounded">Save</button></div></div></div></div>)}
    </div>
  );
};

export default AdminCouponsOffers;