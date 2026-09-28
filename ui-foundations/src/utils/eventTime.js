const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Lagos', day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
});
export function formatEventTime(value) {
  const date = new Date(value);
  return value && Number.isFinite(date.getTime()) ? formatter.format(date) : '—';
}
