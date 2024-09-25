import { Injectable } from '@nestjs/common';
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

    // the actual file to transcribe
    let audioData: AudioBuffer | undefined;
    let audio: Float32Array | number;
    if (audioData.numberOfChannels === 2) {
      const SCALING_FACTOR = Math.sqrt(2);

      const left = audioData.getChannelData(0);
      const right = audioData.getChannelData(1);

      audio = new Float32Array(left.length);
      for (let i = 0; i < audioData.length; ++i) {
        audio[i] = (SCALING_FACTOR * (left[i] + right[i])) / 2;
      }
    } else {
      // If the audio is not stereo, we can just use the first channel:
      audio = audioData.getChannelData(0);
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
}
