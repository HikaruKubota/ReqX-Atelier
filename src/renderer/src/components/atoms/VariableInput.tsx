import React, { useRef } from 'react';
import { useVariablesStore } from '../../store/variablesStore';

interface VariableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: 'text' | 'textarea';
}

export const VariableInput: React.FC<VariableInputProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  type = 'text',
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const getResolvedVariables = useVariablesStore((state) => state.getResolvedVariables);

  // Check for undefined variables
  const variables = getResolvedVariables();
  const variableMatches = Array.from(value.matchAll(/\$\{([^}]+)\}/g));
  const hasUndefinedVariables = variableMatches.some((match) => !variables[match[1]]);

  // Add warning style if there are undefined variables
  const baseClassName = 'w-full';
  const inputClassName = `${baseClassName} ${className} ${hasUndefinedVariables ? 'border-destructive' : ''}`;

  // Show resolved value as placeholder hint
  const resolvedValue = value.replace(/\$\{([^}]+)\}/g, (match, varName) => {
    const variable = variables[varName];
    if (!variable) {
      return match;
    }
    // Hide secure variable values
    const result = variable.secure ? '•••••••••' : variable.value;
    return result;
  });

  const showHint = value !== resolvedValue && value.includes('${');

  if (type === 'textarea') {
    return (
      <div className="relative flex-1">
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClassName}
        />
        {showHint && (
          <div className="absolute top-full mt-1 left-0 text-xs text-muted-foreground truncate max-w-full z-10 bg-popover px-1 rounded">
            → {resolvedValue}
          </div>
        )}
        {hasUndefinedVariables && (
          <div className="absolute top-full mt-1 right-0 text-xs text-destructive z-10 bg-popover px-1 rounded">
            ⚠️ Undefined variable(s)
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
      />
      {showHint && (
        <div className="absolute top-full mt-1 left-0 text-xs text-muted-foreground truncate max-w-full z-10 bg-popover px-1 rounded">
          → {resolvedValue}
        </div>
      )}
      {hasUndefinedVariables && (
        <div className="absolute top-full mt-1 right-0 text-xs text-destructive z-10 bg-popover px-1 rounded">
          ⚠️ Undefined variable(s)
        </div>
      )}
    </div>
  );
};
