import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { IaForecastService } from './ia-forecast.service';
import { IaAnalysisService } from './ia-analysis.service';
import { IaChatService } from './ia-chat.service';
import {
  IaAnalyzeRequest,
  IaChatRequest,
  IaForecastRequest
} from './ia.types';

@Controller('ia')
export class IaController {
  constructor(
    private readonly forecastService: IaForecastService,
    private readonly analysisService: IaAnalysisService,
    private readonly chatService: IaChatService
  ) {}

  @Post('forecast')
  @UseGuards(JwtGuard)
  forecast(@Body() body: IaForecastRequest) {
    return this.forecastService.forecast(body ?? {});
  }

  @Post('analyze')
  @UseGuards(JwtGuard)
  analyze(@Body() body: IaAnalyzeRequest) {
    return this.analysisService.analyze(body ?? {});
  }

  @Post('chat')
  @UseGuards(JwtGuard)
  chat(@Body() body: IaChatRequest) {
    return this.chatService.chat(body);
  }
}
