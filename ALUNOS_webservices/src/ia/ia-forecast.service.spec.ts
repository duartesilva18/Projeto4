import { IaForecastService } from './ia-forecast.service';
import { IaContextBuilder, IaContext } from './ia-context.builder';

function makeContext(series: number[][], metricas = ['matriculados'] as const): IaContext {
  return {
    escola: 'all',
    curso: 'all',
    anoReferencia: '2025/2026',
    anoPrevisto: '2026/2027',
    metricas: [...metricas] as IaContext['metricas'],
    anos: series.map((valores, i) => ({
      ano: `${2022 + i}/${2023 + i}`,
      anoInicio: 2022 + i,
      anoFim: 2023 + i,
      metricas: {
        colocados: valores[0] ?? 0,
        matriculados: valores[0] ?? 0,
        candidatos: valores[0] ?? 0,
        vagas: valores[0] ?? 0
      }
    }))
  };
}

describe('IaForecastService', () => {
  const service = new IaForecastService({} as IaContextBuilder);

  it('prevê por regressão linear com histórico suficiente', () => {
    const ctx = makeContext([[100], [110], [120], [130]]);
    const result = service.forecastFromContext(ctx);

    const m = result.metricas.matriculados;
    expect(m.metodo).toBe('linear_regression');
    expect(m.previsto).toBe(140);
    expect(m.anosUsados).toBe(4);
    expect(m.historico).toEqual([100, 110, 120, 130]);
    expect(result.anosHistorico).toEqual(['2022/2023', '2023/2024', '2024/2025', '2025/2026']);
  });

  it('não prevê com menos de 2 anos com dados e avisa', () => {
    const ctx = makeContext([[0], [0], [0], [50]]);
    const result = service.forecastFromContext(ctx);

    const m = result.metricas.matriculados;
    expect(m.metodo).toBe('insuficiente');
    expect(m.previsto).toBeNull();
    expect(result.avisos.some((a) => a.includes('Menos de 2 anos'))).toBe(true);
  });

  it('ignora anos a zero na regressão mas mantém-nos no histórico', () => {
    const ctx = makeContext([[0], [100], [110], [120]]);
    const result = service.forecastFromContext(ctx);

    const m = result.metricas.matriculados;
    expect(m.metodo).toBe('linear_regression');
    expect(m.anosUsados).toBe(3);
    expect(m.historico).toEqual([0, 100, 110, 120]);
  });

  it('usa no máximo os 4 anos mais recentes', () => {
    const ctx = makeContext([[10], [20], [100], [110], [120], [130]]);
    const result = service.forecastFromContext(ctx);

    expect(result.anosHistorico.length).toBe(4);
    expect(result.metricas.matriculados.previsto).toBe(140);
  });

  it('avisa quando não há dados para os filtros', () => {
    const ctx = makeContext([]);
    ctx.anoReferencia = '';
    const result = service.forecastFromContext(ctx);
    expect(result.avisos.some((a) => a.includes('Sem dados'))).toBe(true);
  });
});
