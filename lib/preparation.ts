import {
  TxtParentNodeWithSentenceNodeContent,
  split as splitToSentences,
} from 'sentence-splitter';
import pdfParse from 'pdf-parse/lib/pdf-parse';
import { MAX_CHUNK_CHARACTERS } from './constants';

async function extractTextFromPDF(data: Buffer): Promise<string> {
  const result = await pdfParse(data, {
    pagerender: (pageData: any) => {
      let render_options = {
        normalizeWhitespace: false,
        disableCombineTextItems: false,
      };

      return pageData
        .getTextContent(render_options)
        .then(function (textContent: any) {
          let lastY,
            lastX,
            text = '';
          for (let item of textContent.items) {
            if (lastY !== item.transform[5] || !lastY) {
              text += '\n';
            } else if (lastX !== undefined && item.transform[4] - lastX > 1) {
              // Add space if there's a significant horizontal gap
              text += ' ';
            }
            text += item.str;
            lastY = item.transform[5];
            lastX = item.transform[4] + item.width;
          }
          return text;
        });
    },
    version: 'v2.0.550',
  });
  return result.text;
}

async function streamToBuffer(
  readableStream: ReadableStream<Uint8Array>,
): Promise<Buffer> {
  const reader = readableStream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

async function extractTextFromStream(
  readableStream: ReadableStream<Uint8Array>,
  fileName: string,
): Promise<string> {
  const fileType = fileName.split('.').pop()?.toLowerCase();
  const buffer = await streamToBuffer(readableStream);

  switch (fileType) {
    case 'pdf':
      return extractTextFromPDF(buffer);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

function chunkMultipleSentences(sentences: string[]): string[] {
  // Chunk multiple sentences together to create chunks containing multiple-sentences
  // keep in mind the character limit
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length >= MAX_CHUNK_CHARACTERS) {
      chunks.push(currentChunk.trim());
      currentChunk = ' ' + sentence + ' ';
    } else {
      currentChunk += ' ' + sentence;
    }
  }

  return chunks;
}

export async function chunkFileFromStream(
  readableStream: ReadableStream<Uint8Array>,
  fileName: string,
): Promise<string[]> {
  const content = await extractTextFromStream(readableStream, fileName);
  const cleanedText = content.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ');
  const sentences = splitToSentences(cleanedText)
    .filter((sentence) => sentence.type === 'Sentence')
    .map((sentence: TxtParentNodeWithSentenceNodeContent) => sentence.raw);
  return chunkMultipleSentences(sentences);
}
