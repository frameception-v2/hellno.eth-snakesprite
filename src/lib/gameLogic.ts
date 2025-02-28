export type GameState = {
  snake: [number, number][]
  direction: "UP" | "DOWN" | "LEFT" | "RIGHT"
  score: number
  gameOver: boolean
  won: boolean
}

export function moveSnake(state: GameState): GameState {
  const head = [...state.snake[0]];
  switch(state.direction) {
    case "UP": head[1]--; break;
    case "DOWN": head[1]++; break; 
    case "LEFT": head[0]--; break;
    case "RIGHT": head[0]++; break;
  }
  return {...state, snake: [head as [number, number], ...state.snake.slice(0, -1)]};
}

export function serializeState(state: GameState): string {
  return btoa(JSON.stringify(state));
}

export function deserializeState(str: string): GameState {
  return JSON.parse(atob(str));
}
