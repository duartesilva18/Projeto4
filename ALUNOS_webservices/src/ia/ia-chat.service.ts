import { Injectable } from '@nestjs/common';
import { IaContextBuilder } from './ia-context.builder';
import { IaForecastService } from './ia-forecast.service';
import { IaOpenAiClient } from './ia-openai.client';
import { CHAT_SYSTEM_PROMPT } from './ia-prompts';
import { IaChatRequest, IaChatResponse } from './ia.types';

/** Máximo de mensagens de histórico reenviadas para a OpenAI. */
const MAX_HISTORICO = 8;

@Injectable()
export class IaChatService {
  constructor(
    private readonly contextBuilder: IaContextBuilder,
    private readonly forecastService: IaForecastService,
    private readonly openai: IaOpenAiClient
  ) {}

  async chat(req: IaChatRequest): Promise<IaChatResponse> {
    const ctx = await this.contextBuilder.build(req.filtros ?? {});
    const forecast = this.forecastService.forecastFromContext(ctx);

    const contexto = {
      escola: ctx.escola,
      curso: ctx.curso,
      anoReferencia: forecast.anoReferencia,
      anoPrevisto: forecast.anoPrevisto,
      historicoPorAno: ctx.anos.map((a) => ({ ano: a.ano, ...a.metricas })),
      previsoes: forecast.metricas
    };

    const historico = (req.historico ?? [])
      .slice(-MAX_HISTORICO)
      .map((m) => ({ role: m.role, content: m.content }));

    const resposta = await this.openai.chat({
      messages: [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
        { role: 'system', content: `Contexto de dados:\n${JSON.stringify(contexto)}` },
        ...historico,
        { role: 'user', content: req.mensagem }
      ]
    });

    return { resposta, generatedAt: new Date().toISOString() };
  }
}
