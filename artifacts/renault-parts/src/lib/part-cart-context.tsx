import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartPart {
  id: number;
  label: string;
  price: number;
}

interface PartCartContextValue {
  items: CartPart[];
  addPart: (part: CartPart) => void;
  removePart: (id: number) => void;
  hasItem: (id: number) => boolean;
  total: number;
  clear: () => void;
}

const PartCartContext = createContext<PartCartContextValue | null>(null);
const LS_KEY = 'renopack_part_cart';

export function PartCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartPart[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as CartPart[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const addPart = (part: CartPart) =>
    setItems(prev => prev.some(p => p.id === part.id) ? prev : [...prev, part]);

  const removePart = (id: number) =>
    setItems(prev => prev.filter(p => p.id !== id));

  const hasItem = (id: number) => items.some(p => p.id === id);

  const total = items.reduce((sum, p) => sum + p.price, 0);

  const clear = () => setItems([]);

  return (
    <PartCartContext.Provider value={{ items, addPart, removePart, hasItem, total, clear }}>
      {children}
    </PartCartContext.Provider>
  );
}

export function usePartCart() {
  const ctx = useContext(PartCartContext);
  if (!ctx) throw new Error('usePartCart must be inside PartCartProvider');
  return ctx;
}
