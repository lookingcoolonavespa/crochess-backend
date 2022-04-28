import Game from '../models/Game';

export default async function endGameByTime(
  gameId: string,
  winner: 'black' | 'white'
) {
  const game = await Game.findById(gameId);
  if (!game) return;

  game.active = false;
  game.winner = winner;
  game.causeOfDeath = 'time';

  await game.save();
}
