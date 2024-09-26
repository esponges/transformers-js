import { Injectable } from '@nestjs/common';
const TransformersApi = Function('return import("@xenova/transformers")')();

@Injectable()
export class AppService {
  private transcriber: any;

  constructor() {
    // const { env } = TransformersApi;
    // env.allowLocalModels = false;
  }

  getHello(): string {
    return 'Hello World!';
  }

  async transformSentiment(text: string) {
    const { pipeline } = await TransformersApi;
    const pipe = await pipeline('sentiment-analysis');

    return await pipe(text);
  }

  async transformWhisper(
    audio: Float32Array,
    model: string,
    multilingual: boolean,
    quantized: boolean,
    subtask: string | null,
    language: string | null,
  ): Promise<string> {
    const isDistilWhisper = model.startsWith('distil-whisper/');

    let modelName = model;
    if (!isDistilWhisper && !multilingual) {
      modelName += '.en';
    }

    // Initialize or update the transcriber if needed
    if (
      !this.transcriber ||
      this.transcriber.model !== modelName ||
      this.transcriber.quantized !== quantized
    ) {
      if (this.transcriber) {
        await this.transcriber.dispose();
      }
      const { pipeline } = await TransformersApi;
      this.transcriber = await pipeline(
        'automatic-speech-recognition',
        modelName,
        {
          quantized: quantized,
          revision: modelName.includes('/whisper-medium')
            ? 'no_attentions'
            : 'main',
        },
      );
    }

    const output = await this.transcriber(audio, {
      top_k: 0,
      do_sample: false,
      chunk_length_s: isDistilWhisper ? 20 : 30,
      stride_length_s: isDistilWhisper ? 3 : 5,
      language: language,
      task: subtask,
      return_timestamps: true,
      force_full_sequences: false,
    });

    return output.text;
  }
}
