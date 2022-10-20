import { RecordDocumentData } from 'src/common/types';

export function useUtil() {
  function computeDuration(record: RecordDocumentData) {
    let millis = record.end.toMillis() - record.start.toMillis();
    if (record.breaks) {
      for (const b of record.breaks) {
        const dur = b.end.toMillis() - b.start.toMillis();
        millis -= dur;
      }
    }
    return millis;
  }

  return { computeDuration };
}
