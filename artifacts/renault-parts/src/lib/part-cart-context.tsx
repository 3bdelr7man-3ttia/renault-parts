import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartPart {
  id: number;
  label: string;
  price: number;
}

export interface CartPackage {
  id: number;
  name: string;
  slug: string;
  price: number;
}

interface PartCartContextValue {
  items: CartPart[];
  addPart: (part: CartPart) => void;
  removePart: (id: number) => void;
  hasItem: (id: number) => boolean;
  total: number;
  clear: () => void;
  clearPartCart: () => void;

  cartPackage: CartPackage | null;
  setCartPackage: (pkg: CartPackage | null) => void;
  pkgJustAdded: boolean;
  consumePkgJustAdded: () => void;

  grandTotal: number;
}

const PartCartContext = createContext<PartCartContextValue | null>(null);
const LS_KEY     = 'renopack_part_cart';
const LS_PKG_KEY = 'renopack_cart_package';

export function PartCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartPart[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as CartPart[]) : [];
    } catch { return []; }
  });

  const [cartPackage, setCartPackageState] = useState<CartPackage | null>(() => {
    try {
      const raw = localStorage.getItem(LS_PKG_KEY);
      return raw ? (JSON.parse(raw) as CartPackage) : null;
    } catch { return null; }
  });

  const [pkgJustAdded, setPkgJustAdded] = useState(false);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (cartPackage) localStorage.setItem(LS_PKG_KEY, JSON.stringify(cartPackage));
    else localStorage.removeItem(LS_PKG_KEY);
  }, [cartPackage]);

  const addPart = (part: CartPart) =>
    setItems(prev => prev.some(p => p.id === part.id) ? prev : [...prev, part]);

  const removePart = (id: number) =>
    setItems(prev => prev.filter(p => p.id !== id));

  const hasItem = (id: number) => items.some(p => p.id === id);

  const total = items.reduce((sum, p) => sum + p.price, 0);
  const grandTotal = total + (cartPackage?.price ?? 0);

  const clear = () => { setItems([]); setCartPackageState(null); };
  const clearPartCart = () => setItems([]);

  const setCartPackage = (pkg: CartPackage | null) => {
    setCartPackageState(pkg);
    if (pkg) setPkgJustAdded(true);
  };

  const consumePkgJustAdded = () => setPkgJustAdded(false);

  return (
    <PartCartContext.Provider value={{
      items, addPart, removePart, hasItem, total, clear, clearPartCart,
      cartPackage, setCartPackage, pkgJustAdded, consumePkgJustAdded,
      grandTotal,
    }}>
      {children}
    </PartCartContext.Provider>
  );
}

export function usePartCart() {
  const ctx = useContext(PartCartContext);
  if (!ctx) throw new Error('usePartCart must be inside PartCartProvider');
  return ctx;
}
