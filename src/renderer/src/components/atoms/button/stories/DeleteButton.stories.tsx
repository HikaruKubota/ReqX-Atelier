import React from 'react';
import { DeleteButton } from '../DeleteButton';

export default {
  title: 'Atoms/Button/DeleteButton',
  component: DeleteButton,
};

export const Default = {
  args: {
    onClick: () => alert('Delete clicked!'),
    children: 'X',
  },
};
