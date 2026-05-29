// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiFetch } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch('/cart');
      if (res.success) {
        setCartItems(res.data.cart.items || []);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Failed to load cart', err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const saveCart = useCallback(async (items) => {
    if (!user) return;
    try {
      await apiFetch('/cart', {
        method: 'PUT',
        body: JSON.stringify({ items })
      });
    } catch (err) {
      console.error('Failed to save cart', err);
    }
  }, [user]);

  const updateCart = useCallback((newItems) => {
    setCartItems(newItems);
    saveCart(newItems);
  }, [saveCart]);

  const addToCart = (service, quantity = 1, variant = null, providerId = null, providerName = null) => {
    if (!user) {
      console.warn('Please login to add items to cart');
      return;
    }

    if (cartItems.length > 0 && cartItems[0].providerId !== providerId) {
      alert('You can only book services from one provider at a time. Please clear your cart or complete the current booking.');
      return;
    }

    const finalQuantity = 1;

    const existingIndex = cartItems.findIndex(
      item => item.serviceId === service._id && item.variant === variant && item.providerId === providerId
    );

    if (existingIndex !== -1) {
      return;
    }

    const categoryId = service.category?._id || service.category;
    const newItems = [
      ...cartItems,
      {
        serviceId: service._id,
        providerId: providerId,
        providerName: providerName || 'Provider',
        categoryId: categoryId,
        name: service.name,
        price: service.basePrice,
        priceUnit: service.priceUnit || 'service',
        quantity: finalQuantity,
        variant: variant,
        image: service.images?.[0]?.url || null,
      }
    ];
    updateCart(newItems);
  };

  const removeFromCart = (serviceId, variant = null, providerId = null) => {
    const newItems = cartItems.filter(
      item => !(item.serviceId === serviceId && item.variant === variant && item.providerId === providerId)
    );
    updateCart(newItems);
  };

  const updateQuantity = (serviceId, quantity, variant = null, providerId = null) => {
    if (quantity > 1) quantity = 1;
    if (quantity <= 0) {
      removeFromCart(serviceId, variant, providerId);
      return;
    }
    const newItems = cartItems.map(item =>
      item.serviceId === serviceId && item.variant === variant && item.providerId === providerId
        ? { ...item, quantity }
        : item
    );
    updateCart(newItems);
  };

  const clearCart = () => {
    updateCart([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);