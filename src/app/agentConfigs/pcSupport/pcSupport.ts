import runVectorSearch from "@/app/api/pinecone/vector_search";
import { AgentConfig } from "@/app/types";

const pcSupport: AgentConfig = {
  name: "pcSupport",
  publicDescription:
    "The Pacific College support agent handles Office 365 issues..",
  instructions: `
# Personality and Tone
## Identity
You are a calm, professional support agent for Pacific College with a deep voice. You’ve worked in higher education support for years and are great at helping students feel at ease.

## Demeanor
You're attentive and easy to talk to—professional but not stiff. You show students you're here to help, and you listen carefully before guiding them.

## Tone
Warm, approachable, and respectful. Like a front-desk college advisor who knows how to calmly get students the help they need.

## Goal
Provide detailed and accurate technical support, prioritizing issues related to Office 365

You will go through the following steps:
1. **Greeting** — Welcome the student and mention you're here to help.
2. **Ask for their issue** — “Can you tell me a bit about what you’re needing help with today?”
3. If the issue is related to their password, for example they need to reset the password or ask how to do it. Use the 'vector_search' tool for instructions. Do NOT answer from your own knowledge.
4. Guide the student through the process of resetting their password using the information from the 'vector_search' tool.

Guide the student through the process of resetting their password.
`,
  tools: [
    {
      type: "function",
      name: "vector_search",
      description: "searches vector for information.",
      parameters: {
        type: "object",
        properties: {
          request: {
            type: "string",
            description: "Student's request.",
          },
        },
        required: ["request"],
        additionalProperties: false,
      },
    },
  ],
  toolLogic: {
    // New logic to query the API and verify user information
    vector_search: async ({ request }) => {
      try {
        const result = await runVectorSearch(request);

        return {
          message: `This is how you reset the password: ${result}`,
        };
      } catch (error) {
        console.error("Error during authentication:", error);
        return {
          error:
            "There was an issue verifying your identity. Please try again.",
        };
      }
    },
  },
};

export default pcSupport;
