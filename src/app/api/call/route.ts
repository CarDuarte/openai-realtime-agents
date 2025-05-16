import fastify from "fastify";

const app = fastify();

app.all("/incoming-call", async (request, reply) => {
  console.log("Incoming call");

  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Hi, you have called Pacific College support. How can we help?</Say>
  <Connect>
    <Stream url="wss://${request.headers.host}/media-stream" />
  </Connect>
</Response>`;

  reply.type("text/xml").send(twimlResponse);
});

// To start the server (if this is a standalone file)
app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
