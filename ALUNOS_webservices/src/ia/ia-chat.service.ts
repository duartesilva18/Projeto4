import { Injectable } from '@nestjs/common';
import { IaContextBuilder } from './ia-context.builder';
import { IaForecastService } from './ia-forecast.service';
import { ChatMessage, IaOpenAiClient } from './ia-openai.client';
import { IA_CHAT_TOOLS, IaChatTools } from './ia-tools';
import { CHAT_SYSTEM_PROMPT } from './ia-prompts';
import { IaChatRequest, IaChatResponse } from './ia.types';

/** Máximo de mensagens de histórico reenviadas para a OpenAI. */
const MAX_HISTORICO = 8;

@Injectable()
export class IaChatService {
  constructor(
    private readonly contextBuilder: IaContextBuilder,
    private readonly forecastService: IaForecastService,
    private readonly openai: IaOpenAiClient,
    private readonly tools: IaChatTools
  ) {}

  async chat(req: IaChatRequest): Promise<IaChatResponse> {
    const resposta = await this.openai.chat({
      messages: await this.buildMessages(req),
      tools: IA_CHAT_TOOLS,
      toolExecutor: (name, args) => this.tools.execute(name, args)
    });

    return { resposta, generatedAt: new Date().toISOString() };
  }

  /** Igual a chat(), mas encaminha a resposta por pedaços (streaming SSE). */
  async chatStream(req: IaChatRequest, onDelta: (delta: string) => void): Promise<IaChatResponse> {
    const resposta = await this.openai.chat({
      messages: await this.buildMessages(req),
      tools: IA_CHAT_TOOLS,
      toolExecutor: (name, args) => this.tools.execute(name, args),
      onDelta
    });

    return { resposta, generatedAt: new Date().toISOString() };
  }

  private async buildMessages(req: IaChatRequest): Promise<ChatMessage[]> {
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

    const historico: ChatMessage[] = (req.historico ?? [])
      .slice(-MAX_HISTORICO)
      .map((m) => ({ role: m.role, content: m.content }));

    return [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
      { role: 'system', content: `Contexto de dados:\n${JSON.stringify(contexto)}` },
      ...historico,
      { role: 'user', content: req.mensagem }
    ];
  }
}
