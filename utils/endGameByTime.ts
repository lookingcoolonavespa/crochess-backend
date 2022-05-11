import Game from '../models/Game';

export default async function endGameByTime(
  gameId: string,
  winner: 'black' | 'white'
) {
  const game = await Game.findById(gameId);
  if (!game) return;

  const loser = winner === 'white' ? 'black' : 'white';

  game.active = false;
  game.winner = winner;
  game.causeOfDeath = 'time';
  game.turnStart = undefined;
  game[loser].timeLeft = 0;

  await game.save();
}
