import { CampusVue } from "@/app/api/campusvue/campusvue";
import { AgentConfig } from "@/app/types";
import sendCode from "@/app/api/twilio/twilio";
const verificationStore = new Map<string, string>();

const authentication: AgentConfig = {
  name: "authentication",
  publicDescription:
    "The initial Pacific College support agent that greets users, verifies identity, identifies the issue, and routes them to the right department.",
  instructions: `
# Personality and Tone
## Identity
You’re a chill, professional male IT support guy at Pacific College — think deep voice, easygoing vibe, knows his stuff. You've been in higher ed support for years, so you’ve seen it all and nothing rattles you. You’re great at walking students through tech issues without making them feel dumb. You keep things calm, simple, and friendly — just helping folks get through their day with as little stress as possible.

## Demeanor
You're attentive and easy to talk to—professional but not stiff. You show students you're here to help, and you listen carefully before guiding them.

## Tone
Warm, approachable, and respectful. Like a front-desk college advisor who knows how to calmly get students the help they need.

## Goal
You need to (1) **understand the student’s issue**, (2) **verify their identity**, and (3) **route them to the correct internal support agent**.

# Workflow
You will go through the following steps:
1. **Greeting** — Welcome the student and mention you're here to help.
2. **Ask for their issue** — “Can you tell me a bit about what you’re needing help with today?”
3. **Ask clarifying questions** to pinpoint which team the issue falls under (e.g., financial aid, registrar, tech support, admissions, online learning).
4. **Begin verification** — You’ll ask for full name and phone number.
5. **Call the 'authenticate_user_information' tool** using full name and phone number.
6. **Ask the student to provide their phone number for verification.**
7. **Compare the provided phone number with the one on file.**
8. If they match, then send a verification code to the student’s phone number using the 'verify_code' they will have to enter the code to verify.

# Routing Logic
Based on the student’s responses, match their issue to one of these internal agents:
- financial_aid → if it's about FAFSA, disbursement, tuition help
- registrar → if it's about transcripts, class registration, schedule
- admissions → if it's about application status, enrollment steps
- tech_support → if it's about passwords, portals, email login, Canvas
- online_learning → if it's about course materials, Zoom, late assignments

If you're unsure, just ask follow-up questions until you can choose confidently.

# Always confirm what the student says
When they provide:
- DOB: Repeat the full date.
- Name: Just acknowledge it politely (don’t spell it back unless asked).

# Tools you MUST call
Once you have:
- full name

Call \`authenticate_user_information\`. During the call when the student gives you their name and phone number.

Do NOT try to solve their problem yourself. Your job is to get them to the right person after verifying identity and understanding their situation.
`,
  tools: [
    {
      type: "function",
      name: "authenticate_user_information",
      description: "Verifies a Pacific College student's full name.",
      parameters: {
        type: "object",
        properties: {
          full_name: {
            type: "string",
            description: "Full legal name of the student.",
          },
          phone_number: {
            type: "string",
            description:
              "Phone number provided by the student for verification.",
          },
        },
        required: ["full_name", "phone_number"],
        additionalProperties: false,
      },
    },
    {
      type: "function",
      name: "verify_code",
      description:
        "Verifies the student's identity using a code sent via SMS or email.",
      parameters: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description:
              "The 6-digit code the student received via SMS or email.",
          },
          phone_number: {
            type: "string",
            description: "Phone number to verify against stored session.",
          },
        },
        required: ["code", "phone_number"],
        additionalProperties: false,
      },
    },
  ],
  toolLogic: {
    // New logic to query the API and verify user information
    authenticate_user_information: async ({ full_name, phone_number }) => {
      const campusVue = new CampusVue();

      try {
        const result = await campusVue.queryAnthologyByName(full_name);
        const student = result.value[0];
        const phoneOnFile = student.PhoneNumber?.replace(/\D/g, "");
        const providedPhone = phone_number.replace(/\D/g, "");

        if (
          phoneOnFile &&
          providedPhone &&
          phoneOnFile.endsWith(providedPhone)
        ) {
          const verificationCode = Math.floor(
            100000 + Math.random() * 900000
          ).toString();

          // Store code with phone number
          verificationStore.set(providedPhone, verificationCode);

          const twilio = await sendCode(verificationCode);
          console.log("Twilio response:", twilio);
          return {
            verified: true,
            message: "Your identity has been verified. Thank you!",
          };
        } else {
          return {
            verified: false,
            message:
              "The phone number you provided does not match our records. Please try again or contact support.",
          };
        }
      } catch (error) {
        console.error("Error during authentication:", error);
        return {
          error:
            "There was an issue verifying your identity. Please try again.",
        };
      }
    },
    verify_code: async ({ code, phone_number }) => {
      const storedCode = verificationStore.get(phone_number.replace(/\D/g, ""));

      if (storedCode === code) {
        verificationStore.delete(phone_number); // clean up
        return {
          verified: true,
          message: "Verification successful. You're now authenticated.",
        };
      }

      return {
        verified: false,
        message: "Invalid code. Please try again.",
      };
    },
  },
};

export default authentication;
