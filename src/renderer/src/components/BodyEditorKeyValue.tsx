import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

interface KeyValuePair {
  id: string;
  keyName: string;
  value: string;
  enabled: boolean;
}

export interface BodyEditorKeyValueRef {
  getCurrentBodyAsJson: () => string;
}

interface BodyEditorKeyValueProps {
  initialBodyJsonString: string;
  method: string; // To determine if body is applicable and to re-initialize on method change
}

export const BodyEditorKeyValue = forwardRef<BodyEditorKeyValueRef, BodyEditorKeyValueProps>((
  { initialBodyJsonString, method },
  ref
) => {
  const [bodyKeyValuePairs, setBodyKeyValuePairs] = useState<KeyValuePair[]>([]);

  useEffect(() => {
    if (method === 'GET' || method === 'HEAD') {
      setBodyKeyValuePairs([]);
      return;
    }
    try {
      const parsedBody = JSON.parse(initialBodyJsonString || '{}');
      if (typeof parsedBody === 'object' && parsedBody !== null && !Array.isArray(parsedBody)) {
        const newPairs = Object.entries(parsedBody).map(([k, v], index) => ({
          id: `kv-${k}-${index}-${Date.now()}`,
          keyName: k,
          value: typeof v === 'string' ? v : JSON.stringify(v, null, 2),
          enabled: true,
        }));
        if (JSON.stringify(newPairs.map(p => ({...p, id: 'temp' }))) !== JSON.stringify(bodyKeyValuePairs.map(p => ({...p, id: 'temp' })))) {
            setBodyKeyValuePairs(newPairs);
        }
      } else if (initialBodyJsonString.trim() === '') {
        setBodyKeyValuePairs([]);
      }
    } catch (e) {
      if (initialBodyJsonString && initialBodyJsonString.trim() !== '') {
        console.warn("BodyEditorKeyValue: Failed to parse initialBodyJsonString. It might not be a valid JSON object.", initialBodyJsonString);
      }
      setBodyKeyValuePairs([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBodyJsonString, method]);

  useImperativeHandle(ref, () => ({
    getCurrentBodyAsJson: () => {
      if (method === 'GET' || method === 'HEAD' || bodyKeyValuePairs.length === 0) {
        return '';
      }
      try {
        const jsonObject = bodyKeyValuePairs.reduce((obj, pair) => {
          if (pair.enabled && pair.keyName.trim() !== '') {
            try {
              obj[pair.keyName] = JSON.parse(pair.value);
            } catch {
              obj[pair.keyName] = pair.value;
            }
          }
          return obj;
        }, {} as Record<string, any>);
        return Object.keys(jsonObject).length > 0 ? JSON.stringify(jsonObject, null, 2) : '';
      } catch (e) {
        console.error("BodyEditorKeyValue: Error constructing JSON from K-V pairs:", e);
        return '';
      }
    }
  }));

  const handleKeyValuePairChange = (id: string, field: keyof Omit<KeyValuePair, 'id'>, newValue: string | boolean) => {
    setBodyKeyValuePairs(prevPairs =>
      prevPairs.map(pair =>
        pair.id === id ? { ...pair, [field]: newValue } : pair
      )
    );
  };

  const handleAddKeyValuePair = () => {
    setBodyKeyValuePairs(prev => [...prev, { id: `kv-new-${Date.now()}-${Math.random().toString(36).substring(2,9)}`, keyName: '', value: '', enabled: true }]);
  };

  const handleRemoveKeyValuePair = (id: string) => {
    setBodyKeyValuePairs(prevPairs => prevPairs.filter(pair => pair.id !== id));
  };

  const isBodyApplicable = !(method === 'GET' || method === 'HEAD');

  if (!isBodyApplicable) {
    return <p style={{ color: '#6c757d', fontSize: '0.9em' }}>Request body is not applicable for {method} requests.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {bodyKeyValuePairs.map((pair) => (
        <div key={pair.id} style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={pair.enabled}
            onChange={(e) => handleKeyValuePairChange(pair.id, 'enabled', e.target.checked)}
            title={pair.enabled ? "Disable this row" : "Enable this row"}
            style={{ marginRight: '5px' }}
          />
          <input
            type="text"
            placeholder="Key"
            value={pair.keyName}
            onChange={(e) => handleKeyValuePairChange(pair.id, 'keyName', e.target.value)}
            style={{ flexGrow: 1, padding: '8px', fontSize: '0.95em', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
            disabled={!pair.enabled}
          />
          <input
            type="text"
            placeholder="Value (JSON or string)"
            value={pair.value}
            onChange={(e) => handleKeyValuePairChange(pair.id, 'value', e.target.value)}
            style={{ flexGrow: 2, padding: '8px', fontSize: '0.95em', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
            disabled={!pair.enabled}
          />
          <button
            onClick={() => handleRemoveKeyValuePair(pair.id)}
            style={{ padding: '6px 10px', fontSize: '0.9em', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={handleAddKeyValuePair}
        style={{ marginTop: '10px', padding: '8px 15px', fontSize: '0.95em', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', alignSelf: 'flex-start', cursor: 'pointer' }}
      >
        Add Body Row
      </button>
    </div>
  );
});

BodyEditorKeyValue.displayName = 'BodyEditorKeyValue';
