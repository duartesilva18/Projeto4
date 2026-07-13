import { IaAnalysisService } from './ia-analysis.service';
import { IaContextBuilder, IaContext } from './ia-context.builder';
import { IaForecastService } from './ia-forecast.service';
import { IaOpenAiClient } from './ia-openai.client';
import {
  IaAnaliseCacheRepository,
  IaAnaliseCacheEntry
} from './ia-analise-cache.repository';

const CTX: IaContext = {
  escola: 'all',
  curso: 'all',
  anoReferencia: '2025/2026',
  anoPrevisto: '2026/2027',
  metricas: ['matriculados'],
  anos: [
    {
      ano: '2025/2026',
      anoInicio: 2025,
      anoFim: 2026,
      metricas: { colocados: 10, matriculados: 10, candidatos: 20, vagas: 15 }
    }
  ]
};

const OPENAI_JSON = JSON.stringify({
  resumo: 'Evolução estável.',
  tendencias: [],
  padroes: [],
  alertas: [],
  limitacoes: 'Poucos anos.'
});

function makeService(saved: IaAnaliseCacheEntry[] = []) {
  const contextBuilder = {
    build: jest.fn().mockResolvedValue(CTX)
  } as unknown as IaContextBuilder;

  const forecastService = {
    forecastFromContext: jest.fn().mockReturnValue({
      anoReferencia: CTX.anoReferencia,
      anoPrevisto: CTX.anoPrevisto,
      anosHistorico: ['2025/2026'],
      metricas: {},
      avisos: []
    })
  } as unknown as IaForecastService;

  const openaiChat = jest.fn().mockResolvedValue(OPENAI_JSON);
  const openai = { chat: openaiChat } as unknown as IaOpenAiClient;

  const cache = {
    find: jest.fn(
      async (escola: string, curso: string, ano: string, hash: string) =>
        saved.find(
          (e) =>
            e.escola === escola &&
            e.curso === curso &&
            e.anoReferencia === ano &&
            e.dadosHash === hash
        ) ?? null
    ),
    save: jest.fn(async (entry: Omit<IaAnaliseCacheEntry, 'createdAt'>) => {
      saved.push({ ...entry, createdAt: '2026-01-01T00:00:00.000Z' });
    }),
    listHistorico: jest.fn().mockResolvedValue([])
  } as unknown as IaAnaliseCacheRepository;

  const service = new IaAnalysisService(contextBuilder, forecastService, openai, cache);
  return { service, openaiChat, saved };
}

describe('IaAnalysisService (cache)', () => {
  it('gera o relatório na OpenAI e guarda-o na cache', async () => {
    const { service, openaiChat, saved } = makeService();

    const result = await service.analyze({});

    expect(result.resumo).toBe('Evolução estável.');
    expect(result.cached).toBe(false);
    expect(openaiChat).toHaveBeenCalledTimes(1);
    expect(saved).toHaveLength(1);
    expect(saved[0].anoReferencia).toBe('2025/2026');
  });

  it('reutiliza o relatório da cache no segundo pedido igual', async () => {
    const { service, openaiChat } = makeService();

    await service.analyze({});
    const second = await service.analyze({});

    expect(openaiChat).toHaveBeenCalledTimes(1);
    expect(second.cached).toBe(true);
    expect(second.resumo).toBe('Evolução estável.');
    expect(second.generatedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('force=true ignora a cache e gera de novo', async () => {
    const { service, openaiChat } = makeService();

    await service.analyze({});
    const forced = await service.analyze({ force: true });

    expect(openaiChat).toHaveBeenCalledTimes(2);
    expect(forced.cached).toBe(false);
  });

  it('não devolve entradas de cache corrompidas', async () => {
    const { service, openaiChat, saved } = makeService();
    await service.analyze({});
    saved[0].relatorio = '{corrompido';

    const result = await service.analyze({});

    expect(result.cached).toBe(false);
    expect(openaiChat).toHaveBeenCalledTimes(2);
  });
});
