import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

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
const LS_KEY_PREFIX = 'renopack_part_cart';
const LS_PKG_KEY_PREFIX = 'renopack_cart_package';
const GUEST_SCOPE = 'guest';

function isUserScope(scope: string): boolean {
  return scope.startsWith('user:');
}

function readCartItems(storageKey: string): CartPart[] {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as CartPart[]) : [];
  } catch {
    return [];
  }
}

function readCartPackage(storageKey: string): CartPackage | null {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as CartPackage) : null;
  } catch {
    return null;
  }
}

export function PartCartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const storageScope = useMemo(() => (user?.id ? `user:${user.id}` : GUEST_SCOPE), [user?.id]);
  const itemsStorageKey = `${LS_KEY_PREFIX}:${storageScope}`;
  const packageStorageKey = `${LS_PKG_KEY_PREFIX}:${storageScope}`;
  const activeScopeRef = useRef(storageScope);
  const [items, setItems] = useState<CartPart[]>(() => readCartItems(`${LS_KEY_PREFIX}:${GUEST_SCOPE}`));
  const [cartPackage, setCartPackageState] = useState<CartPackage | null>(() => readCartPackage(`${LS_PKG_KEY_PREFIX}:${GUEST_SCOPE}`));
  const [pkgJustAdded, setPkgJustAdded] = useState(false);

  useEffect(() => {
    localStorage.removeItem(LS_KEY_PREFIX);
    localStorage.removeItem(LS_PKG_KEY_PREFIX);
  }, []);

  useEffect(() => {
    if (activeScopeRef.current === storageScope) return;
    const previousScope = activeScopeRef.current;
    activeScopeRef.current = storageScope;

    if (isUserScope(previousScope) && storageScope === GUEST_SCOPE) {
      localStorage.removeItem(`${LS_KEY_PREFIX}:${GUEST_SCOPE}`);
      localStorage.removeItem(`${LS_PKG_KEY_PREFIX}:${GUEST_SCOPE}`);
      setItems([]);
      setCartPackageState(null);
    } else {
      setItems(readCartItems(itemsStorageKey));
      setCartPackageState(readCartPackage(packageStorageKey));
    }

    setPkgJustAdded(false);
  }, [itemsStorageKey, packageStorageKey, storageScope]);

  useEffect(() => {
    if (items.length > 0) localStorage.setItem(itemsStorageKey, JSON.stringify(items));
    else localStorage.removeItem(itemsStorageKey);
  }, [items, itemsStorageKey]);

  useEffect(() => {
    if (cartPackage) localStorage.setItem(packageStorageKey, JSON.stringify(cartPackage));
    else localStorage.removeItem(packageStorageKey);
  }, [cartPackage, packageStorageKey]);

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
