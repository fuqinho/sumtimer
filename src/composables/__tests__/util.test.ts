import { describe, expect, it } from 'vitest';
import { useUtil } from '../util';

const { maxDate, minDate, fitDate } = useUtil();

describe('util', () => {
  it('returns max date', () => {
    const d1 = new Date(2000, 1, 1, 0, 0, 0);
    const d2 = new Date(2000, 1, 1, 0, 0, 1);

    expect(maxDate(d1, d2)).toBe(d2);
    expect(maxDate(d2, d1)).toBe(d2);
    expect(maxDate(d1, d1)).toBe(d1);
  });

  it('returns min date', () => {
    const d1 = new Date(2000, 1, 1, 0, 0, 0);
    const d2 = new Date(2000, 1, 1, 0, 0, 1);

    expect(minDate(d1, d2)).toBe(d1);
    expect(minDate(d2, d1)).toBe(d1);
    expect(minDate(d2, d2)).toBe(d2);
  });

  it('fits date between', () => {
    const start = new Date(2000, 1, 1, 6, 0, 0);
    const end = new Date(2000, 1, 1, 12, 0, 0);
    const d1 = new Date(2000, 1, 1, 3, 0, 0);
    const d2 = new Date(2000, 1, 1, 8, 0, 0);
    const d3 = new Date(2000, 1, 1, 13, 0, 0);

    expect(fitDate(d1, start, end)).toBe(start);
    expect(fitDate(d2, start, end)).toBe(d2);
    expect(fitDate(d3, start, end)).toBe(end);
  });
});
