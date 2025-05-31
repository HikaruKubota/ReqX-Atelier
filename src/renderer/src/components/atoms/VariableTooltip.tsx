import React, { useState, useEffect } from 'react';
import { useVariablesStore } from '../../store/variablesStore';

interface VariableTooltipProps {
  value: string;
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
}

export const VariableTooltip: React.FC<VariableTooltipProps> = ({ value, className, inputRef }) => {
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredVariable, setHoveredVariable] = useState<string | null>(null);
  const getResolvedVariables = useVariablesStore((state) => state.getResolvedVariables);
  const globalVariables = useVariablesStore((state) => state.globalVariables);

  const variables = getResolvedVariables();

  // Find variables in the value
  const variableMatches = Array.from(value.matchAll(/\$\{([^}]+)\}/g));

  // Check for undefined variables
  const undefinedVariables = variableMatches
    .map((match) => match[1])
    .filter((varName) => !variables[varName]);

  useEffect(() => {
    const handleMouseMove = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      if (!inputRef?.current) return;

      const rect = inputRef.current.getBoundingClientRect();
      const x = mouseEvent.clientX - rect.left;
      // const y = mouseEvent.clientY - rect.top

      // Check if hovering over a variable
      let foundVariable: string | null = null;
      for (const match of variableMatches) {
        const varName = match[1];
        const startIndex = match.index!;
        const endIndex = startIndex + match[0].length;

        // This is a simplified check - in a real implementation,
        // you'd need to calculate the actual text position
        if (x >= startIndex * 8 && x <= endIndex * 8) {
          foundVariable = varName;
          break;
        }
      }

      if (foundVariable !== hoveredVariable) {
        setHoveredVariable(foundVariable);
        if (foundVariable) {
          setTooltipPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY - 20 });
        }
      }
    };

    const handleMouseLeave = () => {
      setHoveredVariable(null);
      setTooltipPosition(null);
    };

    if (inputRef?.current) {
      inputRef.current.addEventListener('mousemove', handleMouseMove);
      inputRef.current.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        if (inputRef?.current) {
          inputRef.current.removeEventListener('mousemove', handleMouseMove);
          inputRef.current.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    }
  }, [variableMatches, hoveredVariable, inputRef]);

  // Render warning indicators
  const renderWithWarnings = () => {
    if (undefinedVariables.length === 0) return null;

    return (
      <div className={`text-xs text-yellow-600 dark:text-yellow-400 mt-1 ${className}`}>
        ⚠️ Undefined variables: {undefinedVariables.join(', ')}
      </div>
    );
  };

  // Render tooltip
  const renderTooltip = () => {
    if (!hoveredVariable || !tooltipPosition) return null;

    const variable = variables[hoveredVariable];
    const isGlobal = globalVariables[hoveredVariable] !== undefined;
    const isUndefined = !variable;

    return (
      <div
        className="fixed z-50 bg-gray-800 text-white text-sm rounded-md shadow-lg p-3 pointer-events-none"
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y,
        }}
      >
        {isUndefined ? (
          <>
            <div className="font-semibold text-yellow-400">⚠️ Undefined Variable</div>
            <div>&apos;{hoveredVariable}&apos; is not defined</div>
            <div className="border-t border-gray-600 mt-2 pt-2">
              <div className="text-xs">💡 Add to Global Variables</div>
              <div className="text-xs">💡 Add to Environment Variables</div>
            </div>
          </>
        ) : (
          <>
            <div className="font-semibold">
              {hoveredVariable}: &quot;{variable.secure ? '•••••••••' : variable.value}&quot;
            </div>
            <div className="text-xs text-gray-300">
              Scope: {isGlobal ? '🌍 Global' : '🌐 Environment'}
            </div>
            {!isGlobal && globalVariables[hoveredVariable] && (
              <>
                <div className="text-xs text-gray-300">Overrides: Global</div>
                <div className="border-t border-gray-600 mt-1 pt-1">
                  <div className="text-xs text-gray-400">
                    Global value: &quot;
                    {globalVariables[hoveredVariable].secure
                      ? '•••••••••'
                      : globalVariables[hoveredVariable].value}
                    &quot;
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {renderWithWarnings()}
      {renderTooltip()}
    </>
  );
};
