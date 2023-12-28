import { useI18n } from 'vue-i18n';
import { date } from 'quasar';
import { startDayOfWeek, startHourOfDay } from '@/common/constants';
import type { RecordDocumentData } from '@/types/documents';

export function useUtil() {
  const { t } = useI18n();
  const secInMs = 1000;
  const minInMs = secInMs * 60;
  const hourInMs = minInMs * 60;

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

  function startOfMonth(time: Date) {
    let result = new Date(time.getFullYear(), time.getMonth(), 1);
    result = date.addToDate(result, { hours: startHourOfDay });
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
    return (ms / hourInMs).toFixed(1);
  }

  function durationStr(ms: number): string {
    const hour = Math.floor(ms / hourInMs);
    const min = Math.floor((ms % hourInMs) / minInMs);
    const sec = Math.floor((ms % minInMs) / secInMs);
    if (hour > 0) {
      return hour + ':' + ('00' + min).slice(-2) + ':' + ('00' + sec).slice(-2);
    } else {
      return min + ':' + ('00' + sec).slice(-2);
    }
  }

  function lcl(label: string) {
    return label.startsWith('lcl$') ? t(label.substring(4)) : label;
  }

  return {
    startOfDay,
    startOfWeek,
    startOfMonth,
    maxDate,
    minDate,
    fitDate,
    computeDuration,
    hourStr,
    durationStr,
    lcl,
  };
}
