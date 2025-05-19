import { NextApiRequest, NextApiResponse } from "next";
import twilio from "twilio";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const twiml = new twilio.twiml.VoiceResponse();

  twiml.say("Hi, you have called Pacific College support. Connecting you now.");

  // NOTE: You can use a static stream URL, or dynamically build it using req.headers.host
  twiml.connect().stream({
    url: `wss://${req.headers.host}/media-stream`,
  });

  res.setHeader("Content-Type", "text/xml");
  res.status(200).send(twiml.toString());
}
