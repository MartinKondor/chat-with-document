import {
  TxtParentNodeWithSentenceNodeContent,
  split as splitToSentences,
} from 'sentence-splitter';
import {
  MAX_CHUNK_CHARACTERS,
  MAX_CHUNK_OVERLAP_CHARACTERS,
} from './constants';

const parseSentences = (content: string) => {
  const cleanedText = content.replace(/\n/g, ' ').replace(/ {2,}/g, ' ');
  return splitToSentences(cleanedText)
    .filter(
      (sentence: TxtParentNodeWithSentenceNodeContent) =>
        sentence.type === 'Sentence',
    )
    .map((sentence: TxtParentNodeWithSentenceNodeContent) => sentence.raw);
};

const chunkSingleSentence = (sentence: string): string[] => {
  // Chunk a single sentence into smaller chunks by words
  const chunks: string[] = [];
  const words = sentence.split(/\s+/);
  let currentChunk = '';

  for (const word of words) {
    if (currentChunk.length + word.length + 1 > MAX_CHUNK_CHARACTERS) {
      chunks.push(currentChunk.trim());
      currentChunk = word;
    } else {
      currentChunk += (currentChunk.length > 0 ? ' ' : '') + word;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

const chunkMultipleSentences = (sentences: string[]): string[] => {
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let overlapText = '';

  const addChunk = (chunk: string) => {
    chunks.push(chunk);
    const words = chunk.split(/\s+/);
    overlapText = words.slice(-MAX_CHUNK_OVERLAP_CHARACTERS).join(' ');
  };

  for (const sentence of sentences) {
    if (sentence.length === 0) {
      continue;
    }

    // In case of weirdly long sentences
    if (sentence.length >= MAX_CHUNK_CHARACTERS) {
      console.warn(
        `Sentence is too long: ${sentence.length} characters, splitting it into smaller chunks by words.`,
      );

      const sentenceChunks = chunkSingleSentence(sentence);
      for (const sentenceChunk of sentenceChunks) {
        const currentChunkInOneString = currentChunk.join(' ');
        if (
          currentChunkInOneString.length + sentenceChunk.length + 1 >
          MAX_CHUNK_CHARACTERS
        ) {
          if (currentChunk.length > 0) {
            addChunk(currentChunkInOneString.trim());
          }
          currentChunk = [overlapText, sentenceChunk].filter(Boolean);
        } else {
          currentChunk.push(sentenceChunk);
        }
      }
      continue;
    }

    const currentChunkInOneString = currentChunk.join(' ');
    if (
      currentChunkInOneString.length + sentence.length + 1 >
      MAX_CHUNK_CHARACTERS
    ) {
      if (currentChunk.length > 0) {
        addChunk(currentChunkInOneString.trim());
      }
      currentChunk = [overlapText, sentence].filter(Boolean);
    } else {
      currentChunk.push(sentence);
    }
  }

  if (currentChunk.length > 0) {
    // Remove possible duplicated sentences
    currentChunk = currentChunk.filter(
      (sentence, index, self) => self.indexOf(sentence) === index,
    );
    addChunk(currentChunk.join(' ').trim());
  }

  return chunks;
};

export const chunkFile = (content: string): string[] => {
  const rawSentences = parseSentences(content);
  return chunkMultipleSentences(rawSentences);
};
