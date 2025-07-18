import React, { useState, useRef, useEffect } from 'react';
import { useVariablesStore } from '../store/variablesStore';
import { IoChevronDown } from 'react-icons/io5';

export const EnvironmentSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddEnvironment, setShowAddEnvironment] = useState(false);
  const [newEnvironmentName, setNewEnvironmentName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { environments, activeEnvironmentId, setActiveEnvironment, addEnvironment } =
    useVariablesStore();

  const activeEnvironment = environments.find((env) => env.id === activeEnvironmentId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowAddEnvironment(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectEnvironment = (environmentId: string) => {
    setActiveEnvironment(environmentId);
    setIsOpen(false);
  };

  const handleAddEnvironment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEnvironmentName.trim()) {
      const newId = newEnvironmentName.toLowerCase().replace(/\s+/g, '-');
      addEnvironment({
        id: newId,
        name: newEnvironmentName.trim(),
        variables: {},
      });
      setNewEnvironmentName('');
      setShowAddEnvironment(false);
      setActiveEnvironment(newId);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary hover:bg-accent rounded-md transition-colors"
      >
        <span className="text-base">🌐</span>
        <span className="font-medium">Environment: {activeEnvironment?.name || 'None'}</span>
        <IoChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-64 bg-card border border-border rounded-md shadow-lg z-50">
          {environments.map((env) => (
            <button
              key={env.id}
              onClick={() => handleSelectEnvironment(env.id)}
              className={`w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2 ${
                env.id === activeEnvironmentId ? 'bg-muted' : ''
              }`}
            >
              {env.id === activeEnvironmentId && <span>✓</span>}
              <span className={env.id === activeEnvironmentId ? 'font-medium' : ''}>
                {env.name}
              </span>
            </button>
          ))}

          <div className="border-t border-border my-1" />

          {!showAddEnvironment ? (
            <button
              onClick={() => setShowAddEnvironment(true)}
              className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
            >
              <span>+</span>
              <span>Add Custom Environment...</span>
            </button>
          ) : (
            <form onSubmit={handleAddEnvironment} className="p-2">
              <input
                type="text"
                value={newEnvironmentName}
                onChange={(e) => setNewEnvironmentName(e.target.value)}
                placeholder="Environment name"
                className="w-full px-2 py-1 text-sm border border-border rounded bg-input text-foreground"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddEnvironment(false);
                    setNewEnvironmentName('');
                  }}
                  className="flex-1 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-accent"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
