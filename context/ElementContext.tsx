import React, { createContext, ReactNode, useContext } from 'react';
import { User } from '@/models/UserModel';

interface ElementProvider {
  element: User;
  setElement: (_element: User) => void;
  isElementOpen: boolean;
  setIsElementOpen: (_isElementOpen: boolean) => void;
}

const ElementContext = createContext<ElementProvider | undefined>(undefined);

export const ElementProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [element, setElement] = React.useState<any>(null);
  const [isElementOpen, setIsElementOpen] = React.useState(false);
  return (
    <ElementContext.Provider
      value={{ element, setElement, isElementOpen, setIsElementOpen }}
    >
      {children}
    </ElementContext.Provider>
  );
};

export const useElement = () => {
  const context = useContext(ElementContext);
  if (!context) {
    throw new Error('useElement must be used within a ElementProvider');
  }
  return context;
};
