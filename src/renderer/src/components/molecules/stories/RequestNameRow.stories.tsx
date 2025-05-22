import { RequestNameRow } from '../RequestNameRow';

export default {
  title: 'Molecules/RequestNameRow',
  component: RequestNameRow,
};

export const Default = {
  args: {
    value: '',
    onChange: (v: string) => alert(v),
    onSave: () => alert('save'),
    saving: false,
    isUpdate: false,
  },
};
