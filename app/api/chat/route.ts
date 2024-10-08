import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { env } from '@/lib/env.mjs';
import { PrismaClient } from '@prisma/client';
import { createOpenAIEmbedding } from '@/lib/ai-service';
import { SearchResult } from '@/lib/types';
import { SYSTEM_PROMPT } from '@/lib/prompts';

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userMessage } = await request.json();
    const limit = 5;

    // Create an embedding for the search query
    const queryEmbedding = await createOpenAIEmbedding(userMessage);

    // Perform the similarity search using pgvector
    const searchResults = await prisma.$queryRaw<SearchResult[]>`
      SELECT 
        content,
        1 - (embeddings <=> ${queryEmbedding}::vector) as score
      FROM "SourceChunk"
      ORDER BY embeddings <=> ${queryEmbedding}::vector
      LIMIT ${Math.min(limit || 5, 5)}
    `;

    const context = searchResults.map((result) => result.content).join('\n\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Context: ${context}\n\nQuestion: ${userMessage}`,
        },
      ],
    });

    const response = completion.choices[0].message.content;
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
