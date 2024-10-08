import { createOpenAIEmbedding } from '@/lib/ai-service';
import { MAX_FILE_CHARACTER_LENGTH } from '@/lib/constants';
import { chunkFile } from '@/lib/preparation';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { env } from '@/lib/env.mjs';
import { z } from 'zod';

const prisma = new PrismaClient();

const UploadSchema = z.object({
  content: z.string(),
});

export async function PUT(request: NextRequest) {
  try {
    const { content } = UploadSchema.parse(await request.json());

    if (content.length > MAX_FILE_CHARACTER_LENGTH) {
      return NextResponse.json(
        {
          error: `File content must be under ${MAX_FILE_CHARACTER_LENGTH} characters`,
        },
        { status: 400 },
      );
    }

    if (!env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is required' },
        { status: 400 },
      );
    }

    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    // First chunk the content into smaller parts
    const chunks = chunkFile(content);

    // Then create embeddings for each chunk
    const embeddings = await Promise.all(
      chunks
        .filter((chunk) => chunk.length > 0)
        .map((chunk) => createOpenAIEmbedding(openai, chunk)),
    );

    // Remove all other embeddings
    await prisma.sourceChunk.deleteMany();

    // Use a transaction to ensure all insertions are successful
    // NOTE: Ugly because Prisma does not support pgvector currently
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < chunks.length; i++) {
        await tx.$executeRaw`
          INSERT INTO "SourceChunk" (id, content, embeddings)
          VALUES (
            ${String(new Date().getTime()) + crypto.randomUUID()},
            ${chunks[i]},
            ${JSON.stringify(embeddings[i])}::vector
          )
        `;
      }
    });

    return NextResponse.json({
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'An error occurred while uploading the file' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({});
}
