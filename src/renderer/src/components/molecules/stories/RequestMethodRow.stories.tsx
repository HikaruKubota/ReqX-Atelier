import { RequestMethodRow } from '../RequestMethodRow';

export default {
  title: 'Molecules/RequestMethodRow',
  component: RequestMethodRow,
};

export const Default = {
  args: {
    method: 'GET',
    onMethodChange: (m: string) => alert(m),
    url: '',
    onUrlChange: (u: string) => alert(u),
    loading: false,
    onSend: () => alert('send'),
  },
};
