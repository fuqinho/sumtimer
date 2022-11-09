import { date } from 'quasar';
import { startDayOfWeek, startHourOfDay } from '@/common/constants';
import type { RecordDocumentData } from '@/types/documents';

export function useUtil() {
  function startOfDay(time: Date) {
    let result = date.startOfDate(time, 'day');
    result = date.addToDate(result, { hours: startHourOfDay });
    if (time < result) result = date.subtractFromDate(result, { days: 1 });
    return result;
  }

  function startOfWeek(time: Date) {
    let result = startOfDay(time);
    while (date.getDayOfWeek(result) != startDayOfWeek)
      result = date.subtractFromDate(result, { days: 1 });
    return result;
  }

  function maxDate(a: Date, b: Date) {
    return a >= b ? a : b;
  }

  function minDate(a: Date, b: Date) {
    return a <= b ? a : b;
  }

  function fitDate(time: Date, start: Date, end: Date) {
    return minDate(maxDate(time, start), end);
  }

  function computeDuration(rec: RecordDocumentData, start?: Date, end?: Date) {
    let res = 0;
    if (rec.subs) {
      for (const sub of rec.subs) {
        const s =
          start && end
            ? fitDate(sub.start.toDate(), start, end)
            : sub.start.toDate();
        const e =
          start && end
            ? fitDate(sub.end.toDate(), start, end)
            : sub.end.toDate();
        res += e.getTime() - s.getTime();
      }
    } else {
      const s =
        start && end
          ? fitDate(rec.start.toDate(), start, end)
          : rec.start.toDate();
      const e =
        start && end ? fitDate(rec.end.toDate(), start, end) : rec.end.toDate();
      res = e.getTime() - s.getTime();
    }
    return res;
  }

  function hourStr(ms: number) {
    return (ms / (60 * 60 * 1000)).toFixed(1);
  }

  return {
    startOfDay,
    startOfWeek,
    maxDate,
    minDate,
    fitDate,
    computeDuration,
    hourStr,
  };
}
