'use client';

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useSearchParams } from 'next/navigation';

interface ElementsURLParamsContextType {
  urlParams: Record<string, any>;
  updateUrlParams: (_newParams: Record<string, any>) => void;
}

const ElementsURLParamsContext = createContext<
  ElementsURLParamsContextType | undefined
>(undefined);

export const ElementsURLParamsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [urlParams, setUrlParams] = useState<Record<string, any>>({});
  const searchParams = useSearchParams();

  useEffect(() => {
    const params: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    setUrlParams(params);
  }, [searchParams]);

  const updateUrlParams = (newParams: Record<string, string | undefined>) => {
    const updatedParams = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(newParams)) {
      if (
        value === undefined ||
        value === null ||
        (Array.isArray(value) && value.length === 0) ||
        (key === 'page' && value === '1') ||
        (key === 'limit' && value === '10')
      ) {
        updatedParams.delete(key);
      } else {
        updatedParams.set(key, String(value));
      }
    }

    const newUrl = `${window.location.pathname}?${updatedParams.toString()}`;
    window.history.pushState(null, '', newUrl);
    setUrlParams(Object.fromEntries(updatedParams.entries()));
  };

  return (
    <ElementsURLParamsContext.Provider value={{ urlParams, updateUrlParams }}>
      {children}
    </ElementsURLParamsContext.Provider>
  );
};

export const useElementsURLParams = () => {
  const context = useContext(ElementsURLParamsContext);
  if (!context) {
    throw new Error(
      'useElementsURLParams must be used within a ElementsURLParamsProvider'
    );
  }
  return context;
};
