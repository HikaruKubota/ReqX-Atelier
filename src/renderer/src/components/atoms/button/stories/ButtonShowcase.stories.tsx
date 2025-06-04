import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SendButton } from '../SendButton';
import { SaveRequestButton } from '../SaveRequestButton';
import { EnableAllButton } from '../EnableAllButton';
import { DisableAllButton } from '../DisableAllButton';
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
        {themeNames.map((themeName) => (
          <div key={themeName} className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 capitalize">{themeName} Theme</h2>
            <div className={`theme-${themeName} p-6 rounded-lg border-2`}>
              <div className="flex flex-wrap gap-4 items-center">
                <SendButton />
                <SendButton loading />
                <SaveRequestButton />
                <SaveRequestButton isUpdate />
                <EnableAllButton />
                <DisableAllButton />
                <button className="px-4 py-2 border border-primary text-primary bg-background hover:bg-primary hover:text-primary-foreground rounded-md transition-all duration-200">
                  Add Header
                </button>
                <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90">
                  Add Body Row
                </button>
              </div>
            </div>
          </div>
        ))}
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
        </div>
        <div className="flex gap-4 items-center">
          <span className="w-32">Disabled:</span>
          <SendButton disabled />
          <SaveRequestButton disabled />
          <EnableAllButton disabled />
          <DisableAllButton disabled />
        </div>
        <div className="flex gap-4 items-center">
          <span className="w-32">Loading:</span>
          <SendButton loading />
        </div>
      </div>
    </div>
  ),
};