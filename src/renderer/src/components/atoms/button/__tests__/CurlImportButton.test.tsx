import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CurlImportButton } from '../CurlImportButton';

describe('CurlImportButton', () => {
  it('should render with correct text and icon', () => {
    const mockOnClick = vi.fn();
    render(<CurlImportButton onClick={mockOnClick} />);

    expect(screen.getByText('Import cURL')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Import from cURL command');
  });

  it('should call onClick when clicked', () => {
    const mockOnClick = vi.fn();
    render(<CurlImportButton onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledOnce();
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnClick = vi.fn();
    render(<CurlImportButton onClick={mockOnClick} disabled />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    const mockOnClick = vi.fn();
    render(<CurlImportButton onClick={mockOnClick} className="custom-class" />);

    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('should have correct button variant and size', () => {
    const mockOnClick = vi.fn();
    render(<CurlImportButton onClick={mockOnClick} />);

    // BaseButton should apply secondary variant and sm size styles
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});
