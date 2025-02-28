import type { GameState } from "./gameLogic";

export function checkCollisions(state: GameState): GameState {
  const [x, y] = state.snake[0];
  
  // Check wall collisions (assuming 8x8 grid)
  const wallCollision = x < 0 || x >= 8 || y < 0 || y >= 8;
  
  // Check self-collision with body segments
  const selfCollision = state.snake
    .slice(1)
    .some(([sx, sy]) => sx === x && sy === y);
  
  // Win condition - length based
  const won = state.snake.length >= 10;

  return {
    ...state,
    gameOver: wallCollision || selfCollision,
    won: won
  };
}
