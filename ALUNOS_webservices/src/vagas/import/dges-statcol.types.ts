export type DgesDocType =
  | 'estatistica-1f'
  | 'estatistica-2f'
  | 'estatistica-3f'
  | 'classificacoes-1f'
  | 'classificacoes-2f'
  | 'classificacoes-3f'
  | 'desconhecido';

export type DgesConfidence = 'alta' | 'media' | 'baixa';

export type { DgesFormatKind } from './dges-statcol.formats';

export interface DgesDetectionResult {
  tipo: DgesDocType;
  confianca: DgesConfidence;
  label: string;
  /** Formato físico do PDF (nacional vs ficha ec25, etc.) */
  formatKind?: import('./dges-statcol.formats').DgesFormatKind;
  formatLabel?: string;
  /** PDF reconhecido mas não suportado (ex.: Resumo, Comparação) */
  unsupportedReason?: string;
  /** Empate na deteção de fase: confirmar tipo manualmente */
  phaseAmbiguous?: boolean;
}

export interface DgesParsedRow {
  codigoEscola?: string;
  codigoDges: string;
  nomeCurso: string;
  /** vagas, candidatos, colocados (estatística) */
  valores?: number[];
  /** campos explícitos (ficha ec25: só candidatos/colocados, etc.) */
  fieldValues?: Record<string, number>;
  /** classificação último colocado */
  classificacao?: number;
}

export interface DgesFieldUpdate {
  fieldKey: string;
  currentValue: number;
  newValue: number;
  skipped?: boolean;
  skipReason?: string;
}

export interface DgesMatchedUpdate {
  rowId: string;
  idCursoOferta: number;
  courseCode: string;
  courseName: string;
  schoolName: string;
  fields: DgesFieldUpdate[];
}

export interface DgesUnmatchedRow {
  codigoDges: string;
  nomeCurso: string;
  codigoEscola?: string;
  reason: string;
}

export interface DgesFilePreview {
  fileName: string;
  detection: DgesDetectionResult;
  tipoOverride?: DgesDocType;
  matched: DgesMatchedUpdate[];
  unmatched: DgesUnmatchedRow[];
  parseWarnings: string[];
}

export interface DgesImportPreview {
  previewId: string;
  anoInicio: number;
  overwrite: boolean;
  files: DgesFilePreview[];
  summary: {
    fileCount: number;
    courseCount: number;
    fieldCount: number;
    unmatchedCount: number;
    conflictCount?: number;
  };
  /** Avisos de negócio (não bloqueiam apply) */
  businessWarnings?: string[];
  createdAt: number;
}

export interface DgesApplyResult {
  ok: boolean;
  updatedFields: number;
  updatedCourses: number;
  logId?: number;
  ficheiros?: string[];
}

export interface DgesImportLogRow {
  id: number;
  previewId: string | null;
  userId: string | null;
  anoInicio: number;
  ficheiros: string[];
  updatedFields: number;
  updatedCourses: number;
  createdAt: string;
}

/** Campos CourseData preenchidos por tipo de documento DGES */
export const DGES_DOC_FIELD_MAP: Record<
  Exclude<DgesDocType, 'desconhecido'>,
  { keys: string[]; numericKind: 'int' | 'decimal' }[]
> = {
  'estatistica-1f': [
    { keys: ['vagas1F'], numericKind: 'int' },
    { keys: ['candidatos1F'], numericKind: 'int' },
    { keys: ['colocados1F'], numericKind: 'int' }
  ],
  'estatistica-2f': [
    { keys: ['vagas2F'], numericKind: 'int' },
    { keys: ['candidatos2F'], numericKind: 'int' },
    { keys: ['colocados2F'], numericKind: 'int' }
  ],
  'estatistica-3f': [
    { keys: ['vagas3F'], numericKind: 'int' },
    { keys: ['candidatos3F'], numericKind: 'int' },
    { keys: ['colocados3F'], numericKind: 'int' }
  ],
  'classificacoes-1f': [{ keys: ['classificacaoUltimo1F'], numericKind: 'decimal' }],
  'classificacoes-2f': [{ keys: ['classificacaoUltimo2F'], numericKind: 'decimal' }],
  'classificacoes-3f': [{ keys: ['classificacaoUltimo3F'], numericKind: 'decimal' }]
};

export const DGES_DOC_LABELS: Record<DgesDocType, string> = {
  'estatistica-1f': '1.ª fase: Estatística par estabelecimento/curso',
  'estatistica-2f': '2.ª fase: Estatística par estabelecimento/curso',
  'estatistica-3f': '3.ª fase: Estatística par estabelecimento/curso',
  'classificacoes-1f': '1.ª fase: Classificações últimos colocados',
  'classificacoes-2f': '2.ª fase: Classificações últimos colocados',
  'classificacoes-3f': '3.ª fase: Classificações últimos colocados',
  desconhecido: 'Tipo de documento não identificado'
};

/** Códigos escola IPVC na BD (vagas.escola.codigo_escola) */
export const IPVC_SCHOOL_CODES = new Set(['3161', '3162', '3163', '3164', '7075', 'ESDL']);

/** Códigos de estabelecimento IPVC usados nos PDFs nacionais da DGES (a ESDL é 3165) */
export const IPVC_DGES_CODES = new Set(['3161', '3162', '3163', '3164', '3165', '7075', 'ESDL']);

/** Converte o código DGES do estabelecimento para o código usado na BD (3165 → ESDL) */
export function toBdSchoolCode(codigoDges: string): string {
  return codigoDges === '3165' ? 'ESDL' : codigoDges;
}

export const IPVC_NAME_PATTERNS = [
  /viana do castelo/i,
  /\bipvc\b/i,
  /\bESA\b/,
  /\bESE\b/,
  /\bESTG\b/,
  /\bESCE\b/,
  /\bESS\b/,
  /\bESDL\b/
];
