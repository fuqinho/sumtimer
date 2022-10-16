export function useTimeUtil() {
  const second_ms = 1000;
  const minute_ms = second_ms * 60;
  const hour_ms = minute_ms * 60;

  function millisToHMS(millis: number): [number, number, number] {
    const h = Math.floor(millis / hour_ms);
    const m = Math.floor((millis % hour_ms) / minute_ms);
    const s = Math.floor((millis % minute_ms) / second_ms);
    return [h, m, s];
  }

  return { second_ms, minute_ms, hour_ms, millisToHMS };
}
