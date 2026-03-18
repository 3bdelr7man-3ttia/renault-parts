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
