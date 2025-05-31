import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VariableExtractionEditor } from '../VariableExtractionEditor';
import type { VariableExtraction } from '../../types';

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
          enabled: true
        }
      ],
      customScript: ''
    };

    render(
      <VariableExtractionEditor 
        variableExtraction={variableExtraction} 
        onChange={mockOnChange} 
      />
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
          enabled: true
        })
      ]),
      customScript: '',
      enabled: true
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
          enabled: true
        }
      ],
      customScript: ''
    };

    render(
      <VariableExtractionEditor 
        variableExtraction={variableExtraction} 
        onChange={mockOnChange} 
      />
    );
    
    const pathInput = screen.getByDisplayValue('$.token');
    fireEvent.change(pathInput, { target: { value: '$.data.token' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      extractionRules: [
        expect.objectContaining({
          id: '1',
          path: '$.data.token'
        })
      ],
      customScript: '',
      enabled: true
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
          enabled: true
        }
      ],
      customScript: ''
    };

    render(
      <VariableExtractionEditor 
        variableExtraction={variableExtraction} 
        onChange={mockOnChange} 
      />
    );
    
    expect(screen.getByText('Will set')).toBeInTheDocument();
    expect(screen.getByText('$authToken')).toBeInTheDocument();
    expect(screen.getByText('$.token')).toBeInTheDocument();
  });
});