import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RequestMethodRow } from '../RequestMethodRow';

describe('RequestMethodRow', () => {
  it('calls onMethodChange when method is changed', () => {
    const handleMethodChange = vi.fn();
    const { getByDisplayValue } = render(
      <RequestMethodRow
        method="GET"
        onMethodChange={handleMethodChange}
        url=""
        onUrlChange={() => {}}
        loading={false}
        onSend={() => {}}
      />
    );
    fireEvent.change(getByDisplayValue('GET'), { target: { value: 'POST' } });
    expect(handleMethodChange).toHaveBeenCalledWith('POST');
  });

  it('calls onUrlChange when URL changes', () => {
    const handleUrlChange = vi.fn();
    const { getByPlaceholderText } = render(
      <RequestMethodRow
        method="GET"
        onMethodChange={() => {}}
        url="url"
        onUrlChange={handleUrlChange}
        loading={false}
        onSend={() => {}}
      />
    );
    fireEvent.change(getByPlaceholderText('Enter request URL (e.g., https://api.example.com/users)'), {
      target: { value: 'new' }
    });
    expect(handleUrlChange).toHaveBeenCalledWith('new');
  });

  it('calls onSend when button clicked', () => {
    const handleSend = vi.fn();
    const { getByText } = render(
      <RequestMethodRow
        method="GET"
        onMethodChange={() => {}}
        url="url"
        onUrlChange={() => {}}
        loading={false}
        onSend={handleSend}
      />
    );
    fireEvent.click(getByText('Send'));
    expect(handleSend).toHaveBeenCalled();
  });
});
