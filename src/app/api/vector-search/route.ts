import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { NextRequest, NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.Index("pc-support");

export async function POST(request: NextRequest) {
  try {
    const { query: userQuery } = await request.json();
    // 1. Get embedding for the user query
    const embeddingResponse = await client.embeddings.create({
      model: "text-embedding-3-small", // or another model like "text-embedding-ada-002"
      input: userQuery,
    });

    const [{ embedding }] = embeddingResponse.data;

    // 2. Query Pinecone with the embedding
    const queryResponse = await index.query({
      vector: embedding,
      topK: 5,
      includeMetadata: true,
    });

    // 3. Extract and return relevant result
    const results = queryResponse.matches?.map((match) => ({
      score: match.score,
      text: match.metadata?.text, // assuming you stored the document text in metadata
    }));

    return NextResponse.json({ result: results });
  } catch (error) {
    console.error("Error in vector_search:", error);
  }
}
