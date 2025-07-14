import React, { useState, useCallback } from 'react';
import { Modal } from './atoms/Modal';
import { BaseButton } from './atoms/button/BaseButton';
import { parseCurlCommand, isValidCurlCommand, cleanCurlCommand } from '../utils/curlParser';
import type { ParsedCurlRequest } from '../utils/curlParser';

interface CurlImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (parsedRequest: ParsedCurlRequest) => void;
}

export const CurlImportModal: React.FC<CurlImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [curlInput, setCurlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setCurlInput(value);

      // Clear error when user starts typing
      if (error) {
        setError(null);
      }
    },
    [error],
  );

  const handleImport = useCallback(async () => {
    if (!curlInput.trim()) {
      setError('Please enter a cURL command');
      return;
    }

    const cleanedInput = cleanCurlCommand(curlInput);

    if (!isValidCurlCommand(cleanedInput)) {
      setError('Invalid cURL command. Please make sure it starts with "curl"');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const parsedRequest = parseCurlCommand(cleanedInput);

      if (!parsedRequest.url) {
        setError('No URL found in cURL command');
        return;
      }

      onImport(parsedRequest);
      setCurlInput('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse cURL command');
    } finally {
      setIsImporting(false);
    }
  }, [curlInput, onImport, onClose]);

  const handleClose = useCallback(() => {
    setCurlInput('');
    setError(null);
    onClose();
  }, [onClose]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCurlInput(text);
      setError(null);
    } catch {
      setError('Failed to read from clipboard');
    }
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Import from cURL
          </h3>
          <label
            htmlFor="curl-input"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Paste your cURL command here:
          </label>
          <div className="relative">
            <textarea
              id="curl-input"
              value={curlInput}
              onChange={handleInputChange}
              placeholder={`curl -X POST https://api.example.com/users \\
  -H 'Content-Type: application/json' \\
  -d '{"name": "John Doe", "email": "john@example.com"}'`}
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none font-mono text-sm"
              disabled={isImporting}
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute top-2 right-2 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={isImporting}
            >
              Paste
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• Supports most common cURL options: -X, -H, -d, --data, --header, etc.</p>
          <p>• JSON and form data will be automatically parsed into key-value pairs</p>
          <p>• URL parameters will be extracted and added to the params section</p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <BaseButton onClick={handleClose} variant="secondary" disabled={isImporting}>
            Cancel
          </BaseButton>
          <BaseButton
            onClick={handleImport}
            variant="primary"
            disabled={isImporting || !curlInput.trim()}
          >
            {isImporting ? 'Importing...' : 'Import'}
          </BaseButton>
        </div>
      </div>
    </Modal>
  );
};
