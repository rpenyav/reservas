import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateStreamingResponse(
    prompt: string,
    onChunk: (chunk: string) => void, // Callback para manejar chunks
  ): Promise<void> {
    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    for await (const part of stream) {
      const delta = part.choices[0]?.delta?.content || '';
      onChunk(delta); // Llama al callback con cada chunk
    }
  }
}
