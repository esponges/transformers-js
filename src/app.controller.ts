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

  @Post('transform')
  async transform(@Body() { text }: TransformDto) {
    return await this.appService.transform(text);
  }
}
