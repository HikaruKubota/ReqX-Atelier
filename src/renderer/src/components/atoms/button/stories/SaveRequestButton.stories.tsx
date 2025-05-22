import { SaveRequestButton } from '../SaveRequestButton';

export default {
  title: 'Atoms/Button/SaveRequestButton',
  component: SaveRequestButton,
};

export const Default = {
  args: {
    onClick: () => alert('save'),
    isUpdate: false,
  },
};
