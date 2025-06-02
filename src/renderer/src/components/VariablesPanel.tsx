import React, { useState } from 'react';
import { IoClose, IoSearch, IoEllipsisVertical } from 'react-icons/io5';
import { useVariablesStore, Variable } from '../store/variablesStore';
import { Modal } from './atoms/Modal';

interface VariablesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VariableRowProps {
  variable: Variable;
  onUpdate: (updates: Partial<Variable>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  hasGlobalOverride?: boolean;
}

const VariableRow: React.FC<VariableRowProps> = ({
  variable,
  onUpdate,
  onDelete,
  onDuplicate,
  hasGlobalOverride,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(variable.name);
  const [editValue, setEditValue] = useState(variable.value);

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (editName.trim()) {
      onUpdate({ name: editName.trim(), value: editValue });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(variable.name);
    setEditValue(variable.value);
    setIsEditing(false);
  };

  const handleMakeSecure = () => {
    onUpdate({ secure: !variable.secure });
    setShowMenu(false);
  };

  const displayValue = variable.secure ? '•••••••••' : variable.value;

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="w-48 px-2 py-1 text-sm border border-border rounded bg-background"
          placeholder="Variable name"
        />
        <input
          type={variable.secure ? 'password' : 'text'}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="flex-1 px-2 py-1 text-sm border border-border rounded bg-background"
          placeholder="Value"
        />
        <button
          onClick={handleSaveEdit}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save
        </button>
        <button
          onClick={handleCancelEdit}
          className="px-3 py-1 text-sm bg-secondary rounded hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 px-4 py-2 hover:bg-accent border-b border-border">
      <div className="w-48 font-mono text-sm">
        {variable.name}
        {variable.secure && <span className="ml-2">🔒</span>}
      </div>
      <div className="flex-1 font-mono text-sm text-muted-foreground truncate">
        {displayValue}
        {hasGlobalOverride && <span className="ml-2 text-xs">ⓘ</span>}
      </div>
      <input
        type="checkbox"
        checked={variable.enabled}
        onChange={(e) => onUpdate({ enabled: e.target.checked })}
        className="w-4 h-4"
      />
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 hover:bg-accent rounded"
        >
          <IoEllipsisVertical className="w-5 h-5" />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-1 w-40 bg-popover border border-border rounded-md shadow-lg z-50">
            <button
              onClick={handleEdit}
              className="w-full px-4 py-2 text-sm text-left hover:bg-accent"
            >
              編集
            </button>
            <button
              onClick={() => {
                onDuplicate();
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-sm text-left hover:bg-accent"
            >
              コピー
            </button>
            <div className="border-t border-border" />
            <button
              onClick={handleMakeSecure}
              className="w-full px-4 py-2 text-sm text-left hover:bg-accent"
            >
              {variable.secure ? 'セキュア解除' : 'セキュア化'} 🔒
            </button>
            <div className="border-t border-border" />
            <button
              onClick={() => {
                onDelete();
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-accent"
            >
              削除
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const VariablesPanel: React.FC<VariablesPanelProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddGlobal, setShowAddGlobal] = useState(false);
  const [showAddEnvironment, setShowAddEnvironment] = useState(false);
  const [newVariableName, setNewVariableName] = useState('');
  const [newVariableValue, setNewVariableValue] = useState('');
  const [newVariableSecure, setNewVariableSecure] = useState(false);

  const {
    globalVariables,
    environments,
    activeEnvironmentId,
    addGlobalVariable,
    updateGlobalVariable,
    deleteGlobalVariable,
    addEnvironmentVariable,
    updateEnvironmentVariable,
    deleteEnvironmentVariable,
  } = useVariablesStore();

  const activeEnvironment = environments.find((env) => env.id === activeEnvironmentId);

  // Filter variables based on search query
  const filterVariables = (variables: Record<string, Variable>) => {
    if (!searchQuery) return Object.entries(variables);

    return Object.entries(variables).filter(
      ([name, variable]) =>
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        variable.value.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  const filteredGlobalVariables = filterVariables(globalVariables);
  const filteredEnvironmentVariables = activeEnvironment
    ? filterVariables(activeEnvironment.variables)
    : [];

  const handleAddGlobalVariable = () => {
    if (newVariableName.trim()) {
      const newVariable = {
        name: newVariableName.trim(),
        value: newVariableValue,
        enabled: true,
        secure: newVariableSecure,
      };
      addGlobalVariable(newVariable);
      resetAddForm();
      setShowAddGlobal(false);
    }
  };

  const handleAddEnvironmentVariable = () => {
    if (newVariableName.trim() && activeEnvironment) {
      const newVariable = {
        name: newVariableName.trim(),
        value: newVariableValue,
        enabled: true,
        secure: newVariableSecure,
      };
      addEnvironmentVariable(activeEnvironment.id, newVariable);
      resetAddForm();
      setShowAddEnvironment(false);
    }
  };

  const resetAddForm = () => {
    setNewVariableName('');
    setNewVariableValue('');
    setNewVariableSecure(false);
  };

  const handleDuplicateVariable = (variable: Variable, isGlobal: boolean) => {
    const duplicatedVar = {
      ...variable,
      name: `${variable.name}_copy`,
    };

    if (isGlobal) {
      addGlobalVariable(duplicatedVar);
    } else if (activeEnvironment) {
      addEnvironmentVariable(activeEnvironment.id, duplicatedVar);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="w-full h-[600px] max-h-[80vh] flex flex-col bg-background rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            Variables - {activeEnvironment?.name || 'No Environment'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-border">
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all variables..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-md bg-background"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Global Variables */}
          <div className="mb-6">
            <div className="px-6 py-3 bg-secondary border-b border-border">
              <h3 className="font-medium flex items-center gap-2">
                <span>🌍</span>
                Global Variables (All Environments)
              </h3>
            </div>

            {filteredGlobalVariables.length === 0 ? (
              <div className="px-6 py-4 text-sm text-muted-foreground">
                No global variables found
              </div>
            ) : (
              filteredGlobalVariables.map(([name, variable]) => (
                <VariableRow
                  key={name}
                  variable={variable}
                  onUpdate={(updates) => updateGlobalVariable(name, updates)}
                  onDelete={() => deleteGlobalVariable(name)}
                  onDuplicate={() => handleDuplicateVariable(variable, true)}
                />
              ))
            )}

            {!showAddGlobal ? (
              <button
                onClick={() => setShowAddGlobal(true)}
                className="w-full px-6 py-2 text-sm text-left text-blue-600 hover:bg-accent"
              >
                + Add Global Variable
              </button>
            ) : (
              <div className="px-6 py-3 bg-secondary flex items-center gap-2">
                <input
                  type="text"
                  value={newVariableName}
                  onChange={(e) => setNewVariableName(e.target.value)}
                  placeholder="Variable name"
                  className="w-48 px-2 py-1 text-sm border border-border rounded bg-background"
                  autoFocus
                />
                <input
                  type={newVariableSecure ? 'password' : 'text'}
                  value={newVariableValue}
                  onChange={(e) => setNewVariableValue(e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-2 py-1 text-sm border border-border rounded bg-background"
                />
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={newVariableSecure}
                    onChange={(e) => setNewVariableSecure(e.target.checked)}
                  />
                  <span>🔒</span>
                </label>
                <button
                  onClick={handleAddGlobalVariable}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddGlobal(false);
                    resetAddForm();
                  }}
                  className="px-3 py-1 text-sm bg-secondary rounded hover:bg-accent"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Environment Variables */}
          <div>
            <div className="px-6 py-3 bg-secondary border-b border-border">
              <h3 className="font-medium flex items-center gap-2">
                <span>🌐</span>
                Environment Variables ({activeEnvironment?.name})
              </h3>
            </div>

            {filteredEnvironmentVariables.length === 0 ? (
              <div className="px-6 py-4 text-sm text-muted-foreground">
                No environment variables found
              </div>
            ) : (
              filteredEnvironmentVariables.map(([name, variable]) => {
                const hasGlobalOverride = globalVariables[name] !== undefined;
                return (
                  <VariableRow
                    key={name}
                    variable={variable}
                    onUpdate={(updates) =>
                      activeEnvironment &&
                      updateEnvironmentVariable(activeEnvironment.id, name, updates)
                    }
                    onDelete={() =>
                      activeEnvironment && deleteEnvironmentVariable(activeEnvironment.id, name)
                    }
                    onDuplicate={() => handleDuplicateVariable(variable, false)}
                    hasGlobalOverride={hasGlobalOverride}
                  />
                );
              })
            )}

            {!showAddEnvironment ? (
              <button
                onClick={() => setShowAddEnvironment(true)}
                className="w-full px-6 py-2 text-sm text-left text-blue-600 hover:bg-accent"
              >
                + Add Environment Variable
              </button>
            ) : (
              <div className="px-6 py-3 bg-secondary flex items-center gap-2">
                <input
                  type="text"
                  value={newVariableName}
                  onChange={(e) => setNewVariableName(e.target.value)}
                  placeholder="Variable name"
                  className="w-48 px-2 py-1 text-sm border border-border rounded bg-background"
                  autoFocus
                />
                <input
                  type={newVariableSecure ? 'password' : 'text'}
                  value={newVariableValue}
                  onChange={(e) => setNewVariableValue(e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-2 py-1 text-sm border border-border rounded bg-background"
                />
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={newVariableSecure}
                    onChange={(e) => setNewVariableSecure(e.target.checked)}
                  />
                  <span>🔒</span>
                </label>
                <button
                  onClick={handleAddEnvironmentVariable}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddEnvironment(false);
                    resetAddForm();
                  }}
                  className="px-3 py-1 text-sm bg-secondary rounded hover:bg-accent"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center gap-2">
          <button className="px-3 py-1 text-sm bg-secondary rounded hover:bg-accent">
            🔒 Secure Variables
          </button>
          <button className="px-3 py-1 text-sm bg-secondary rounded hover:bg-accent">
            ❓ Help
          </button>
        </div>
      </div>
    </Modal>
  );
};
