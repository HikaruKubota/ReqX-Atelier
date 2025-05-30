import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VariablesModal } from '../VariablesModal';

// Mock the stores and hooks
vi.mock('../../store/variablesStore', () => ({
  useVariablesStore: () => ({
    getVariables: vi.fn(() => [
      { id: 'var-1', name: 'domain', value: 'https://api.example.com', enabled: true },
      { id: 'var-2', name: 'apiKey', value: 'secret-key', enabled: false },
    ]),
    addVariable: vi.fn(),
    updateVariable: vi.fn(),
    deleteVariable: vi.fn(),
    validateVariableName: vi.fn((name) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)),
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { variables?: string }) => {
      const translations: Record<string, string> = {
        'variables_modal_title': 'Variables',
        'variables_modal_add': 'Add Variable',
        'variables_modal_name': 'Name',
        'variables_modal_value': 'Value',
        'variables_modal_enabled': 'Enabled',
        'variables_modal_save': 'Save',
        'variables_modal_cancel': 'Cancel',
        'variables_modal_delete': 'Delete',
        'variables_name_invalid': 'Variable name must match pattern: ^[a-zA-Z_][a-zA-Z0-9_]*$',
        'variables_name_duplicate': 'Variable name already exists',
      };
      
      if (options?.variables) {
        return translations[key]?.replace('{{variables}}', options.variables) || key;
      }
      
      return translations[key] || key;
    },
  }),
}));

describe('VariablesModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    scope: 'folders' as const,
    scopeId: 'folder-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render variables list when modal is open', () => {
    render(<VariablesModal {...defaultProps} />);

    expect(screen.getByText('Variables')).toBeInTheDocument();
    expect(screen.getByDisplayValue('domain')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://api.example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('apiKey')).toBeInTheDocument();
    expect(screen.getByDisplayValue('secret-key')).toBeInTheDocument();
  });

  it('should show enabled/disabled state correctly', () => {
    render(<VariablesModal {...defaultProps} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked(); // domain is enabled
    expect(checkboxes[1]).not.toBeChecked(); // apiKey is disabled
  });

  it('should render add variable form', () => {
    render(<VariablesModal {...defaultProps} />);

    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Value')).toBeInTheDocument();
    expect(screen.getByText('Add Variable')).toBeInTheDocument();
  });

  it('should handle adding a new variable', async () => {
    const user = userEvent.setup();
    render(<VariablesModal {...defaultProps} />);

    const nameInput = screen.getByPlaceholderText('Name');
    const valueInput = screen.getByPlaceholderText('Value');
    const addButton = screen.getByText('Add Variable');

    await user.type(nameInput, 'newVar');
    await user.type(valueInput, 'newValue');
    await user.click(addButton);

    // The add button should be enabled when name is provided
    expect(addButton).not.toBeDisabled();
  });

  it('should disable add button when name is empty', () => {
    render(<VariablesModal {...defaultProps} />);

    const addButton = screen.getByText('Add Variable');
    expect(addButton).toBeDisabled();
  });

  it('should handle modal close', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<VariablesModal {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should handle save and close', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<VariablesModal {...defaultProps} onClose={onClose} />);

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should not render when modal is closed', () => {
    render(<VariablesModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Variables')).not.toBeInTheDocument();
  });

  it('should show custom title when provided', () => {
    render(<VariablesModal {...defaultProps} title="Custom Variables Title" />);

    expect(screen.getByText('Custom Variables Title')).toBeInTheDocument();
  });
});