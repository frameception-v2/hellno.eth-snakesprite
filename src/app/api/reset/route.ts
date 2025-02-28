export type GameState = {
  snake: [number, number][]
  direction: "UP" | "DOWN" | "LEFT" | "RIGHT"
  score: number
  gameOver: boolean
  won: boolean
}

export async function POST() {
  const initialState: GameState = {
    snake: [[4, 4]],
    direction: "RIGHT",
    score: 0,
    gameOver: false,
    won: false
  }
  return Response.json(initialState)
}
