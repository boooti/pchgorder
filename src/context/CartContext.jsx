import React, { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [customizeProduct, setCustomizeProduct] = useState(null); // Product selected for customization
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [subsidyAmountPerPerson, setSubsidyAmountPerPerson] = useState(20000);
  const [isSubsidyEnabled, setIsSubsidyEnabled] = useState(true);

  // Add item to cart
  const addToCart = (item) => {
    setCartItems(prev => {
      // Check if exact same item configuration AND recipient exists
      const itemRecipientId = item.recipientEmployee ? item.recipientEmployee.id : null;
      const existingIdx = prev.findIndex(i => {
        const prevRecipientId = i.recipientEmployee ? i.recipientEmployee.id : null;
        return (
          i.product_name === item.product_name &&
          i.size === item.size &&
          i.sugar_option === item.sugar_option &&
          i.ice_option === item.ice_option &&
          JSON.stringify(i.toppings) === JSON.stringify(item.toppings) &&
          (i.note || '') === (item.note || '') &&
          prevRecipientId === itemRecipientId
        );
      });

      if (existingIdx > -1) {
        const copy = [...prev];
        const current = copy[existingIdx];
        const newQty = current.quantity + item.quantity;
        const unitTotal = current.unit_price + current.toppings.reduce((sum, t) => sum + t.price, 0);
        copy[existingIdx] = {
          ...current,
          quantity: newQty,
          subtotal: unitTotal * newQty
        };
        return copy;
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (index, delta) => {
    setCartItems(prev => {
      const copy = [...prev];
      const target = copy[index];
      if (!target) return prev;

      const newQty = target.quantity + delta;
      if (newQty <= 0) {
        return copy.filter((_, i) => i !== index);
      }

      const unitTotal = target.unit_price + target.toppings.reduce((sum, t) => sum + t.price, 0);
      copy[index] = {
        ...target,
        quantity: newQty,
        subtotal: unitTotal * newQty
      };
      return copy;
    });
  };

  const removeFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Total amount calculations
  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, i) => sum + i.subtotal, 0);
  }, [cartItems]);

  const totalCups = useMemo(() => {
    return cartItems.reduce((sum, i) => sum + i.quantity, 0);
  }, [cartItems]);

  const subsidy = useMemo(() => {
    if (!isSubsidyEnabled || cartItems.length === 0) return 0;
    return Math.min(totalAmount, subsidyAmountPerPerson);
  }, [totalAmount, isSubsidyEnabled, subsidyAmountPerPerson]);

  const employeePay = useMemo(() => {
    return Math.max(0, totalAmount - subsidy);
  }, [totalAmount, subsidy]);

  return (
    <CartContext.Provider value={{
      cartItems,
      setCartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalAmount,
      totalCups,
      subsidy,
      employeePay,
      customizeProduct,
      setCustomizeProduct,
      isCartOpen,
      setIsCartOpen,
      isSubsidyEnabled,
      setIsSubsidyEnabled,
      subsidyAmountPerPerson,
      setSubsidyAmountPerPerson
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
