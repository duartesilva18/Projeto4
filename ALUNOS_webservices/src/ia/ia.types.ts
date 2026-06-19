/** Métricas suportadas para previsão. */
export type IaMetricKey = 'colocados' | 'matriculados' | 'candidatos' | 'vagas';

export interface IaForecastRequest {
  /** Ano letivo de referência, ex.: "2025/2026". Vazio = ano mais recente com dados. */
  anoReferencia?: string;
  escola?: string;
  curso?: string;
  metricas?: IaMetricKey[];
}

export interface IaMetricForecast {
  historico: number[];
  previsto: number | null;
  metodo: 'linear_regression' | 'insuficiente';
  anosUsados: number;
}

export interface IaForecastResponse {
  anoReferencia: string;
  anoPrevisto: string;
  anosHistorico: string[];
  metricas: Record<string, IaMetricForecast>;
  avisos: string[];
}

export interface IaAnalyzeRequest extends IaForecastRequest {
  /** Previsão já calculada no cliente; se ausente o servidor recalcula. */
  forecast?: IaForecastResponse;
}

export interface IaAnalyzeTendencia {
  metrica: string;
  direcao: 'subida' | 'descida' | 'estavel';
  texto: string;
}

export interface IaAnalyzePadrao {
  via: string;
  texto: string;
}

export interface IaAnalyzeAlerta {
  nivel: 'info' | 'warning';
  texto: string;
}

export interface IaAnalyzeResponse {
  resumo: string;
  tendencias: IaAnalyzeTendencia[];
  padroes: IaAnalyzePadrao[];
  alertas: IaAnalyzeAlerta[];
  limitacoes: string;
  generatedAt: string;
}

export interface IaChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface IaChatRequest {
  mensagem: string;
  historico?: IaChatMessage[];
  filtros?: IaForecastRequest;
}

export interface IaChatResponse {
  resposta: string;
  generatedAt: string;
}
