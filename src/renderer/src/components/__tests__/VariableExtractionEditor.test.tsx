import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VariableExtractionEditor } from '../VariableExtractionEditor';
import type { VariableExtraction } from '../../types';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
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
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}));

describe('VariableExtractionEditor', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with no initial rules', () => {
    render(<VariableExtractionEditor onChange={mockOnChange} />);

    expect(screen.getByText('Extract Variables')).toBeInTheDocument();
    expect(screen.getByText('+ Add Extraction Rule')).toBeInTheDocument();
  });

  it('renders with existing rules', () => {
    const variableExtraction: VariableExtraction = {
      enabled: true,
      extractionRules: [
        {
          id: '1',
          source: 'body-json',
          path: '$.token',
          variableName: 'authToken',
          scope: 'environment',
          enabled: true,
        },
      ],
      customScript: '',
    };

    render(
      <VariableExtractionEditor variableExtraction={variableExtraction} onChange={mockOnChange} />,
    );

    expect(screen.getByDisplayValue('$.token')).toBeInTheDocument();
    expect(screen.getByDisplayValue('authToken')).toBeInTheDocument();
  });

  it('adds a new rule when Add button is clicked', () => {
    render(<VariableExtractionEditor onChange={mockOnChange} />);

    const addButton = screen.getByText('+ Add Extraction Rule');
    fireEvent.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      extractionRules: expect.arrayContaining([
        expect.objectContaining({
          source: 'body-json',
          path: '',
          variableName: '',
          scope: 'environment',
          enabled: true,
        }),
      ]),
      customScript: '',
      enabled: true,
    });
  });

  it('updates rule when input changes', () => {
    const variableExtraction: VariableExtraction = {
      enabled: true,
      extractionRules: [
        {
          id: '1',
          source: 'body-json',
          path: '$.token',
          variableName: 'authToken',
          scope: 'environment',
          enabled: true,
        },
      ],
      customScript: '',
    };

    render(
      <VariableExtractionEditor variableExtraction={variableExtraction} onChange={mockOnChange} />,
    );

    const pathInput = screen.getByDisplayValue('$.token');
    fireEvent.change(pathInput, { target: { value: '$.data.token' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      extractionRules: [
        expect.objectContaining({
          id: '1',
          path: '$.data.token',
        }),
      ],
      customScript: '',
      enabled: true,
    });
  });

  it('shows preview text when path and variable name are provided', () => {
    const variableExtraction: VariableExtraction = {
      enabled: true,
      extractionRules: [
        {
          id: '1',
          source: 'body-json',
          path: '$.token',
          variableName: 'authToken',
          scope: 'environment',
          enabled: true,
        },
      ],
      customScript: '',
    };

    render(
      <VariableExtractionEditor variableExtraction={variableExtraction} onChange={mockOnChange} />,
    );

    // Look for the preview text paragraph that contains all the elements
    const previewText = screen.getByText((content, element) => {
      return !!(
        element?.className === 'text-xs text-gray-500 dark:text-gray-400 mt-1' &&
        content.includes('Will set') &&
        element?.textContent?.includes('$authToken') &&
        element?.textContent?.includes('$.token')
      );
    });

    expect(previewText).toBeInTheDocument();
  });
});
