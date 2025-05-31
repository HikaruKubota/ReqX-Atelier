import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { UnifiedInput } from '../UnifiedInput';
import type { UnifiedInputProps } from '../UnifiedInput';

const meta = {
  title: 'Atoms/Form/UnifiedInput',
  component: UnifiedInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'compact'],
    },
    type: {
      control: 'select',
      options: ['text', 'textarea', 'email', 'url', 'password', 'number'],
    },
  },
} satisfies Meta<typeof UnifiedInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper component to manage state
const UnifiedInputWithState = (args: UnifiedInputProps) => {
  const [value, setValue] = useState(args.value || '');
  return <UnifiedInput {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    value: '',
    onChange: () => {},
  },
  render: (args) => <UnifiedInputWithState {...args} />,
};

export const WithValue: Story = {
  args: {
    placeholder: 'Enter text...',
    value: 'Hello, world!',
    onChange: () => {},
  },
  render: (args) => <UnifiedInputWithState {...args} />,
};

export const WithVariables: Story = {
  args: {
    placeholder: 'Enter URL...',
    value: 'https://api.example.com/users/${userId}',
    enableVariables: true,
    onChange: () => {},
  },
  render: (args) => <UnifiedInputWithState {...args} />,
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    value: 'Cannot edit this',
    disabled: true,
    onChange: () => {},
  },
  render: (args) => <UnifiedInputWithState {...args} />,
};

export const CompactVariant: Story = {
  args: {
    placeholder: 'Compact input',
    value: '',
    variant: 'compact',
    onChange: () => {},
  },
  render: (args) => <UnifiedInputWithState {...args} />,
};

export const Textarea: Story = {
  args: {
    placeholder: 'Enter description...',
    value: 'This is a multiline\ntext input',
    type: 'textarea',
    onChange: () => {},
  },
  render: (args) => (
    <div style={{ width: '400px' }}>
      <UnifiedInputWithState {...args} />
    </div>
  ),
};

export const TextareaWithVariables: Story = {
  args: {
    placeholder: 'Enter JSON body...',
    value: '{\n  "userId": "${userId}",\n  "name": "${userName}"\n}',
    type: 'textarea',
    enableVariables: true,
    onChange: () => {},
  },
  render: (args) => (
    <div style={{ width: '400px' }}>
      <UnifiedInputWithState {...args} />
    </div>
  ),
};

export const EmailInput: Story = {
  args: {
    placeholder: 'Enter email...',
    value: 'user@example.com',
    type: 'email',
    onChange: () => {},
  },
  render: (args) => <UnifiedInputWithState {...args} />,
};

export const NumberInput: Story = {
  args: {
    placeholder: 'Enter number...',
    value: '42',
    type: 'number',
    onChange: () => {},
  },
  render: (args) => <UnifiedInputWithState {...args} />,
};

export const WithCustomStyles: Story = {
  args: {
    placeholder: 'Custom styled input',
    value: '',
    className: 'w-full max-w-md shadow-sm',
    onChange: () => {},
  },
  render: (args) => <UnifiedInputWithState {...args} />,
};

export const NoFocusRing: Story = {
  args: {
    placeholder: 'No focus ring',
    value: '',
    showFocusRing: false,
    onChange: () => {},
  },
  render: (args) => <UnifiedInputWithState {...args} />,
};
