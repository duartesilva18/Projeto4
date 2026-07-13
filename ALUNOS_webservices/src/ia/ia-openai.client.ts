import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: OpenAiToolCall[];
  tool_call_id?: string;
}

/** Definição de função no formato tools da OpenAI. */
export interface OpenAiTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface OpenAiToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

/** Executa uma função pedida pelo modelo e devolve o resultado em JSON (string). */
export type ToolExecutor = (name: string, argumentsJson: string) => Promise<string>;

interface ChatOptions {
  messages: ChatMessage[];
  jsonMode?: boolean;
  temperature?: number;
  tools?: OpenAiTool[];
  toolExecutor?: ToolExecutor;
  /** Recebe cada pedaço de texto da resposta final (streaming). */
  onDelta?: (delta: string) => void;
}

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';
/** Máximo de rondas de function calling antes de forçar resposta final. */
const MAX_TOOL_ROUNDS = 4;

interface StreamedCompletion {
  content: string;
  toolCalls: OpenAiToolCall[];
}

/** Cliente fino para a Chat Completions API da OpenAI (via fetch nativo do Node). */
@Injectable()
export class IaOpenAiClient {
  constructor(private readonly config: ConfigService) {}

  get isConfigured(): boolean {
    return Boolean(this.config.get<string>('OPENAI_API_KEY'));
  }

  /**
   * Conversa com o modelo. Suporta function calling (tools + toolExecutor) e
   * streaming da resposta final (onDelta). Devolve o texto completo no fim.
   */
  async chat(options: ChatOptions): Promise<string> {
    const messages: ChatMessage[] = [...options.messages];

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const lastRound = round === MAX_TOOL_ROUNDS - 1;
      const result = await this.completion(options, messages, lastRound);

      if (result.toolCalls.length === 0 || !options.toolExecutor || lastRound) {
        return result.content.trim();
      }

      messages.push({
        role: 'assistant',
        content: result.content || null,
        tool_calls: result.toolCalls
      });
      for (const call of result.toolCalls) {
        let toolResult: string;
        try {
          toolResult = await options.toolExecutor(call.function.name, call.function.arguments);
        } catch (e) {
          toolResult = JSON.stringify({
            erro: e instanceof Error ? e.message : 'Falha ao executar a função.'
          });
        }
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: toolResult
        });
      }
    }

    return '';
  }

  /** Uma chamada à API. Faz streaming quando há onDelta; caso contrário, pedido normal. */
  private async completion(
    options: ChatOptions,
    messages: ChatMessage[],
    disableTools: boolean
  ): Promise<StreamedCompletion> {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('OPENAI_API_KEY não configurada no servidor.');
    }
    const model = this.config.get<string>('OPENAI_MODEL') ?? DEFAULT_MODEL;
    const useStream = Boolean(options.onDelta);

    const body: Record<string, unknown> = {
      model,
      messages,
      temperature: options.temperature ?? 0.3,
      ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
      ...(options.tools?.length && !disableTools ? { tools: options.tools } : {}),
      ...(useStream ? { stream: true } : {})
    };

    let res: Response;
    try {
      res = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      });
    } catch {
      throw new ServiceUnavailableException('Falha ao contactar a OpenAI.');
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new ServiceUnavailableException(
        `OpenAI respondeu ${res.status}: ${detail.slice(0, 300)}`
      );
    }

    if (!useStream) {
      const data = (await res.json()) as {
        choices?: { message?: { content?: string | null; tool_calls?: OpenAiToolCall[] } }[];
      };
      const message = data.choices?.[0]?.message;
      return {
        content: message?.content ?? '',
        toolCalls: message?.tool_calls ?? []
      };
    }

    return this.readStream(res, options.onDelta!);
  }

  /** Lê o SSE da OpenAI, encaminhando texto e acumulando tool_calls parciais. */
  private async readStream(
    res: Response,
    onDelta: (delta: string) => void
  ): Promise<StreamedCompletion> {
    if (!res.body) {
      throw new ServiceUnavailableException('Resposta da OpenAI sem corpo.');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let content = '';
    /** tool_calls chegam fragmentados por índice; juntam-se aqui. */
    const toolCallsByIndex = new Map<number, OpenAiToolCall>();

    const processLine = (line: string) => {
      if (!line.startsWith('data: ')) return;
      const payload = line.slice(6).trim();
      if (!payload || payload === '[DONE]') return;

      let parsed: {
        choices?: {
          delta?: {
            content?: string;
            tool_calls?: {
              index: number;
              id?: string;
              function?: { name?: string; arguments?: string };
            }[];
          };
        }[];
      };
      try {
        parsed = JSON.parse(payload);
      } catch {
        return;
      }

      const delta = parsed.choices?.[0]?.delta;
      if (!delta) return;

      if (delta.content) {
        content += delta.content;
        onDelta(delta.content);
      }
      for (const tc of delta.tool_calls ?? []) {
        let call = toolCallsByIndex.get(tc.index);
        if (!call) {
          call = { id: '', type: 'function', function: { name: '', arguments: '' } };
          toolCallsByIndex.set(tc.index, call);
        }
        if (tc.id) call.id = tc.id;
        if (tc.function?.name) call.function.name += tc.function.name;
        if (tc.function?.arguments) call.function.arguments += tc.function.arguments;
      }
    };

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, idx).replace(/\r$/, '');
        buffer = buffer.slice(idx + 1);
        processLine(line);
      }
    }
    if (buffer) processLine(buffer);

    return {
      content,
      toolCalls: [...toolCallsByIndex.values()].filter((c) => c.id && c.function.name)
    };
  }
}
