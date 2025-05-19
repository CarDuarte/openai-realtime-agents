import twilio from "twilio";

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

  const twiml = new twilio.twiml.VoiceResponse();

  twiml.say("Hi, you're being connected to the Pacific College AI assistant.");

  twiml.connect().stream({
    url: `wss://twilio-websocket-server-xziu.onrender.com/media-stream?session=${sessionId}`,
  });

  return new Response(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
    status: 200,
  });
}
