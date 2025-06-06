import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SendButton } from '../SendButton';
import { SaveRequestButton } from '../SaveRequestButton';
import { EnableAllButton } from '../EnableAllButton';
import { DisableAllButton } from '../DisableAllButton';
import { JsonImportButton } from '../JsonImportButton';
import { ThemeProvider } from '../../../../theme/ThemeProvider';
import { themes } from '../../../../theme/themes';

const meta: Meta = {
  title: 'Atoms/Button/ButtonShowcase',
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const AllButtonsInThemes: Story = {
  render: () => {
    const themeNames = Object.keys(themes);

    return (
      <div className="p-8 space-y-8">
        {themeNames.map((themeName) => {
          const theme = themes[themeName];
          const themeStyles = {
            '--color-background': theme.colors.background,
            '--color-foreground': theme.colors.foreground,
            '--color-primary': theme.colors.primary,
            '--color-primary-foreground': theme.colors.primaryForeground,
            '--color-secondary': theme.colors.secondary,
            '--color-secondary-foreground': theme.colors.secondaryForeground,
            '--color-muted': theme.colors.muted,
            '--color-muted-foreground': theme.colors.mutedForeground,
            '--color-accent': theme.colors.accent,
            '--color-accent-foreground': theme.colors.accentForeground,
            '--color-destructive': theme.colors.destructive,
            '--color-destructive-foreground': theme.colors.destructiveForeground,
            '--color-border': theme.colors.border,
            '--color-input': theme.colors.input,
            '--color-ring': theme.colors.ring,
            '--color-selection': theme.colors.selection,
          } as React.CSSProperties;

          return (
            <div key={themeName} className="space-y-4">
              <h2 className="text-2xl font-bold mb-4 capitalize">{themeName} Theme</h2>
              <div className="p-6 rounded-lg border-2" style={themeStyles}>
                <div className="flex flex-wrap gap-4 items-center">
                  <SendButton />
                  <SendButton loading />
                  <SaveRequestButton />
                  <SaveRequestButton isUpdate />
                  <EnableAllButton />
                  <DisableAllButton />
                  <JsonImportButton />
                  <button className="px-4 py-2 border border-primary text-primary bg-background hover:bg-primary hover:text-primary-foreground rounded-md transition-all duration-200">
                    Add Header
                  </button>
                  <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90">
                    Add Body Row
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
};

export const ButtonStates: Story = {
  render: () => (
    <div className="p-8 space-y-4">
      <h2 className="text-xl font-bold mb-4">Button States</h2>
      <div className="space-y-2">
        <div className="flex gap-4 items-center">
          <span className="w-32">Normal:</span>
          <SendButton />
          <SaveRequestButton />
          <EnableAllButton />
          <DisableAllButton />
          <JsonImportButton />
        </div>
        <div className="flex gap-4 items-center">
          <span className="w-32">Disabled:</span>
          <SendButton disabled />
          <SaveRequestButton disabled />
          <EnableAllButton disabled />
          <DisableAllButton disabled />
          <JsonImportButton disabled />
        </div>
        <div className="flex gap-4 items-center">
          <span className="w-32">Loading:</span>
          <SendButton loading />
        </div>
      </div>
    </div>
  ),
};
