import twilio from "twilio";

export async function POST() {
  const twiml = new twilio.twiml.VoiceResponse();

  twiml.say("Hi, you have called Pacific College support. Connecting you now.");

  twiml.connect().stream({
    url: "wss://twilio-websocket-server-xziu.onrender.com/media-stream",
  });

  return new Response(twiml.toString(), {
    headers: {
      "Content-Type": "text/xml",
    },
    status: 200,
  });
}
