import { ImageResponse } from "next/og";

export const contentType = "image/png";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stateParam = searchParams.get('state');
  
  // Default to score 0 if no state provided
  const score = stateParam ? JSON.parse(Buffer.from(stateParam, 'base64').toString()).score : 0;

  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px'
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 20 }}>Score: {score}</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 50px)',
            gap: '1px',
            backgroundColor: '#ddd',
            border: '1px solid #ccc'
          }}
        >
          {Array(64).fill(null).map((_, i) => (
            <div 
              key={i}
              style={{
                backgroundColor: 'white',
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          ))}
        </div>
      </div>
    ),
    {
      width: 600,
      height: 400,
      headers: {
        'Content-Type': 'image/png',
      },
    }
  );
}
