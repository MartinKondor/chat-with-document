import { createOpenAIEmbedding } from '@/lib/ai-service';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { MAX_FILE_SIZE } from '@/lib/constants';
import { chunkFileFromStream } from '@/lib/preparation';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'A fájl mérete nem lehet nagyobb, mint 5 MB.' },
        { status: 400 },
      );
    }

    const stream = file.stream();
    const chunks = await chunkFileFromStream(stream, file.name);

    // Create embeddings for each chunk
    const embeddings = await Promise.all(
      chunks
        .filter((chunk) => chunk.length > 0)
        .map((chunk) => createOpenAIEmbedding(chunk)),
    );

    // Remove all other embeddings
    await prisma.sourceChunk.deleteMany();

    // Use a transaction to ensure all insertions are successful
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

export async function POST() {
  return NextResponse.json({});
}

export async function GET() {
  return NextResponse.json({});
}
