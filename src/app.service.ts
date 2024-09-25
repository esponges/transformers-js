import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as wav from 'node-wav';
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
    const fileBuffer = fs.readFileSync(filePath);

    // the actual file to transcribe
    let audioData: AudioBuffer | undefined;
    // Use node-wav to read the audio file and convert it to an audio buffer
    wav.decode(fileBuffer, (err, audioBuffer) => {
      if (err) {
        console.error(err);
      } else {
        // Create a new AudioBuffer object from the decoded audio buffer
        const audioContext = new AudioContext();
        const audioBufferObject = audioContext.createBuffer(
          audioBuffer.channels,
          audioBuffer.samples,
          audioBuffer.sampleRate,
        );

        // Copy the audio data to the AudioBuffer object
        for (let i = 0; i < audioBuffer.channels; i++) {
          audioBufferObject.getChannelData(i).set(audioBuffer.channelData[i]);
        }

        // the actual file to transcribe
        audioData = audioBufferObject;
      }
    });

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
