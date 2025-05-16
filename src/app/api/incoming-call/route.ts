export async function POST(request: any, reply: any) {
  console.log("Incoming call");

  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Hi, you have called Pacific College support. How can we help?</Say>
  <Connect>
    <Stream url="wss://${request.headers.host}/media-stream" />
  </Connect>
</Response>`;

  reply.type("text/xml").send(twimlResponse);
}
