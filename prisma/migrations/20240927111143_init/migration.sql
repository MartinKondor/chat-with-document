-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "SourceChunk" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embeddings" vector,

    CONSTRAINT "SourceChunk_pkey" PRIMARY KEY ("id")
);

CREATE INDEX ON "SourceChunk" USING ivfflat (vectorizedContent vector_cosine_ops);
