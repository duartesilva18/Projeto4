import { Injectable } from '@nestjs/common';
import { VagasService } from '../vagas/vagas.service';
import { IA_METRIC_AGGREGATORS, IA_METRIC_KEYS } from './ia-metrics.config';
import { IaForecastRequest, IaMetricKey } from './ia.types';

export interface IaAggregatedYear {
  ano: string;
  anoInicio: number;
  anoFim: number;
  metricas: Record<IaMetricKey, number>;
}

export interface IaContext {
  escola: string;
  curso: string;
  anoReferencia: string;
  anoPrevisto: string;
  metricas: IaMetricKey[];
  /** Série ordenada por ano (do mais antigo ao mais recente), até ao ano de referência. */
  anos: IaAggregatedYear[];
}

@Injectable()
export class IaContextBuilder {
  constructor(private readonly vagasService: VagasService) {}

  /** Agrega o histórico de vagas por ano letivo aplicando os filtros do pedido. */
  async build(req: IaForecastRequest): Promise<IaContext> {
    const escola = req.escola && req.escola.trim() ? req.escola : 'all';
    const curso = req.curso && req.curso.trim() ? req.curso : 'all';
    const metricas =
      req.metricas && req.metricas.length ? req.metricas : [...IA_METRIC_KEYS];

    const linhas: Record<string, unknown>[] = await this.vagasService.listarResumoTabela();
    const filtradas = linhas.filter((row) => {
      const matchEscola = escola === 'all' || row.schoolName === escola;
      const matchCurso = curso === 'all' || row.courseName === curso;
      return matchEscola && matchCurso;
    });

    const porAno = new Map<string, IaAggregatedYear>();
    for (const row of filtradas) {
      if (row.anoLetivoInicio == null || row.anoLetivoFim == null) continue;
      const anoInicio = Number(row.anoLetivoInicio);
      const anoFim = Number(row.anoLetivoFim);
      const ano = `${anoInicio}/${anoFim}`;

      let entry = porAno.get(ano);
      if (!entry) {
        entry = {
          ano,
          anoInicio,
          anoFim,
          metricas: { colocados: 0, matriculados: 0, candidatos: 0, vagas: 0 }
        };
        porAno.set(ano, entry);
      }
      for (const m of IA_METRIC_KEYS) {
        entry.metricas[m] += IA_METRIC_AGGREGATORS[m](row);
      }
    }

    let anos = [...porAno.values()].sort((a, b) => a.anoInicio - b.anoInicio);

    const anoReferencia =
      req.anoReferencia && porAno.has(req.anoReferencia)
        ? req.anoReferencia
        : anos.length
          ? anos[anos.length - 1].ano
          : '';

    if (anoReferencia) {
      const refInicio = porAno.get(anoReferencia)!.anoInicio;
      anos = anos.filter((a) => a.anoInicio <= refInicio);
    }

    const refEntry = porAno.get(anoReferencia);
    const anoPrevisto = refEntry
      ? `${refEntry.anoInicio + 1}/${refEntry.anoFim + 1}`
      : '';

    return { escola, curso, anoReferencia, anoPrevisto, metricas, anos };
  }
}
