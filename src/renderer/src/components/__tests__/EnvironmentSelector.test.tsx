import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnvironmentSelector } from '../EnvironmentSelector';
import { useVariablesStore } from '../../store/variablesStore';

// Mock the variables store
vi.mock('../../store/variablesStore');

const mockStore = {
  environments: [
    { id: 'development', name: 'Development', variables: {} },
    { id: 'staging', name: 'Staging', variables: {} },
    { id: 'production', name: 'Production', variables: {} },
  ],
  activeEnvironmentId: 'development',
  setActiveEnvironment: vi.fn(),
  addEnvironment: vi.fn(),
};

describe('EnvironmentSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useVariablesStore).mockReturnValue(mockStore as ReturnType<typeof useVariablesStore>);
  });

  it('should display the active environment', () => {
    render(<EnvironmentSelector />);

    expect(screen.getByText('Environment: Development')).toBeInTheDocument();
  });

  it('should display "None" when no active environment', () => {
    vi.mocked(useVariablesStore).mockReturnValue({
      ...mockStore,
      activeEnvironmentId: 'non-existent',
      environments: [],
    } as ReturnType<typeof useVariablesStore>);

    render(<EnvironmentSelector />);

    expect(screen.getByText('Environment: None')).toBeInTheDocument();
  });

  it('should toggle dropdown when button is clicked', async () => {
    const user = userEvent.setup();
    render(<EnvironmentSelector />);

    // Initially dropdown should not be visible
    expect(screen.queryByText('Staging')).not.toBeInTheDocument();

    // Click to open
    const button = screen.getByRole('button', { name: /Environment: Development/i });
    await user.click(button);

    // Dropdown should be visible
    expect(screen.getByText('Staging')).toBeInTheDocument();
    expect(screen.getByText('Production')).toBeInTheDocument();

    // Click again to close
    await user.click(button);

    // Dropdown should be hidden
    await waitFor(() => {
      expect(screen.queryByText('Staging')).not.toBeInTheDocument();
    });
  });

  it('should show checkmark for active environment', async () => {
    const user = userEvent.setup();
    render(<EnvironmentSelector />);

    const button = screen.getByRole('button');
    await user.click(button);

    // Development should have checkmark
    const devButton = screen.getByRole('button', { name: /✓.*Development/i });
    expect(devButton).toBeInTheDocument();
    expect(devButton).toHaveClass('bg-muted');

    // Others should not have checkmark
    expect(screen.getByRole('button', { name: 'Staging' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Production' })).toBeInTheDocument();
  });

  it('should switch environment when clicked', async () => {
    const user = userEvent.setup();
    render(<EnvironmentSelector />);

    // Open dropdown
    await user.click(screen.getByRole('button', { name: /Environment: Development/i }));

    // Click on Staging
    await user.click(screen.getByRole('button', { name: 'Staging' }));

    expect(mockStore.setActiveEnvironment).toHaveBeenCalledWith('staging');
  });

  it('should close dropdown after selecting environment', async () => {
    const user = userEvent.setup();
    render(<EnvironmentSelector />);

    // Open dropdown
    await user.click(screen.getByRole('button', { name: /Environment: Development/i }));
    expect(screen.getByText('Staging')).toBeInTheDocument();

    // Select environment
    await user.click(screen.getByRole('button', { name: 'Production' }));

    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByText('Staging')).not.toBeInTheDocument();
    });
  });

  it('should show add environment option', async () => {
    const user = userEvent.setup();
    render(<EnvironmentSelector />);

    await user.click(screen.getByRole('button', { name: /Environment: Development/i }));

    expect(screen.getByText('Add Custom Environment...')).toBeInTheDocument();
  });

  it('should show input form when add environment is clicked', async () => {
    const user = userEvent.setup();
    render(<EnvironmentSelector />);

    await user.click(screen.getByRole('button', { name: /Environment: Development/i }));
    await user.click(screen.getByText('Add Custom Environment...'));

    expect(screen.getByPlaceholderText('Environment name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should add new environment', async () => {
    const user = userEvent.setup();
    render(<EnvironmentSelector />);

    // Open dropdown and click add
    await user.click(screen.getByRole('button', { name: /Environment: Development/i }));
    await user.click(screen.getByText('Add Custom Environment...'));

    // Type new environment name
    const input = screen.getByPlaceholderText('Environment name');
    await user.type(input, 'Test Environment');

    // Submit
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(mockStore.addEnvironment).toHaveBeenCalledWith({
      id: 'test-environment',
      name: 'Test Environment',
      variables: {},
    });
    expect(mockStore.setActiveEnvironment).toHaveBeenCalledWith('test-environment');
  });

  it('should handle spaces in environment name', async () => {
    const user = userEvent.setup();
    render(<EnvironmentSelector />);

    await user.click(screen.getByRole('button', { name: /Environment: Development/i }));
    await user.click(screen.getByText('Add Custom Environment...'));

    const input = screen.getByPlaceholderText('Environment name');
    await user.type(input, 'My Test  Env');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(mockStore.addEnvironment).toHaveBeenCalledWith({
      id: 'my-test-env',
      name: 'My Test  Env', // trim() doesn't remove internal spaces
      variables: {},
    });
  });

  it('should not add empty environment name', async () => {
    const user = userEvent.setup();
    render(<EnvironmentSelector />);

    await user.click(screen.getByRole('button', { name: /Environment: Development/i }));
    await user.click(screen.getByText('Add Custom Environment...'));

    // Try to submit empty
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(mockStore.addEnvironment).not.toHaveBeenCalled();
  });

  it('should cancel adding environment', async () => {
    const user = userEvent.setup();
    render(<EnvironmentSelector />);

    await user.click(screen.getByRole('button', { name: /Environment: Development/i }));
    await user.click(screen.getByText('Add Custom Environment...'));

    // Type something
    const input = screen.getByPlaceholderText('Environment name');
    await user.type(input, 'Test');

    // Cancel
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // Should go back to showing the add button
    expect(screen.getByText('Add Custom Environment...')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Environment name')).not.toBeInTheDocument();
    expect(mockStore.addEnvironment).not.toHaveBeenCalled();
  });

  it('should submit form on Enter key', async () => {
    const user = userEvent.setup();
    render(<EnvironmentSelector />);

    await user.click(screen.getByRole('button', { name: /Environment: Development/i }));
    await user.click(screen.getByText('Add Custom Environment...'));

    const input = screen.getByPlaceholderText('Environment name');
    await user.type(input, 'Quick Add{Enter}');

    expect(mockStore.addEnvironment).toHaveBeenCalledWith({
      id: 'quick-add',
      name: 'Quick Add',
      variables: {},
    });
  });

  it('should close dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <EnvironmentSelector />
        <div data-testid="outside">Outside Element</div>
      </div>,
    );

    // Open dropdown
    await user.click(screen.getByRole('button', { name: /Environment: Development/i }));
    expect(screen.getByText('Staging')).toBeInTheDocument();

    // Click outside
    await user.click(screen.getByTestId('outside'));

    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByText('Staging')).not.toBeInTheDocument();
    });
  });

  it('should close add environment form when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <EnvironmentSelector />
        <div data-testid="outside">Outside Element</div>
      </div>,
    );

    // Open dropdown and add form
    await user.click(screen.getByRole('button', { name: /Environment: Development/i }));
    await user.click(screen.getByText('Add Custom Environment...'));
    expect(screen.getByPlaceholderText('Environment name')).toBeInTheDocument();

    // Click outside
    await user.click(screen.getByTestId('outside'));

    // Everything should close
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Environment name')).not.toBeInTheDocument();
      expect(screen.queryByText('Add Custom Environment...')).not.toBeInTheDocument();
    });
  });

  it('should focus input when add environment form opens', async () => {
    const user = userEvent.setup();
    render(<EnvironmentSelector />);

    await user.click(screen.getByRole('button', { name: /Environment: Development/i }));
    await user.click(screen.getByText('Add Custom Environment...'));

    const input = screen.getByPlaceholderText('Environment name');
    expect(document.activeElement).toBe(input);
  });
});
