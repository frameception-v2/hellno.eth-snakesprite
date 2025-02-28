- [ ] Task 1: Create core GameState structure and reset endpoint  
  File: src/app/api/reset/route.ts  
  Action: Create new route file  
  Code:  
  ```typescript
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
  ```  
  Endpoint: POST /api/reset  
  Completion: POST returns 200 with snake.length === 1

- [ ] Task 2: Add movement logic and state serialization  
  File: src/lib/gameLogic.ts  
  Action: Create new utility file  
  Code:  
  ```typescript
  export function moveSnake(state: GameState): GameState {
    const head = [...state.snake[0]];
    switch(state.direction) {
      case "UP": head[1]--; break;
      case "DOWN": head[1]++; break;
      case "LEFT": head[0]--; break;
      case "RIGHT": head[0]++; break;
    }
    return {...state, snake: [head, ...state.snake.slice(0, -1)]};
  }

  export function serializeState(state: GameState): string {
    return btoa(JSON.stringify(state));
  }

  export function deserializeState(str: string): GameState {
    return JSON.parse(atob(str));
  }
  ```  
  Completion: Manual state edit shows head position changes

- [ ] Task 3: Implement collision detection  
  File: src/lib/collisionDetection.ts  
  Action: Create new utility file  
  Code:  
  ```typescript
  export function checkCollisions(state: GameState): GameState {
    const [x,y] = state.snake[0];
    const wallCollision = x < 0 || x >= 8 || y < 0 || y >= 8;
    const selfCollision = state.snake.slice(1).some(([sx,sy]) => sx === x && sy === y);
    const won = state.snake.length >= 10;
    
    return {
      ...state,
      gameOver: wallCollision || selfCollision,
      won: won
    };
  }
  ```  
  Completion: Head at [8,4] sets gameOver=true

- [ ] Task 4: Create basic OG template  
  File: src/app/api/image/route.ts  
  Action: Create new route file  
  Code:  
  ```typescript
  import { ImageResponse } from '@vercel/og';

  export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const stateParam = searchParams.get('state');
    
    return new ImageResponse(
      (
        <div style={{backgroundColor: 'white', width: '100%', height: '100%'}}>
          <div>Score: {stateParam ? JSON.parse(atob(stateParam)).score : 0}</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(8, 50px)'}}>
            {Array(64).fill().map((_,i) => 
              <div key={i} style={{border: '1px solid black', height: 50}}/>)}
          </div>
        </div>
      )
    );
  }
  ```  
  Endpoint: GET /api/image  
  UI: 8x8 grid, score display  
  Completion: Image renders with visible grid

- [ ] Task 5: Implement frame action handling  
  File: src/app/api/frame/route.ts  
  Action: Create new route file  
  Code:  
  ```typescript
  export async function POST(request: Request) {
    const body = await request.json();
    const state = deserializeState(body.state);
    
    const validTurns = {
      UP: ["LEFT", "RIGHT"],
      DOWN: ["LEFT", "RIGHT"],
      LEFT: ["UP", "DOWN"],
      RIGHT: ["UP", "DOWN"]
    };

    if (validTurns[state.direction].includes(body.buttonIndex)) {
      state.direction = body.buttonIndex;
    }
    
    return Response.json(serializeState(state));
  }
  ```  
  Endpoint: POST /api/frame  
  Completion: ButtonIndex 2 maintains RIGHT direction

- [ ] Task 6: Add result screens and reset flow  
  File: src/app/api/image/route.ts  
  Action: Modify existing route  
  Code:  
  ```typescript
  // Add to ImageResponse JSX:
  {state.won ? (
    <div style={{position: 'absolute', top: '50%', left: '50%'}}>
      You Won!<button>Reset</button>
    </div>
  ) : state.gameOver ? (
    <div style={{position: 'absolute', top: '50%', left: '50%'}}>
      Game Over<button>Reset</button>
    </div>
  ) : null}
  ```  
  UI: Win/Lose overlays with reset button  
  Completion: GameOver state shows overlay

- [ ] Task 7: Implement state encryption  
  File: src/lib/security.ts  
  Action: Create new utility file  
  Code:  
  ```typescript
  import { createCipheriv, createDecipheriv } from 'crypto';

  export function encryptState(state: GameState): string {
    const iv = crypto.randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', process.env.SECRET_KEY!, iv);
    return iv.toString('base64') + ':' + cipher.update(JSON.stringify(state)) + cipher.final();
  }

  export function decryptState(encrypted: string): GameState {
    const [ivPart, data] = encrypted.split(':');
    const iv = Buffer.from(ivPart, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', process.env.SECRET_KEY!, iv);
    return JSON.parse(decipher.update(data) + decipher.final());
  }
  ```  
  Completion: Tampered state triggers reset

- [ ] Task 8: Add session expiration  
  File: src/lib/gameLogic.ts  
  Action: Modify GameState type  
  Code:  
  ```typescript
  type GameState = {
    // ...existing fields
    timestamp: number;
  }

  export function isExpired(state: GameState): boolean {
    return Date.now() - state.timestamp > 300_000; // 5 minutes
  }
  ```  
  Completion: Old timestamps show reset prompt

- [ ] Task 9: Implement state compression  
  File: src/lib/gameLogic.ts  
  Action: Modify serialize/deserialize  
  Code:  
  ```typescript
  import { brotliCompressSync, brotliDecompressSync } from 'zlib';

  export function serializeState(state: GameState): string {
    const compressed = brotliCompressSync(JSON.stringify(state));
    return btoa(String.fromCharCode(...compressed));
  }

  export function deserializeState(str: string): GameState {
    const buffer = Buffer.from(atob(str), 'binary');
    return JSON.parse(brotliDecompressSync(buffer).toString());
  }
  ```  
  Completion: State param size reduced by 50%

- [ ] Task 10: Add accessibility features  
  File: src/app/api/image/route.ts  
  Action: Modify OG template  
  Code:  
  ```typescript
  <div 
    aria-label={`Snake game ${state.gameOver ? 'game over' : ''} ${state.won ? 'won' : ''}`}
    style={{color: '#2A2A2A', backgroundColor: '#FFFFFF'}}
  >
  ```  
  UI: aria-labels, contrast ratios  
  Completion: HTML includes aria-label

- [ ] Task 11: Verify full game flow  
  File: (Manual verification)  
  Action: Test all user journeys  
  Completion: Can complete game cycle via buttons