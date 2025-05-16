import { NextRequest } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER!;

const client = twilio(accountSid, authToken);

export async function POST(request: NextRequest) {
  const { query: verificationCode } = await request.json();
  await client.messages.create({
    body: `Your Pacific College verification code is: ${verificationCode}`,
    from: twilioPhone,
    // to: `${providedPhone}`, // Make sure number includes country code
    to: `+50495858354`, // Make sure number includes country code
  });
}
