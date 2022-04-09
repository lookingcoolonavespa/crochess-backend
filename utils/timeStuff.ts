import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export function convertFromMinutesToMs(num: number) {
  return dayjs.duration({ minutes: num }).asMilliseconds();
}

export function formatTime(ms: number) {
  const duration = dayjs.duration(ms);

  const atLeastAnHour = duration.asHours() >= 1;
  const belowTwentySeconds = duration.asSeconds() <= 20;

  switch (true) {
    case atLeastAnHour: {
      return duration.format('HH:mm:ss');
    }
    case belowTwentySeconds: {
      return duration.format('mm:ss:SSS');
    }
    default: {
      return duration.format('mm:ss');
    }
  }
}

export function addTime(ms: number, timeToAdd: number, unit: string) {
  return dayjs
    .duration(ms)
    .add({
      [unit]: timeToAdd,
    })
    .asMilliseconds();
}
