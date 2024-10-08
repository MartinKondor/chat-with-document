import OpenAI from 'openai';

export async function createOpenAIEmbedding(
  openai: OpenAI,
  text: string,
): Promise<number[]> {
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
