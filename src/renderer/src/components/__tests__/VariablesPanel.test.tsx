import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VariablesPanel } from '../VariablesPanel';
import { useVariablesStore } from '../../store/variablesStore';
import '../../i18n';

// Mock the variables store
vi.mock('../../store/variablesStore');

const mockStore = {
  globalVariables: {},
  environments: [
    { id: 'development', name: 'Development', variables: {} },
    { id: 'staging', name: 'Staging', variables: {} },
    { id: 'production', name: 'Production', variables: {} },
  ],
  activeEnvironmentId: 'development',
  addGlobalVariable: vi.fn(),
  updateGlobalVariable: vi.fn(),
  deleteGlobalVariable: vi.fn(),
  addEnvironmentVariable: vi.fn(),
  updateEnvironmentVariable: vi.fn(),
  deleteEnvironmentVariable: vi.fn(),
};

describe('VariablesPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useVariablesStore as any).mockReturnValue(mockStore);
  });

  it('should render when open', () => {
    render(<VariablesPanel isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText(/Variables - Development/)).toBeInTheDocument();
    expect(screen.getByText('Global Variables (All Environments)')).toBeInTheDocument();
    expect(screen.getByText('Environment Variables (Development)')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    const { container } = render(<VariablesPanel isOpen={false} onClose={vi.fn()} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<VariablesPanel isOpen={true} onClose={onClose} />);
    
    const closeButton = screen.getByRole('button', { name: '' }); // Close button has no text
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  describe('Global Variables', () => {
    it('should display global variables', () => {
      const storeWithVars = {
        ...mockStore,
        globalVariables: {
          API_KEY: { name: 'API_KEY', value: '12345', enabled: true },
          API_URL: { name: 'API_URL', value: 'https://api.example.com', enabled: false, secure: true },
        },
      };
      (useVariablesStore as any).mockReturnValue(storeWithVars);

      render(<VariablesPanel isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByText('API_KEY')).toBeInTheDocument();
      expect(screen.getByText('12345')).toBeInTheDocument();
      expect(screen.getByText('API_URL')).toBeInTheDocument();
      expect(screen.getByText('•••••••••')).toBeInTheDocument(); // Secure variable
    });

    it('should add a new global variable', async () => {
      const user = userEvent.setup();
      render(<VariablesPanel isOpen={true} onClose={vi.fn()} />);
      
      // Click add global variable button
      const addButton = screen.getByText('+ Add Global Variable');
      await user.click(addButton);
      
      // Fill in the form
      const nameInput = screen.getAllByPlaceholderText('Variable name')[0];
      const valueInput = screen.getAllByPlaceholderText('Value')[0];
      
      await user.type(nameInput, 'NEW_VAR');
      await user.type(valueInput, 'new-value');
      
      // Submit
      const submitButton = screen.getAllByText('Add')[0];
      await user.click(submitButton);
      
      expect(mockStore.addGlobalVariable).toHaveBeenCalledWith({
        name: 'NEW_VAR',
        value: 'new-value',
        enabled: true,
        secure: false,
      });
    });

    it('should add a secure global variable', async () => {
      const user = userEvent.setup();
      render(<VariablesPanel isOpen={true} onClose={vi.fn()} />);
      
      // Click add global variable button
      const addButton = screen.getByText('+ Add Global Variable');
      await user.click(addButton);
      
      // Fill in the form
      const nameInput = screen.getAllByPlaceholderText('Variable name')[0];
      const valueInput = screen.getAllByPlaceholderText('Value')[0];
      const secureCheckbox = screen.getAllByRole('checkbox')[0];
      
      await user.type(nameInput, 'SECRET_KEY');
      await user.type(valueInput, 'secret-value');
      await user.click(secureCheckbox);
      
      // Submit
      const submitButton = screen.getAllByText('Add')[0];
      await user.click(submitButton);
      
      expect(mockStore.addGlobalVariable).toHaveBeenCalledWith({
        name: 'SECRET_KEY',
        value: 'secret-value',
        enabled: true,
        secure: true,
      });
    });
  });

  describe('Environment Variables', () => {
    it('should display environment variables', () => {
      const storeWithEnvVars = {
        ...mockStore,
        environments: [
          {
            id: 'development',
            name: 'Development',
            variables: {
              DB_HOST: { name: 'DB_HOST', value: 'localhost', enabled: true },
              DB_PORT: { name: 'DB_PORT', value: '5432', enabled: true },
            },
          },
          { id: 'staging', name: 'Staging', variables: {} },
          { id: 'production', name: 'Production', variables: {} },
        ],
      };
      (useVariablesStore as any).mockReturnValue(storeWithEnvVars);

      render(<VariablesPanel isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByText('DB_HOST')).toBeInTheDocument();
      expect(screen.getByText('localhost')).toBeInTheDocument();
      expect(screen.getByText('DB_PORT')).toBeInTheDocument();
      expect(screen.getByText('5432')).toBeInTheDocument();
    });

    it('should add a new environment variable', async () => {
      const user = userEvent.setup();
      render(<VariablesPanel isOpen={true} onClose={vi.fn()} />);
      
      // Click add environment variable button
      const addButton = screen.getByText('+ Add Environment Variable');
      await user.click(addButton);
      
      // Fill in the form
      const nameInputs = screen.getAllByPlaceholderText('Variable name');
      const valueInputs = screen.getAllByPlaceholderText('Value');
      
      await user.type(nameInputs[nameInputs.length - 1], 'ENV_VAR');
      await user.type(valueInputs[valueInputs.length - 1], 'env-value');
      
      // Submit
      const submitButtons = screen.getAllByText('Add');
      await user.click(submitButtons[submitButtons.length - 1]);
      
      expect(mockStore.addEnvironmentVariable).toHaveBeenCalledWith('development', {
        name: 'ENV_VAR',
        value: 'env-value',
        enabled: true,
        secure: false,
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter variables based on search query', async () => {
      const user = userEvent.setup();
      const storeWithVars = {
        ...mockStore,
        globalVariables: {
          API_KEY: { name: 'API_KEY', value: 'key-123', enabled: true },
          DATABASE_URL: { name: 'DATABASE_URL', value: 'postgres://localhost', enabled: true },
          SECRET_TOKEN: { name: 'SECRET_TOKEN', value: 'token-456', enabled: true },
        },
      };
      (useVariablesStore as any).mockReturnValue(storeWithVars);

      render(<VariablesPanel isOpen={true} onClose={vi.fn()} />);
      
      // Initially all variables should be visible
      expect(screen.getByText('API_KEY')).toBeInTheDocument();
      expect(screen.getByText('DATABASE_URL')).toBeInTheDocument();
      expect(screen.getByText('SECRET_TOKEN')).toBeInTheDocument();
      
      // Search for "API"
      const searchInput = screen.getByPlaceholderText('Search all variables...');
      await user.type(searchInput, 'API');
      
      // Only API_KEY should be visible
      expect(screen.getByText('API_KEY')).toBeInTheDocument();
      expect(screen.queryByText('DATABASE_URL')).not.toBeInTheDocument();
      expect(screen.queryByText('SECRET_TOKEN')).not.toBeInTheDocument();
    });

    it('should search by value as well as name', async () => {
      const user = userEvent.setup();
      const storeWithVars = {
        ...mockStore,
        globalVariables: {
          VAR1: { name: 'VAR1', value: 'localhost', enabled: true },
          VAR2: { name: 'VAR2', value: 'example.com', enabled: true },
        },
      };
      (useVariablesStore as any).mockReturnValue(storeWithVars);

      render(<VariablesPanel isOpen={true} onClose={vi.fn()} />);
      
      const searchInput = screen.getByPlaceholderText('Search all variables...');
      await user.type(searchInput, 'localhost');
      
      expect(screen.getByText('VAR1')).toBeInTheDocument();
      expect(screen.queryByText('VAR2')).not.toBeInTheDocument();
    });
  });

  describe('Variable Row Actions', () => {
    it('should toggle variable enabled state', async () => {
      const user = userEvent.setup();
      const storeWithVars = {
        ...mockStore,
        globalVariables: {
          TEST_VAR: { name: 'TEST_VAR', value: 'test', enabled: true },
        },
      };
      (useVariablesStore as any).mockReturnValue(storeWithVars);

      render(<VariablesPanel isOpen={true} onClose={vi.fn()} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
      
      await user.click(checkbox);
      
      expect(mockStore.updateGlobalVariable).toHaveBeenCalledWith('TEST_VAR', {
        enabled: false,
      });
    });

    it('should show variable with global override indicator', () => {
      const storeWithOverride = {
        ...mockStore,
        globalVariables: {
          SHARED_VAR: { name: 'SHARED_VAR', value: 'global-value', enabled: true },
        },
        environments: [
          {
            id: 'development',
            name: 'Development',
            variables: {
              SHARED_VAR: { name: 'SHARED_VAR', value: 'dev-value', enabled: true },
            },
          },
          { id: 'staging', name: 'Staging', variables: {} },
          { id: 'production', name: 'Production', variables: {} },
        ],
      };
      (useVariablesStore as any).mockReturnValue(storeWithOverride);

      render(<VariablesPanel isOpen={true} onClose={vi.fn()} />);
      
      // The environment variable should show override indicator
      const envSection = screen.getByText('Environment Variables (Development)').parentElement?.parentElement;
      expect(envSection).toHaveTextContent('ⓘ');
    });
  });

  describe('No Variables State', () => {
    it('should show empty state for global variables', () => {
      render(<VariablesPanel isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByText('No global variables found')).toBeInTheDocument();
    });

    it('should show empty state for environment variables', () => {
      render(<VariablesPanel isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByText('No environment variables found')).toBeInTheDocument();
    });
  });
});