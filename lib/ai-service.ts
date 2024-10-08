import OpenAI from 'openai';
import { env } from './env.mjs';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function createOpenAIEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error creating OpenAI embedding:', error);
    throw error;
  }
}
