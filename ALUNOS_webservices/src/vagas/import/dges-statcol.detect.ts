import {
  DGES_DOC_LABELS,
  type DgesConfidence,
  type DgesDetectionResult,
  type DgesDocType
} from './dges-statcol.types';
import {
  DGES_FORMAT_LABELS,
  type DgesFormatKind
} from './dges-statcol.formats';
import { isEc25FichaCurso } from './dges-statcol.parse-ec25-ficha';

function resolveFormatKind(
  text: string,
  fileName: string,
  tipo: DgesDocType
): DgesFormatKind {
  if (isEc25FichaCurso(text, fileName)) return 'ec25-ficha';
  if (tipo.startsWith('estatistica')) return 'estatistica-nacional';
  if (tipo.startsWith('classificacoes')) return 'classificacoes-nacional';
  return 'desconhecido';
}

function buildDetectionResult(
  text: string,
  fileName: string,
  tipo: DgesDocType,
  confianca: DgesConfidence,
  extra?: Partial<DgesDetectionResult>
): DgesDetectionResult {
  const formatKind = resolveFormatKind(text, fileName, tipo);
  let label = extra?.label ?? DGES_DOC_LABELS[tipo];
  if (formatKind === 'ec25-ficha' && tipo.startsWith('estatistica')) {
    label = `${DGES_DOC_LABELS[tipo]} — ficha ec25`;
    confianca = 'alta';
  }
  return {
    tipo,
    confianca,
    label,
    formatKind,
    formatLabel: DGES_FORMAT_LABELS[formatKind],
    ...extra
  };
}

function scorePhase(text: string, phase: '1' | '2' | '3'): number {
  let score = 0;
  if (new RegExp(`${phase}\\.?ª\\s*fase`, 'i').test(text)) score += 3;
  if (new RegExp(`${phase}\\s*fase`, 'i').test(text)) score += 2;
  if (new RegExp(`${phase}f`, 'i').test(text)) score += 1;
  if (phase === '1' && /primeira fase/i.test(text)) score += 2;
  if (phase === '2' && /segunda fase/i.test(text)) score += 2;
  if (phase === '3' && /terceira fase/i.test(text)) score += 2;
  return score;
}

function detectPhase(
  text: string,
  fileName: string
): { phase: '1' | '2' | '3' | null; phaseAmbiguous: boolean } {
  // Nome do ficheiro DGES é inequívoco: fase1a25.pdf, fase2a25.pdf, StCEs25F2.pdf, …
  // (o texto repete "sobras para a 2ª fase" em todas as páginas e gera empates).
  const fileMatch =
    fileName.match(/fase[\s_-]?([123])(?!\d)/i) ?? fileName.match(/f([123])(?=\D|$)/i);
  if (fileMatch) {
    return { phase: fileMatch[1] as '1' | '2' | '3', phaseAmbiguous: false };
  }

  const combined = `${fileName} ${text.slice(0, 4000)}`;
  const scores = {
    '1': scorePhase(combined, '1'),
    '2': scorePhase(combined, '2'),
    '3': scorePhase(combined, '3')
  };
  const best = (Object.entries(scores) as ['1' | '2' | '3', number][]).sort(
    (a, b) => b[1] - a[1]
  )[0];
  if (best[1] === 0) return { phase: null, phaseAmbiguous: false };
  const second = Object.values(scores).sort((a, b) => b - a)[1];
  if (best[1] === second) return { phase: null, phaseAmbiguous: true };
  return { phase: best[0], phaseAmbiguous: false };
}

function isClassificacoes(text: string, fileName: string): boolean {
  if (isEc25FichaCurso(text, fileName)) return false;
  const combined = `${fileName} ${text.slice(0, 4000)}`.toLowerCase();
  return (
    combined.includes('classifica') &&
    (combined.includes('ultimo') ||
      combined.includes('último') ||
      combined.includes('ultimos') ||
      combined.includes('últimos') ||
      combined.includes('colocado'))
  );
}

function isEstatistica(text: string, fileName: string): boolean {
  const combined = `${fileName} ${text.slice(0, 4000)}`.toLowerCase();
  return (
    combined.includes('estatistica') ||
    combined.includes('estatística') ||
    (combined.includes('estabelecimento') && combined.includes('curso'))
  );
}

/** PDFs da página statcol que este importador não processa */
export function getUnsupportedDocumentReason(text: string, fileName: string): string | null {
  const combined = `${fileName} ${text.slice(0, 8000)}`.toLowerCase();
  const fileLower = fileName.toLowerCase();

  if (
    fileLower.includes('resumo') ||
    /resumo\s+(da\s+)?coloca/i.test(combined)
  ) {
    return (
      'Este PDF é um «Resumo da colocação», que não é importável. ' +
      'Use «Estatística por par estabelecimento/curso» ou «Classificações dos últimos colocados» na página statcol da DGES.'
    );
  }

  if (
    combined.includes('compar') &&
    (combined.includes('estabelecimento') ||
      combined.includes('2024') ||
      combined.includes('2025') ||
      combined.includes('2023'))
  ) {
    return (
      'PDF de «Comparação entre anos» não é importável. ' +
      'Use «Estatística por par estabelecimento/curso» ou «Classificações dos últimos colocados».'
    );
  }

  return null;
}

export function detectDgesDocumentType(text: string, fileName: string): DgesDetectionResult {
  const unsupportedReason = getUnsupportedDocumentReason(text, fileName);
  if (unsupportedReason) {
    return buildDetectionResult(text, fileName, 'desconhecido', 'baixa', { unsupportedReason });
  }

  const { phase, phaseAmbiguous } = detectPhase(text, fileName);
  const classific = isClassificacoes(text, fileName);
  const estat = isEstatistica(text, fileName) || isEc25FichaCurso(text, fileName);

  let tipo: DgesDocType = 'desconhecido';
  let confianca: DgesConfidence = 'baixa';

  if (phase && classific) {
    tipo = `classificacoes-${phase}f` as DgesDocType;
    confianca = 'alta';
  } else if (phase && estat) {
    tipo = `estatistica-${phase}f` as DgesDocType;
    confianca = 'alta';
  } else if (phase && !classific && !estat) {
    tipo = `estatistica-${phase}f` as DgesDocType;
    confianca = 'media';
  } else if (classific) {
    tipo = 'classificacoes-1f';
    confianca = 'baixa';
  } else if (estat) {
    tipo = 'estatistica-1f';
    confianca = 'baixa';
  }

  return buildDetectionResult(text, fileName, tipo, confianca, {
    phaseAmbiguous: phaseAmbiguous || undefined
  });
}
