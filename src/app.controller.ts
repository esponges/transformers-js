import {
  Body,
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AppService } from './app.service';

interface TransformDto {
  text: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('sentiment-analysis')
  async transformSentiment(@Body() { text }: TransformDto) {
    return await this.appService.transformSentiment(text);
  }

  @Post('whisper')
  @UseInterceptors(FileInterceptor('audio'))
  async transcribeAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body('model') model: string,
    @Body('multilingual') multilingual: boolean,
    @Body('quantized') quantized: boolean,
    @Body('subtask') subtask: string,
    @Body('language') language: string,
  ) {
    // Convert the audio buffer to Float32Array
    const audioData = new Float32Array(file.buffer);

    const transcript = await this.appService.transformWhisper(
      audioData,
      model,
      multilingual,
      quantized,
      subtask,
      language,
    );

    return { transcript };
  }
}
