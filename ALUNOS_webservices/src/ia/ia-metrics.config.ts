import { IaMetricKey } from './ia.types';

export const IA_METRIC_KEYS: IaMetricKey[] = [
  'colocados',
  'matriculados',
  'candidatos',
  'vagas'
];

export const IA_METRIC_LABELS: Record<IaMetricKey, string> = {
  colocados: 'Colocados',
  matriculados: 'Matriculados',
  candidatos: 'Candidatos',
  vagas: 'Vagas'
};

const toNum = (v: unknown) => Number(v) || 0;

/**
 * Soma por linha de cada métrica, replicando exatamente a agregação do Dashboard.
 * Nunca somar campos de fórmula (percOcupacaoCna, diffVacanciesEnrolled, sobrasPos3F).
 */
export const IA_METRIC_AGGREGATORS: Record<
  IaMetricKey,
  (row: Record<string, unknown>) => number
> = {
  colocados: (row) => toNum(row.totalColocadosCna) + toNum(row.totalColocados),
  matriculados: (row) =>
    toNum(row.totalMatriculadosCna) +
    toNum(row.totalMatriculados) +
    toNum(row.reingressoAno1) +
    toNum(row.reingressoAno2) +
    toNum(row.reingressoAno3) +
    toNum(row.reingressoAno4) +
    toNum(row.mudancaColocadosMatriculados),
  candidatos: (row) => toNum(row.totalCandidatosCna),
  vagas: (row) => toNum(row.totalAvailableVacancies)
};
