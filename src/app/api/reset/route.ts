import { GameState } from "~/lib/gameLogic";

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
