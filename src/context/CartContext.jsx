// src/context/CartContext.jsx
import { createContext, useContext, useState , useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('gharseva_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('gharseva_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (service, quantity = 1, variant = null) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.serviceId === service._id && item.variant === variant
      );
      if (existingIndex >= 0) {
        // Increase quantity if same service+variant already in cart
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            serviceId: service._id,
            name: service.name,
            price: service.basePrice,
            priceUnit: service.priceUnit || 'service',
            quantity,
            variant,
            image: service.images?.[0]?.url || null
          }
        ];
      }
    });
  };

  const removeFromCart = (serviceId, variant = null) => {
    setCartItems(prev => prev.filter(item => !(item.serviceId === serviceId && item.variant === variant)));
  };

  const updateQuantity = (serviceId, quantity, variant = null) => {
    if (quantity <= 0) {
      removeFromCart(serviceId, variant);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.serviceId === serviceId && item.variant === variant
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

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
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);