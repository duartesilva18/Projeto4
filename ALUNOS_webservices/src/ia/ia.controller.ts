import { Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
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

  @Get('analises')
  @UseGuards(JwtGuard)
  historicoAnalises(@Query('limit') limit?: string) {
    return this.analysisService.listHistorico(Number(limit) || 20);
  }

  @Post('chat')
  @UseGuards(JwtGuard)
  chat(@Body() body: IaChatRequest) {
    return this.chatService.chat(body);
  }

  /** Chat com resposta em streaming (Server-Sent Events). */
  @Post('chat/stream')
  @UseGuards(JwtGuard)
  async chatStream(@Body() body: IaChatRequest, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const send = (payload: Record<string, unknown>) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    try {
      const result = await this.chatService.chatStream(body, (delta) => send({ delta }));
      send({ done: true, generatedAt: result.generatedAt });
    } catch (e) {
      send({ error: e instanceof Error ? e.message : 'Erro ao gerar resposta.' });
    } finally {
      res.end();
    }
  }
}
