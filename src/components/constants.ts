import { CategoryData, UserDocumentData } from './models';

export const defaultColorPalette = [
  '#EF5350',
  '#EC407A',
  '#AB47BC',
  '#7E57C2',
  '#5C6BC0',
  '#42A5F5',
  '#29B6F6',
  '#26C6DA',
  '#26A69A',
  '#66BB6A',
  '#9CCC65',
  '#D4E157',
  '#FFEE58',
  '#FFCA28',
  '#FFA726',
  '#FF7043',
  '#8D6E63',
  '#BDBDBD',
  '#78909C',
];

export const defaultCategoryColor = '#bdbdbd';

export const presetCategories: CategoryData[] = [
  {
    id: 'work',
    label: 'Work',
    color: '#ef5350',
  },
  {
    id: 'learning',
    label: 'Learning',
    color: '#29b6f6',
  },
  {
    id: 'exercise',
    label: 'Exercise',
    color: '#9ccc65',
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    color: '#ffa726',
  },
  {
    id: 'rest',
    label: 'Rest',
    color: '#7e57c2',
  },
  {
    id: 'chore',
    label: 'Chore',
    color: '#8d6e63',
  },
  {
    id: 'others',
    label: 'Others',
    color: '#bdbdbd',
  },
];

export const presetActivities = [
  {
    cid: 'work',
    label: 'General work',
  },
  {
    cid: 'learning',
    label: 'General learning',
  },
  {
    cid: 'exercise',
    label: 'Walking',
  },
  {
    cid: 'entertainment',
    label: 'Video game',
  },
  {
    cid: 'rest',
    label: 'Sleep',
  },
  {
    cid: 'chore',
    label: 'Room cleaning',
  },
  {
    cid: 'chore',
    label: 'Errands',
  },
];

export const presetUserDocumentData: UserDocumentData = {
  categories: presetCategories,
};
