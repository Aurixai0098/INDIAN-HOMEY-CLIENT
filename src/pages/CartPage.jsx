// src/pages/CartPage.jsx
import { useCart  } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
const CartPage = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();

   useEffect(()=>{
      window.scrollTo(0,0)
    },[])
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <Link to="/" className="text-emerald-600 hover:underline">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
      <div className="space-y-4">
        {cartItems.map(item => (
          <div key={`${item.serviceId}-${item.variant}`} className="bg-white p-4 rounded-xl shadow-sm border flex flex-wrap justify-between items-center">
            <div className="flex gap-4 items-center">
              {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />}
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">₹{item.price} / {item.priceUnit}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => updateQuantity(item.serviceId, item.quantity - 1, item.variant)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200">-</button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.serviceId, item.quantity + 1, item.variant)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200">+</button>
              <button onClick={() => removeFromCart(item.serviceId, item.variant)} className="text-red-500 hover:text-red-700 ml-4">Remove</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 border-t pt-6 flex justify-between items-center">
        <div className="text-xl font-bold">Total: ₹{cartTotal}</div>
        <button onClick={clearCart} className="text-red-600 hover:underline">Clear Cart</button>
        <Link to="/checkout" className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default CartPage;