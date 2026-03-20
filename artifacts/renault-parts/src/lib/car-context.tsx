import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CarSelection {
  model: string;
  year: number;
}

interface CarContextType {
  car: CarSelection | null;
  setCar: (car: CarSelection | null) => void;
  clearCar: () => void;
  /** Seed the car from user DB data — only applies if car is not already set locally */
  syncFromUser: (model: string | null | undefined, year: number | null | undefined) => void;
}

const CarContext = createContext<CarContextType | undefined>(undefined);

const STORAGE_KEY = 'renault_car_selection';

/**
 * Estimate the recommended km service tier based on car age.
 * Assumes ~15,000 km/year average Egyptian driving.
 */
export function getRecommendedKm(carYear: number): number {
  const currentYear = new Date().getFullYear();
  const ageYears = currentYear - carYear;
  const estimatedKm = ageYears * 15000;
  if (estimatedKm < 30000) return 20000;
  if (estimatedKm < 50000) return 40000;
  if (estimatedKm < 80000) return 60000;
  return 100000;
}

export const RENAULT_MODELS = [
  'Renault Logan',
  'Renault Symbol',
  'Renault Duster',
  'Renault Megane',
  'Renault Clio',
  'Renault Fluence',
  'Renault Sandero',
  'Renault Kwid',
  'Renault Captur',
];

const currentYear = new Date().getFullYear();
export const CAR_YEARS = Array.from({ length: 20 }, (_, i) => currentYear - i);

export const CarProvider = ({ children }: { children: ReactNode }) => {
  const [car, setCarState] = useState<CarSelection | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as CarSelection) : null;
    } catch {
      return null;
    }
  });

  const setCar = (selection: CarSelection | null) => {
    setCarState(selection);
    if (selection) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const clearCar = () => setCar(null);

  /**
   * Sync car from user DB profile.
   * If localStorage already has a car, we prefer that (user may have changed it locally).
   * If localStorage is empty but user DB has a car → load from DB.
   */
  const syncFromUser = (model: string | null | undefined, year: number | null | undefined) => {
    if (!model || !year) return;
    setCarState(prev => {
      if (prev) return prev; // already set locally, don't overwrite
      const fromDb: CarSelection = { model, year };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fromDb));
      return fromDb;
    });
  };

  return (
    <CarContext.Provider value={{ car, setCar, clearCar, syncFromUser }}>
      {children}
    </CarContext.Provider>
  );
};

export const useCar = () => {
  const context = useContext(CarContext);
  if (context === undefined) {
    throw new Error('useCar must be used within a CarProvider');
  }
  return context;
};
