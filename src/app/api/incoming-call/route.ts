export async function POST() {
  // Create a new session
  const sessionResponse = await fetch(
    "https://api.openai.com/v1/realtime/sessions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-realtime-preview-2024-12-17",
      }),
    }
  );

  const session = await sessionResponse.json();
  const sessionId = session.id;

  console.log("✅ OpenAI session created:", sessionId);

  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Hi, you're being connected to the Pacific College AI assistant.</Say><Connect><Stream url="wss://1bbb-181-115-34-162.ngrok-free.app/media-stream" name="${sessionId}" track="both_tracks" /></Connect></Response>`;

  console.log(twimlResponse);

  return new Response(twimlResponse, {
    headers: { "Content-Type": "application/xml" },
  });
}
