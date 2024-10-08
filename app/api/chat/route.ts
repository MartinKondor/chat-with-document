import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { env } from '@/lib/env.mjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/*
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

// Create an embedding for the search query
const queryEmbedding = await createOpenAIEmbedding(openai, query);

// Perform the similarity search using pgvector
const searchResults = await prisma.$queryRaw<SearchResult[]>`
  SELECT 
    content,
    1 - (embeddings <=> ${queryEmbedding}::vector) as score
  FROM "SourceChunk"
  ORDER BY embeddings <=> ${queryEmbedding}::vector
  LIMIT ${Math.min(limit || 5, 5)}
`;

return NextResponse.json({ searchResults });
*/

export async function POST(request: NextRequest) {
  try {
    const { userMessage } = await request.json();

    // TODO: Implement chat logic here
    // 1. Use OpenAI to generate embeddings for the user's message
    // 2. Search the database for relevant chunks using the embeddings
    // 3. Use OpenAI to generate a response based on the relevant chunks and the user's message
    // 4. Return the response

    const response =
      'This is a placeholder response. Implement actual chat logic.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing the chat' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({});
}
