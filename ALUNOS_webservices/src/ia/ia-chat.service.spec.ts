import { IaChatService } from './ia-chat.service';
import { IaContextBuilder, IaContext } from './ia-context.builder';
import { IaForecastService } from './ia-forecast.service';
import { ChatMessage, IaOpenAiClient } from './ia-openai.client';
import { IaChatTools } from './ia-tools';

const CTX: IaContext = {
  escola: 'all',
  curso: 'all',
  anoReferencia: '2025/2026',
  anoPrevisto: '2026/2027',
  metricas: ['matriculados'],
  anos: []
};

interface CapturedOptions {
  messages: ChatMessage[];
  tools?: unknown[];
  toolExecutor?: (name: string, args: string) => Promise<string>;
  onDelta?: (delta: string) => void;
}

function makeService() {
  const contextBuilder = {
    build: jest.fn().mockResolvedValue(CTX)
  } as unknown as IaContextBuilder;

  const forecastService = {
    forecastFromContext: jest.fn().mockReturnValue({
      anoReferencia: CTX.anoReferencia,
      anoPrevisto: CTX.anoPrevisto,
      anosHistorico: [],
      metricas: {},
      avisos: []
    })
  } as unknown as IaForecastService;

  let captured: CapturedOptions | null = null;
  const openai = {
    chat: jest.fn(async (options: CapturedOptions) => {
      captured = options;
      options.onDelta?.('Olá');
      options.onDelta?.(' mundo');
      return 'Olá mundo';
    })
  } as unknown as IaOpenAiClient;

  const tools = {
    execute: jest.fn().mockResolvedValue('{"ok":true}')
  } as unknown as IaChatTools;

  const service = new IaChatService(contextBuilder, forecastService, openai, tools);
  return { service, tools, getCaptured: () => captured! };
}

describe('IaChatService', () => {
  it('monta as mensagens com sistema, contexto, histórico e pergunta', async () => {
    const { service, getCaptured } = makeService();

    await service.chat({
      mensagem: 'Quantos candidatos?',
      historico: [
        { role: 'user', content: 'Olá' },
        { role: 'assistant', content: 'Olá! Em que posso ajudar?' }
      ]
    });

    const messages = getCaptured().messages;
    expect(messages[0].role).toBe('system');
    expect(messages[1].content).toContain('Contexto de dados');
    expect(messages[2]).toEqual({ role: 'user', content: 'Olá' });
    expect(messages[messages.length - 1]).toEqual({
      role: 'user',
      content: 'Quantos candidatos?'
    });
  });

  it('limita o histórico às últimas 8 mensagens', async () => {
    const { service, getCaptured } = makeService();
    const historico = Array.from({ length: 12 }, (_, i) => ({
      role: 'user' as const,
      content: `msg ${i}`
    }));

    await service.chat({ mensagem: 'pergunta', historico });

    const messages = getCaptured().messages;
    // 2 de sistema + 8 de histórico + 1 pergunta
    expect(messages).toHaveLength(11);
    expect(messages[2].content).toBe('msg 4');
  });

  it('disponibiliza as ferramentas de dados ao modelo', async () => {
    const { service, tools, getCaptured } = makeService();

    await service.chat({ mensagem: 'Qual o curso com mais candidatos?' });

    const captured = getCaptured();
    expect(captured.tools?.length).toBeGreaterThanOrEqual(2);
    await captured.toolExecutor!('top_cursos', '{"metrica":"candidatos"}');
    expect(tools.execute).toHaveBeenCalledWith('top_cursos', '{"metrica":"candidatos"}');
  });

  it('chatStream encaminha os deltas e devolve a resposta completa', async () => {
    const { service } = makeService();
    const deltas: string[] = [];

    const result = await service.chatStream({ mensagem: 'olá' }, (d) => deltas.push(d));

    expect(deltas).toEqual(['Olá', ' mundo']);
    expect(result.resposta).toBe('Olá mundo');
    expect(result.generatedAt).toBeTruthy();
  });
});
