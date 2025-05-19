import { RequestListItem } from '../RequestListItem';
import type { SavedRequest } from '../../../../types';

export default {
  title: 'Atoms/List/RequestListItem',
  component: RequestListItem,
};

const sampleRequest: SavedRequest = {
  id: '1',
  name: 'Sample Request',
  method: 'GET',
  url: 'https://api.example.com',
  headers: [],
  body: [],
};

export const Default = {
  args: {
    request: sampleRequest,
    isActive: false,
    onClick: () => alert('Clicked!'),
    onDelete: () => alert('Deleted!'),
  },
};

export const Active = {
  args: {
    ...Default.args,
    isActive: true,
  },
};
