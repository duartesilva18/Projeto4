import { Injectable } from '@nestjs/common';
import { IaContextBuilder } from './ia-context.builder';
import { IaForecastService } from './ia-forecast.service';
import { IaOpenAiClient } from './ia-openai.client';
import { ANALYZE_SYSTEM_PROMPT } from './ia-prompts';
import { IaAnalyzeRequest, IaAnalyzeResponse } from './ia.types';

@Injectable()
export class IaAnalysisService {
  constructor(
    private readonly contextBuilder: IaContextBuilder,
    private readonly forecastService: IaForecastService,
    private readonly openai: IaOpenAiClient
  ) {}

  async analyze(req: IaAnalyzeRequest): Promise<IaAnalyzeResponse> {
    const ctx = await this.contextBuilder.build(req);
    const forecast = req.forecast ?? this.forecastService.forecastFromContext(ctx);

    const contexto = {
      escola: ctx.escola,
      curso: ctx.curso,
      anoReferencia: forecast.anoReferencia,
      anoPrevisto: forecast.anoPrevisto,
      historicoPorAno: ctx.anos.map((a) => ({ ano: a.ano, ...a.metricas })),
      previsoes: forecast.metricas,
      avisos: forecast.avisos
    };

    const content = await this.openai.chat({
      jsonMode: true,
      messages: [
        { role: 'system', content: ANALYZE_SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(contexto) }
      ]
    });

    const parsed = this.safeParse(content);

    return {
      resumo: parsed.resumo ?? '',
      tendencias: Array.isArray(parsed.tendencias) ? parsed.tendencias : [],
      padroes: Array.isArray(parsed.padroes) ? parsed.padroes : [],
      alertas: Array.isArray(parsed.alertas) ? parsed.alertas : [],
      limitacoes:
        parsed.limitacoes ??
        'Previsão indicativa baseada em regressão linear sobre poucos anos.',
      generatedAt: new Date().toISOString()
    };
  }

  private safeParse(content: string): Partial<IaAnalyzeResponse> {
    try {
      return JSON.parse(content);
    } catch {
      return {};
    }
  }
}
