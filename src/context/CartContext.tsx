import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { api } from '../services/api';

interface CartContextType {
  items: CartItem[];
  savedItems: CartItem[];
  addItem: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => void;
  removeItem: (productId: string, selectedSize?: string, selectedColor?: string) => void;
  saveForLater: (productId: string, selectedSize?: string, selectedColor?: string) => void;
  moveToCart: (productId: string, selectedSize?: string, selectedColor?: string) => void;
  removeSavedItem: (productId: string, selectedSize?: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string, selectedColor?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  discountCode: string;
  discountPercent: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  shippingFee: number;
  tax: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  notificationMessage: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedItems, setSavedItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_saved_for_later');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aura_cart_items', JSON.stringify(items));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_saved_for_later', JSON.stringify(savedItems));
    } catch (e) {
      console.warn('Saved items storage sync error:', e);
    }
  }, [savedItems]);

  const showNotification = (msg: string) => {
    setNotificationMessage(msg);
    setTimeout(() => {
      setNotificationMessage(null);
    }, 3000);
  };

  const addItem = (product: Product, quantity: number = 1, selectedSize?: string, selectedColor?: string) => {
    setItems(prevItems => {
      const existingIdx = prevItems.findIndex(
        i =>
          i.productId === product.id &&
          (i.selectedSize || '') === (selectedSize || '') &&
          (i.selectedColor || '') === (selectedColor || '')
      );

      if (existingIdx > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIdx].quantity + quantity;
        if (newQty > product.stock) {
          showNotification(`Maximum available stock reached (${product.stock} units)`);
          updated[existingIdx].quantity = product.stock;
        } else {
          updated[existingIdx].quantity = newQty;
          showNotification(`Updated quantity of "${product.name}" in your bag`);
        }
        return updated;
      } else {
        const finalQty = Math.min(quantity, Math.max(1, product.stock));
        showNotification(`Added "${product.name}" to your bag`);
        return [
          ...prevItems,
          {
            productId: product.id,
            product,
            quantity: finalQty,
            selectedSize,
            selectedColor
          }
        ];
      }
    });

    // Auto open drawer for immediate user feedback
    setIsCartOpen(true);
  };

  const removeItem = (productId: string, selectedSize?: string, selectedColor?: string) => {
    setItems(prevItems =>
      prevItems.filter(
        i =>
          !(
            i.productId === productId &&
            (i.selectedSize || '') === (selectedSize || '') &&
            (i.selectedColor || '') === (selectedColor || '')
          )
      )
    );
  };

  const saveForLater = (productId: string, selectedSize?: string, selectedColor?: string) => {
    const itemToSave = items.find(
      i =>
        i.productId === productId &&
        (i.selectedSize || '') === (selectedSize || '') &&
        (i.selectedColor || '') === (selectedColor || '')
    );
    if (!itemToSave) return;

    // Remove from active items
    removeItem(productId, selectedSize, selectedColor);

    // Add to savedItems if not already there
    setSavedItems(prev => {
      const exists = prev.some(
        i =>
          i.productId === productId &&
          (i.selectedSize || '') === (selectedSize || '') &&
          (i.selectedColor || '') === (selectedColor || '')
      );
      if (exists) return prev;
      return [...prev, itemToSave];
    });

    showNotification(`Saved "${itemToSave.product.name}" for later`);
  };

  const moveToCart = (productId: string, selectedSize?: string, selectedColor?: string) => {
    const saved = savedItems.find(
      i =>
        i.productId === productId &&
        (i.selectedSize || '') === (selectedSize || '') &&
        (i.selectedColor || '') === (selectedColor || '')
    );
    if (!saved) return;

    // Remove from saved
    setSavedItems(prev =>
      prev.filter(
        i =>
          !(
            i.productId === productId &&
            (i.selectedSize || '') === (selectedSize || '') &&
            (i.selectedColor || '') === (selectedColor || '')
          )
      )
    );

    // Add to items
    addItem(saved.product, saved.quantity, saved.selectedSize, saved.selectedColor);
    showNotification(`Moved "${saved.product.name}" back to your bag`);
  };

  const removeSavedItem = (productId: string, selectedSize?: string, selectedColor?: string) => {
    setSavedItems(prev =>
      prev.filter(
        i =>
          !(
            i.productId === productId &&
            (i.selectedSize || '') === (selectedSize || '') &&
            (i.selectedColor || '') === (selectedColor || '')
          )
      )
    );
    showNotification('Removed item from saved list');
  };

  const updateQuantity = (productId: string, quantity: number, selectedSize?: string, selectedColor?: string) => {
    if (quantity <= 0) {
      removeItem(productId, selectedSize, selectedColor);
      return;
    }

    setItems(prevItems =>
      prevItems.map(i => {
        if (
          i.productId === productId &&
          (i.selectedSize || '') === (selectedSize || '') &&
          (i.selectedColor || '') === (selectedColor || '')
        ) {
          const maxStock = i.product.stock || 99;
          return {
            ...i,
            quantity: Math.min(quantity, maxStock)
          };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setDiscountCode('');
    setDiscountPercent(0);
    localStorage.removeItem('aura_cart_items');
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.valid && res.coupon) {
        setDiscountCode(res.coupon.code);
        if (res.coupon.discountType === 'percentage') {
          setDiscountPercent(res.coupon.discountValue);
          showNotification(`Coupon applied: ${res.coupon.discountValue}% off!`);
        } else {
          const effectivePercent = subtotal > 0 ? (res.coupon.discountValue / subtotal) * 100 : 0;
          setDiscountPercent(effectivePercent);
          showNotification(`Coupon applied: ₹${res.coupon.discountValue} off!`);
        }
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Invalid coupon code' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Invalid coupon code' };
    }
  };

  const removeCoupon = () => {
    setDiscountCode('');
    setDiscountPercent(0);
    showNotification('Discount code removed');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = discountPercent > 0 ? Number(((subtotal * discountPercent) / 100).toFixed(2)) : 0;
  // Free standard express shipping on orders over ₹4,999, else ₹199
  const shippingFee = subtotal > 0 && subtotal - discount < 4999 ? 199 : 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Number((taxableAmount * 0.18).toFixed(2));
  const total = Number((taxableAmount + shippingFee + tax).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        items,
        savedItems,
        addItem,
        removeItem,
        saveForLater,
        moveToCart,
        removeSavedItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discount,
        discountCode,
        discountPercent,
        applyCoupon,
        removeCoupon,
        shippingFee,
        tax,
        total,
        isCartOpen,
        setIsCartOpen,
        notificationMessage
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
