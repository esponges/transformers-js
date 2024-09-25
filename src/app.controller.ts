import { Body, Controller, Get, Post } from '@nestjs/common';
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
  async transformWhisper(@Body() { text }: TransformDto) {
    console.log(text);
    return await this.appService.transformWhisper();
  }
}
