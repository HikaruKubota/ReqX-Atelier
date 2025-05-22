import { SendButton } from '../SendButton';

export default {
  title: 'Atoms/Button/SendButton',
  component: SendButton,
};

export const Default = {
  args: {
    onClick: () => alert('send'),
    loading: false,
  },
};
