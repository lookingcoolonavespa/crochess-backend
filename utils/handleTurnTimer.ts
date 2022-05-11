import endGameByTime from './endGameByTime';

const timers: { [key: string]: ReturnType<typeof setTimeout> } = {};

export default function handleTurnTimer(
  gameId: string,
  active: boolean,
  turn: 'white' | 'black',
  timeLeft: number
) {
  if (timers[gameId]) clearTimeout(timers[gameId]);
  if (!active) {
    delete timers[gameId];
  } else {
    timers[gameId] = setTimeout(() => {
      const winner = turn === 'white' ? 'black' : 'white';
      try {
        endGameByTime(gameId, winner);
      } catch (err) {
        console.log(err);
      }
    }, timeLeft);
  }
}
