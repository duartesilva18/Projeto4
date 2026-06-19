import { Injectable } from '@nestjs/common';
import { IaContext, IaContextBuilder } from './ia-context.builder';
import { linearRegression, projectNext } from './forecast.util';
import { IA_METRIC_LABELS } from './ia-metrics.config';
import {
  IaForecastRequest,
  IaForecastResponse,
  IaMetricForecast,
  IaMetricKey
} from './ia.types';

/** Anos mais recentes usados na regressão (alinhado ao Dashboard). */
const MAX_ANOS = 4;
const MIN_ANOS = 2;

@Injectable()
export class IaForecastService {
  constructor(private readonly contextBuilder: IaContextBuilder) {}

  async forecast(req: IaForecastRequest): Promise<IaForecastResponse> {
    const ctx = await this.contextBuilder.build(req);
    return this.forecastFromContext(ctx);
  }

  forecastFromContext(ctx: IaContext): IaForecastResponse {
    const avisos: string[] = [];
    const anosRecentes = ctx.anos.slice(-MAX_ANOS);
    const anosHistorico = anosRecentes.map((a) => a.ano);
    const metricas: Record<string, IaMetricForecast> = {};

    for (const metrica of ctx.metricas) {
      metricas[metrica] = this.forecastMetric(metrica, anosRecentes, avisos);
    }

    if (!ctx.anoReferencia) {
      avisos.push('Sem dados para os filtros selecionados.');
    }

    return {
      anoReferencia: ctx.anoReferencia,
      anoPrevisto: ctx.anoPrevisto,
      anosHistorico,
      metricas,
      avisos
    };
  }

  private forecastMetric(
    metrica: IaMetricKey,
    anosRecentes: IaContext['anos'],
    avisos: string[]
  ): IaMetricForecast {
    const historico = anosRecentes.map((a) => a.metricas[metrica]);
    const pontos = anosRecentes
      .map((a, idx) => ({ x: idx, y: a.metricas[metrica] }))
      .filter((p) => p.y > 0);

    if (pontos.length < MIN_ANOS) {
      avisos.push(
        `Menos de ${MIN_ANOS} anos com dados — previsão não calculada para ${IA_METRIC_LABELS[metrica]}.`
      );
      return {
        historico,
        previsto: null,
        metodo: 'insuficiente',
        anosUsados: pontos.length
      };
    }

    const reg = linearRegression(pontos);
    if (!reg) {
      return {
        historico,
        previsto: null,
        metodo: 'insuficiente',
        anosUsados: pontos.length
      };
    }

    return {
      historico,
      previsto: projectNext(reg, anosRecentes.length),
      metodo: 'linear_regression',
      anosUsados: pontos.length
    };
  }
}
