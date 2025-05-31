import React from 'react';
import { vi } from 'vitest';

// Mock useTranslation hook
export const useTranslation = () => {
  return {
    t: (key: string) => {
      // Return the actual English translations for the keys used in tests
      const translations: Record<string, string> = {
        extract_variables: 'Extract Variables',
        extract_variables_desc: 'Extract values from response and save as variables',
        variable_name: 'Variable Name',
        extract_from: 'Extract From',
        add_extraction_rule: '+ Add Extraction Rule',
        will_set_variable: 'Will set',
        from: 'from',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  };
};

// Mock Trans component
export const Trans = ({ children }: { children: React.ReactNode }) => children;

// Mock initReactI18next
export const initReactI18next = {
  type: '3rdParty',
  init: vi.fn(),
};
