import React from 'react';
import { NewRequestButton } from '../NewRequestButton';

export default {
  title: 'Atoms/Button/NewRequestButton',
  component: NewRequestButton,
};

export const Default = {
  args: {
    onClick: () => alert('New Request!'),
  },
};
