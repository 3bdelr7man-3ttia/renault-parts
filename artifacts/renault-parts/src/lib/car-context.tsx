import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CarSelection {
  model: string;
  year: number;
}

interface CarContextType {
  car: CarSelection | null;
  setCar: (car: CarSelection | null) => void;
  clearCar: () => void;
}

const CarContext = createContext<CarContextType | undefined>(undefined);

const SESSION_KEY = 'renault_car_selection';

/**
 * Estimate the recommended km service tier based on car age.
 * Assumes ~15,000 km/year average Egyptian driving.
 * Returns the kmService value (20000 / 40000 / 60000 / 100000).
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
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? (JSON.parse(saved) as CarSelection) : null;
    } catch {
      return null;
    }
  });

  const setCar = (selection: CarSelection | null) => {
    setCarState(selection);
    if (selection) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(selection));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  };

  const clearCar = () => setCar(null);

  return (
    <CarContext.Provider value={{ car, setCar, clearCar }}>
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
