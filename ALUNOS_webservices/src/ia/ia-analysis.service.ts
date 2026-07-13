import { createHash } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { IaContextBuilder } from './ia-context.builder';
import { IaForecastService } from './ia-forecast.service';
import { IaOpenAiClient } from './ia-openai.client';
import { IaAnaliseCacheRepository } from './ia-analise-cache.repository';
import { ANALYZE_SYSTEM_PROMPT } from './ia-prompts';
import { IaAnalyzeRequest, IaAnalyzeResponse } from './ia.types';

@Injectable()
export class IaAnalysisService {
  private readonly logger = new Logger(IaAnalysisService.name);

  constructor(
    private readonly contextBuilder: IaContextBuilder,
    private readonly forecastService: IaForecastService,
    private readonly openai: IaOpenAiClient,
    private readonly cache: IaAnaliseCacheRepository
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

    // O hash cobre filtros, histórico e previsões: se nada mudou, o relatório
    // guardado continua válido e evita-se nova chamada à OpenAI.
    const dadosHash = createHash('sha256').update(JSON.stringify(contexto)).digest('hex');

    if (!req.force) {
      const hit = await this.findCached(ctx.escola, ctx.curso, forecast.anoReferencia, dadosHash);
      if (hit) return hit;
    }

    const content = await this.openai.chat({
      jsonMode: true,
      messages: [
        { role: 'system', content: ANALYZE_SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(contexto) }
      ]
    });

    const parsed = this.safeParse(content);

    const result: IaAnalyzeResponse = {
      resumo: parsed.resumo ?? '',
      tendencias: Array.isArray(parsed.tendencias) ? parsed.tendencias : [],
      padroes: Array.isArray(parsed.padroes) ? parsed.padroes : [],
      alertas: Array.isArray(parsed.alertas) ? parsed.alertas : [],
      limitacoes:
        parsed.limitacoes ??
        'Previsão indicativa baseada em regressão linear sobre poucos anos.',
      generatedAt: new Date().toISOString(),
      cached: false
    };

    // Falha ao gravar a cache não deve impedir a resposta.
    try {
      await this.cache.save({
        escola: ctx.escola,
        curso: ctx.curso,
        anoReferencia: forecast.anoReferencia,
        dadosHash,
        relatorio: JSON.stringify(result)
      });
    } catch (e) {
      this.logger.warn(`Falha ao guardar relatório na cache: ${e}`);
    }

    return result;
  }

  listHistorico(limit = 20) {
    return this.cache.listHistorico(limit);
  }

  private async findCached(
    escola: string,
    curso: string,
    anoReferencia: string,
    dadosHash: string
  ): Promise<IaAnalyzeResponse | null> {
    try {
      const entry = await this.cache.find(escola, curso, anoReferencia, dadosHash);
      if (!entry) return null;
      const parsed = this.safeParse(entry.relatorio);
      if (!parsed.resumo) return null;
      return {
        resumo: parsed.resumo,
        tendencias: Array.isArray(parsed.tendencias) ? parsed.tendencias : [],
        padroes: Array.isArray(parsed.padroes) ? parsed.padroes : [],
        alertas: Array.isArray(parsed.alertas) ? parsed.alertas : [],
        limitacoes: parsed.limitacoes ?? '',
        generatedAt: entry.createdAt,
        cached: true
      };
    } catch (e) {
      this.logger.warn(`Falha ao consultar cache de relatórios: ${e}`);
      return null;
    }
  }

  private safeParse(content: string): Partial<IaAnalyzeResponse> {
    try {
      return JSON.parse(content);
    } catch {
      return {};
    }
  }
}
