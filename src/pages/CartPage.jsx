import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Modern Lucide Icons (install: npm install lucide-react)
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  PackageOpen,
  Tag,
  ShieldCheck,
  Truck,
  Clock,
  Sparkles,
  X,
  Heart,
  IndianRupee,
  Percent,
  Gift
} from 'lucide-react';

// ─── Empty Cart State ───────────────────────────────────────────────
const EmptyCart = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div className="text-center max-w-md">
      <div className="relative w-32 h-32 mx-auto mb-8">
        <div className="absolute inset-0 bg-slate-200 rounded-full animate-pulse"></div>
        <div className="relative w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
          <ShoppingCart className="w-14 h-14 text-slate-400" />
        </div>
        <div className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-emerald-500" />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-3">Your cart is empty</h2>
      <p className="text-slate-500 mb-8 leading-relaxed">
        Looks like you haven't added any services yet. Browse our categories and find the perfect service for your home.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5"
      >
        <ArrowLeft className="w-4 h-4" />
        Continue Shopping
      </Link>
    </div>
  </div>
);

// ─── Cart Item Card ─────────────────────────────────────────────────
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(item.serviceId, item.variant), 300);
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50
      ${isRemoving ? 'opacity-0 scale-95 translate-x-full' : 'opacity-100 scale-100 translate-x-0'}`}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image */}
        <div className="w-full sm:w-28 h-28 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PackageOpen className="w-10 h-10 text-slate-300" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{item.name}</h3>
              {/* ✅ Show provider name instead of category */}
              <p className="text-sm text-slate-500 mt-0.5">{item.providerName || 'Service Provider'}</p>
            </div>
            <button
              onClick={handleRemove}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex-shrink-0"
              title="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Price & Unit */}
          <div className="flex items-center gap-2 mt-2">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            <span className="text-xl font-bold text-slate-800">{item.price}</span>
            <span className="text-slate-400 text-sm">/ {item.priceUnit || 'service'}</span>
          </div>

          {/* Actions Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-50">
            {/* Quantity Stepper - disabled for increase beyond 1 */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateQuantity(item.serviceId, Math.max(1, item.quantity - 1), item.variant)}
                disabled={item.quantity <= 1}
                className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-semibold text-slate-800">{item.quantity}</span>
              {/* ✅ Plus button disabled because quantity cannot exceed 1 */}
              <button
                onClick={() => onUpdateQuantity(item.serviceId, item.quantity + 1, item.variant)}
                disabled={item.quantity >= 1}
                className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Item Total */}
            <div className="text-right">
              <p className="text-xs text-slate-400">Item Total</p>
              <p className="text-lg font-bold text-slate-800">₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Price Breakdown ──────────────────────────────────────────────
const PriceBreakdown = ({ cartTotal, itemCount }) => {
  const subtotal = cartTotal;
  const platformFee = 29;
  const gst = subtotal * 0.18;
  const total = subtotal + platformFee + gst;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5 text-emerald-600" />
        Price Details
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Price ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span className="font-medium text-slate-700">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Platform Fee</span>
          <span className="font-medium text-slate-700">₹{platformFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">GST (18%)</span>
          <span className="font-medium text-slate-700">₹{gst.toFixed(2)}</span>
        </div>
        <div className="border-t border-slate-100 pt-3 mt-3">
          <div className="flex justify-between">
            <span className="font-bold text-slate-800">Total Amount</span>
            <span className="text-2xl font-bold text-slate-900">₹{total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Inclusive of all taxes</p>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-5 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Secure checkout
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Truck className="w-3.5 h-3.5 text-blue-500" />
          Free cancellation before service
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          Same day service available
        </div>
      </div>
    </div>
  );
};

// ─── Promo Code Input ─────────────────────────────────────────────
const PromoCode = () => {
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <Gift className="w-4 h-4 text-emerald-600" />
        Apply Promo Code
      </h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
        <button
          onClick={() => code && setApplied(true)}
          disabled={!code || applied}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
            ${applied
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20'
            }`}
        >
          {applied ? 'Applied!' : 'Apply'}
        </button>
      </div>
      {applied && (
        <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
          <Percent className="w-4 h-4" />
          <span>20% discount applied!</span>
          <button onClick={() => { setApplied(false); setCode(''); }} className="ml-auto text-slate-400 hover:text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────
const CartPage = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Shopping Cart</h1>
              <p className="text-slate-500 text-sm mt-0.5">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ═══ LEFT: Cart Items ═══ */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Clear Cart Button */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Review your items before checkout
              </p>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Cart
              </button>
            </div>

            {/* Items */}
            {cartItems.map(item => (
              <CartItem
                key={`${item.serviceId}-${item.variant}`}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}

            {/* Continue Shopping */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>

          {/* ═══ RIGHT: Summary ═══ */}
          <div className="lg:w-96 flex-shrink-0 space-y-5">
            <div className="sticky top-6 space-y-5">
              <PriceBreakdown cartTotal={cartTotal} itemCount={cartItems.length} />
              <PromoCode />

              {/* Checkout Button */}
              <Link
                to="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>

              {/* Saved for later (placeholder) */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Saved for Later
                </h3>
                <p className="text-sm text-slate-500">No items saved yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center animate-scaleIn">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Clear your cart?</h3>
            <p className="text-slate-500 mb-6">
              Are you sure you want to remove all {cartItems.length} items from your cart? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Keep Items
              </button>
              <button
                onClick={() => { clearCart(); setShowClearConfirm(false); }}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;