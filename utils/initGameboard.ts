import { Gameboard } from 'crochess-api';
import { AllPieceMap, GameboardObj } from 'crochess-api/dist/types/interfaces';

export default function initGameboard(pieceMap: AllPieceMap): GameboardObj {
  const gameboard = Gameboard();

  let color: keyof typeof pieceMap;
  for (color in pieceMap) {
    const map = pieceMap[color];

    let pieceType: keyof typeof map;
    for (pieceType in map) {
      const squares = map[pieceType];
      squares.forEach((s) =>
        gameboard.at(s).place({ type: pieceType, color: color })
      );
    }
  }

  return gameboard;
}
