import { SearchResult } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { createOpenAIEmbedding } from '@/lib/ai-service';

const prisma = new PrismaClient();

const SearchSchema = z.object({
  query: z.string(),
  openaiApiKey: z.string(),
  limit: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { query, openaiApiKey, limit } = SearchSchema.parse(
      await request.json(),
    );

    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is required' },
        { status: 400 },
      );
    }

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
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'An error occurred while searching' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({});
}
