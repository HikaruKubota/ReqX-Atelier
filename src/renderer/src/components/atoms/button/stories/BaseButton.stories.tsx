import React from 'react';
import { BaseButton } from '../BaseButton';

export default {
  title: 'Atoms/BaseButton',
  component: BaseButton,
};

import { StoryFn } from '@storybook/react';

const Template: StoryFn<typeof BaseButton> = (args) => <BaseButton {...args} />;

export const Primary = Template.bind({});
