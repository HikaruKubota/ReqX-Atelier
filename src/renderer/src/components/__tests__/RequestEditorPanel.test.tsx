import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestEditorPanel } from '../RequestEditorPanel';
import type { HeaderKeyValuePair, KeyValuePair, VariableExtraction } from '../../types';

// Mock react-i18next with tab translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        header_tab: 'Headers',
        body_tab: 'Body',
        param_tab: 'Params',
        tests_tab: 'Variables',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'en',
    },
  }),
}));

// Mock child components
vi.mock('../HeadersEditor', () => ({
  HeadersEditor: ({ headers, onAddHeader }: any) => (
    <div data-testid="headers-editor">
      {headers.map((h: any) => (
        <div key={h.id}>{h.key}: {h.value}</div>
      ))}
      <button onClick={() => onAddHeader()}>
        Add Header
      </button>
    </div>
  ),
}));

vi.mock('../BodyEditorKeyValue', () => ({
  BodyEditorKeyValue: React.forwardRef(({ value, onChange, method }: any, ref) => {
    React.useImperativeHandle(ref, () => ({
      getCurrentBodyAsJson: () => JSON.stringify(value || []),
      getCurrentKeyValuePairs: () => value || [],
    }));
    return (
      <div data-testid="body-editor">
        {method === 'GET' ? 'Body not applicable' : 'Body Editor'}
        <button onClick={() => onChange && onChange([{ id: '1', keyName: 'key', value: 'value', enabled: true }])}>
          Update Body
        </button>
      </div>
    );
  }),
}));

vi.mock('../ParamsEditorKeyValue', () => ({
  ParamsEditorKeyValue: React.forwardRef(({ value, onChange }: any, ref) => {
    React.useImperativeHandle(ref, () => ({
      getCurrentKeyValuePairs: () => value || [],
    }));
    return (
      <div data-testid="params-editor">
        {(value || []).map((p: any) => (
          <div key={p.id}>{p.keyName}: {p.value}</div>
        ))}
        <button onClick={() => onChange([...value || [], { id: 'new', keyName: 'param', value: 'value', enabled: true }])}>
          Add Param
        </button>
      </div>
    );
  }),
}));

vi.mock('../VariableExtractionEditor', () => ({
  VariableExtractionEditor: ({ variableExtraction, onChange }: any) => (
    <div data-testid="variable-extraction-editor">
      Variable Extraction Editor
      <button onClick={() => onChange && onChange({ 
        id: '1', 
        extractions: [{ id: '1', variableName: 'token', extractFrom: 'data.token', enabled: true }] 
      })}>
        Add Extraction
      </button>
    </div>
  ),
}));

// Mock RequestNameRow and RequestMethodRow
vi.mock('../molecules/RequestNameRow', () => ({
  RequestNameRow: ({ value, onChange }: any) => (
    <input 
      data-testid="request-name"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Request Name"
    />
  ),
}));

vi.mock('../molecules/RequestMethodRow', () => ({
  RequestMethodRow: ({ method, url, onUrlChange }: any) => (
    <div>
      <span data-testid="method">{method}</span>
      <input 
        data-testid="url-input"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="Enter request URL (e.g., https://api.example.com/users)"
      />
    </div>
  ),
}));

const defaultProps = {
  requestNameForSave: 'Test Request',
  onRequestNameForSaveChange: vi.fn(),
  method: 'GET',
  onMethodChange: vi.fn(),
  url: 'https://api.example.com/users',
  onUrlChange: vi.fn(),
  initialBody: [] as KeyValuePair[],
  initialParams: [] as KeyValuePair[],
  activeRequestId: null,
  loading: false,
  onSaveRequest: vi.fn(),
  onSendRequest: vi.fn(),
  onBodyPairsChange: vi.fn(),
  onParamPairsChange: vi.fn(),
  headers: [] as HeaderKeyValuePair[],
  onAddHeader: vi.fn(),
  onUpdateHeader: vi.fn(),
  onRemoveHeader: vi.fn(),
  onReorderHeaders: vi.fn(),
  variableExtraction: undefined,
  onVariableExtractionChange: vi.fn(),
};

describe('RequestEditorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tabs', () => {
    it('should render all tabs', () => {
      render(<RequestEditorPanel {...defaultProps} />);
      
      expect(screen.getByText('Headers')).toBeInTheDocument();
      expect(screen.getByText('Body')).toBeInTheDocument();
      expect(screen.getByText('Params')).toBeInTheDocument();
      expect(screen.getByText('Variables')).toBeInTheDocument();
    });

    it('should show headers tab by default', () => {
      render(<RequestEditorPanel {...defaultProps} />);
      
      expect(screen.getByTestId('headers-editor')).toBeInTheDocument();
      expect(screen.getByTestId('headers-editor').parentElement).toHaveClass('block');
      expect(screen.getByTestId('body-editor').parentElement).toHaveClass('hidden');
    });

    it('should switch to body tab when clicked', async () => {
      const user = userEvent.setup();
      render(<RequestEditorPanel {...defaultProps} />);
      
      const bodyButton = screen.getByText('Body');
      await user.click(bodyButton);
      
      expect(screen.getByTestId('headers-editor').parentElement).toHaveClass('hidden');
      expect(screen.getByTestId('body-editor').parentElement).toHaveClass('block');
    });

    it('should switch to params tab when clicked', async () => {
      const user = userEvent.setup();
      render(<RequestEditorPanel {...defaultProps} />);
      
      const paramsButton = screen.getByText('Params');
      await user.click(paramsButton);
      
      expect(screen.getByTestId('headers-editor').parentElement).toHaveClass('hidden');
      expect(screen.getByTestId('params-editor').parentElement).toHaveClass('block');
    });

    it('should switch to variables tab when clicked', async () => {
      const user = userEvent.setup();
      render(<RequestEditorPanel {...defaultProps} />);
      
      const variablesButton = screen.getByText('Variables');
      await user.click(variablesButton);
      
      expect(screen.getByTestId('headers-editor').parentElement).toHaveClass('hidden');
      expect(screen.getByTestId('variable-extraction-editor').parentElement).toHaveClass('block');
    });
  });

  describe('URL Input', () => {
    it('should display the URL', () => {
      render(<RequestEditorPanel {...defaultProps} />);
      
      const urlInput = screen.getByTestId('url-input');
      expect(urlInput).toHaveValue('https://api.example.com/users');
    });

    it('should call onUrlChange when URL is changed', async () => {
      const user = userEvent.setup();
      render(<RequestEditorPanel {...defaultProps} />);
      
      const urlInput = screen.getByTestId('url-input');
      
      // Type a single character to verify onChange is called
      await user.type(urlInput, 'X');
      
      // Verify the onChange handler was called
      expect(defaultProps.onUrlChange).toHaveBeenCalled();
      
      // Verify it was called at least once
      expect(defaultProps.onUrlChange.mock.calls.length).toBeGreaterThanOrEqual(1);
      
      // The onChange should have been called with a string containing the original URL
      const firstCall = defaultProps.onUrlChange.mock.calls[0][0];
      expect(typeof firstCall).toBe('string');
      expect(firstCall).toContain('https://api.example.com/users');
    });

    it('should have correct placeholder', () => {
      render(<RequestEditorPanel {...defaultProps} url="" />);
      
      const urlInput = screen.getByPlaceholderText('Enter request URL (e.g., https://api.example.com/users)');
      expect(urlInput).toBeInTheDocument();
    });
  });

  describe('Headers Tab', () => {
    it('should pass headers to HeadersEditor', () => {
      const headers = [
        { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
        { id: '2', key: 'Authorization', value: 'Bearer token', enabled: false },
      ];
      
      render(<RequestEditorPanel {...defaultProps} headers={headers} />);
      
      expect(screen.getByText('Content-Type: application/json')).toBeInTheDocument();
      expect(screen.getByText('Authorization: Bearer token')).toBeInTheDocument();
    });

    it('should call onAddHeader when add header button is clicked', async () => {
      const user = userEvent.setup();
      render(<RequestEditorPanel {...defaultProps} />);
      
      await user.click(screen.getByText('Add Header'));
      
      expect(defaultProps.onAddHeader).toHaveBeenCalled();
    });
  });

  describe('Body Tab', () => {
    it('should show body not applicable for GET requests', async () => {
      const user = userEvent.setup();
      render(<RequestEditorPanel {...defaultProps} method="GET" />);
      
      await user.click(screen.getByText('Body'));
      
      expect(screen.getByText('Body not applicable')).toBeInTheDocument();
    });

    it('should show body editor for POST requests', async () => {
      const user = userEvent.setup();
      render(<RequestEditorPanel {...defaultProps} method="POST" />);
      
      await user.click(screen.getByText('Body'));
      
      expect(screen.getByText('Body Editor')).toBeInTheDocument();
    });

    it('should call onBodyPairsChange when body is updated', async () => {
      const user = userEvent.setup();
      render(<RequestEditorPanel {...defaultProps} method="POST" />);
      
      await user.click(screen.getByText('Body'));
      await user.click(screen.getByText('Update Body'));
      
      expect(defaultProps.onBodyPairsChange).toHaveBeenCalledWith(
        [{ id: '1', keyName: 'key', value: 'value', enabled: true }]
      );
    });
  });

  describe('Params Tab', () => {
    it('should pass params to ParamsEditorKeyValue', async () => {
      const user = userEvent.setup();
      const params = [
        { id: '1', keyName: 'page', value: '1', enabled: true },
        { id: '2', keyName: 'limit', value: '10', enabled: true },
      ];
      
      render(<RequestEditorPanel {...defaultProps} initialParams={params} />);
      
      await user.click(screen.getByText('Params'));
      
      expect(screen.getByText('page: 1')).toBeInTheDocument();
      expect(screen.getByText('limit: 10')).toBeInTheDocument();
    });

    it('should call onParamPairsChange when params are updated', async () => {
      const user = userEvent.setup();
      render(<RequestEditorPanel {...defaultProps} />);
      
      await user.click(screen.getByText('Params'));
      await user.click(screen.getByText('Add Param'));
      
      expect(defaultProps.onParamPairsChange).toHaveBeenCalledWith([
        { id: 'new', keyName: 'param', value: 'value', enabled: true }
      ]);
    });
  });

  describe('Variables Tab', () => {
    it('should pass variableExtraction to VariableExtractionEditor', async () => {
      const user = userEvent.setup();
      const variableExtraction = {
        id: '1',
        extractions: [
          { id: '1', variableName: 'authToken', extractFrom: 'data.token', enabled: true },
        ],
      };
      
      render(<RequestEditorPanel {...defaultProps} variableExtraction={variableExtraction} />);
      
      await user.click(screen.getByText('Variables'));
      
      expect(screen.getByText('Variable Extraction Editor')).toBeInTheDocument();
    });

    it('should call onVariableExtractionChange when extractions are updated', async () => {
      const user = userEvent.setup();
      render(<RequestEditorPanel {...defaultProps} />);
      
      await user.click(screen.getByText('Variables'));
      await user.click(screen.getByText('Add Extraction'));
      
      expect(defaultProps.onVariableExtractionChange).toHaveBeenCalledWith({
        id: '1',
        extractions: [{ id: '1', variableName: 'token', extractFrom: 'data.token', enabled: true }]
      });
    });
  });


  describe('Tab Content Styling', () => {
    it('should show headers tab as active by default', () => {
      render(<RequestEditorPanel {...defaultProps} />);
      
      // Headers tab should be visible by default
      expect(screen.getByTestId('headers-editor')).toBeInTheDocument();
      expect(screen.getByTestId('headers-editor').parentElement).toHaveClass('block');
      expect(screen.getByTestId('body-editor').parentElement).toHaveClass('hidden');
      expect(screen.getByTestId('params-editor').parentElement).toHaveClass('hidden');
    });

    it('should switch active content when different tab is clicked', async () => {
      const user = userEvent.setup();
      render(<RequestEditorPanel {...defaultProps} />);
      
      // Find and click body tab
      const bodyButton = screen.getByText('Body');
      await user.click(bodyButton);
      
      // Body content should be visible, others hidden
      expect(screen.getByTestId('headers-editor').parentElement).toHaveClass('hidden');
      expect(screen.getByTestId('body-editor').parentElement).toHaveClass('block');
    });
  });
});