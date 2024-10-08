import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { env } from '@/lib/env.mjs';
import { PrismaClient } from '@prisma/client';
import { createOpenAIEmbedding } from '@/lib/ai-service';
import { SearchResult } from '@/lib/types';
import { SYSTEM_PROMPT } from '@/lib/prompts';
import { z } from 'zod';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs';
import { USED_GPT_MODEL } from '@/lib/constants';

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const ChatUiMessage = z.object({
  text: z.string(),
  isUser: z.boolean(),
});

const ChatPostSchema = z.object({
  userMessage: z.string(),
  previousMessages: z.array(ChatUiMessage),
});

export async function POST(request: NextRequest) {
  try {
    const { userMessage, previousMessages } = (await request.json()) as z.infer<
      typeof ChatPostSchema
    >;
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

    const previousMessagesOpenAIType = previousMessages.map(
      (message: z.infer<typeof ChatUiMessage>) => ({
        role: message.isUser ? 'user' : 'assistant',
        content: message.text,
      }),
    );

    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      ...previousMessagesOpenAIType,
      {
        role: 'user',
        content: `Context: ${context}\n\nQuestion: ${userMessage}`,
      },
    ] as ChatCompletionMessageParam[];

    const stream = await openai.chat.completions.create({
      model: USED_GPT_MODEL,
      messages,
      stream: true,
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            controller.enqueue(content);
          }
          controller.close();
        },
      }),
      {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache',
        },
      },
    );
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
