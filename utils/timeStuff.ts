import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export function convertFromMinutesToMs(num: number) {
  return dayjs.duration({ minutes: num }).asMilliseconds();
}
