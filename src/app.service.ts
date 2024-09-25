import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import { WhisperService } from './whisper';
const TransformersApi = Function('return import("@xenova/transformers")')();

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async transformSentiment(text: string) {
    const { pipeline } = await TransformersApi;
    const pipe = await pipeline('sentiment-analysis');

    return await pipe(text);
  }

  async transformWhisper() {
    // const SAMPLING_RATE = 16000;
    // const DEFAULT_AUDIO_URL = `https= //huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/"ted_60_16k".wav`;
    const DEFAULT_MODEL = 'Xenova/whisper-tiny';
    const DEFAULT_SUBTASK = 'transcribe';
    const DEFAULT_LANGUAGE = 'english';
    const DEFAULT_QUANTIZED = false;
    const DEFAULT_MULTILINGUAL = false;

    const filePath = 'assets/audio/serious-disciplemaking.mp3';
    const pcmData = await this.convertToPCM(filePath);

    // Create a Float32Array from the PCM data
    const audio = new Float32Array(pcmData.length / 4);
    for (let i = 0; i < audio.length; i++) {
      audio[i] = pcmData.readFloatLE(i * 4);
    }

    const whisper = new WhisperService();

    return whisper.transcribe(
      audio,
      DEFAULT_MODEL,
      DEFAULT_MULTILINGUAL,
      DEFAULT_QUANTIZED,
      DEFAULT_SUBTASK,
      DEFAULT_LANGUAGE,
    );
  }

  private async convertToPCM(inputPath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(
        path.dirname(inputPath),
        `${path.basename(inputPath, path.extname(inputPath))}.pcm`,
      );

      ffmpeg(inputPath)
        .outputOptions([
          '-f s16le',
          '-acodec pcm_s16le',
          '-vn',
          '-ac 1',
          '-ar 16000',
          '-y',
        ])
        .save(outputPath)
        .on('end', () => {
          const pcmData = fs.readFileSync(outputPath);
          fs.unlinkSync(outputPath); // Clean up the temporary PCM file
          resolve(pcmData);
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }
}
