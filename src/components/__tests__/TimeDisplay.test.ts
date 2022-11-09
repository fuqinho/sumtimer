import { render } from '@testing-library/vue';
import { expect, test } from 'vitest';
import TimeDisplay from '../TimeDisplay.vue';

test('Show 21:34', async () => {
  const renderResult = render(TimeDisplay, {
    props: {
      time: (21 * 60 + 34) * 1000, // 21:34
    },
  });
  renderResult.getByText('21');
  renderResult.getByText('34');
  expect(renderResult.getAllByText(':').length).toBe(1);
});

test('Show 0:03', async () => {
  const renderResult = render(TimeDisplay, {
    props: {
      time: 3 * 1000, // 21:34
    },
  });
  renderResult.getByText('0');
  renderResult.getByText('03');
  expect(renderResult.getAllByText(':').length).toBe(1);
});

test('Show 124:07:00', async () => {
  const renderResult = render(TimeDisplay, {
    props: {
      time: (124 * 60 + 7) * 60 * 1000, // 21:34
    },
  });
  renderResult.getByText('124');
  renderResult.getByText('07');
  renderResult.getByText('00');
  expect(renderResult.getAllByText(':').length).toBe(2);
});
