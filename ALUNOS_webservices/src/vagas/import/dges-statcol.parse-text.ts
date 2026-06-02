import {
  IPVC_NAME_PATTERNS,
  IPVC_SCHOOL_CODES,
  type DgesDocType,
  type DgesParsedRow
} from './dges-statcol.types';
import {
  ec25FichaParseWarning,
  isEc25FichaCurso,
  parseEc25FichaCurso
} from './dges-statcol.parse-ec25-ficha';

function normalizeSpaces(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function parseNumberToken(token: string): number | null {
  const cleaned = token.replace(/\./g, '').replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Linha estatística: [codEscola] codDges nomeCurso vagas candidatos colocados */
const ESTATISTICA_LINE =
  /^(?:(\d{3,4}|ESDL)\s+)?(\d{1,5})\s+(.+?)\s+(\d{1,7})\s+(\d{1,7})\s+(\d{1,7})\s*$/;

/** Linha classificações: codDges nomeCurso classificacao */
const CLASSIFICACAO_LINE =
  /^(?:(\d{3,4}|ESDL)\s+)?(\d{1,5})\s+(.+?)\s+([\d]+[.,][\d]+|\d{1,4})\s*$/;

function isInstitutionHeader(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 8) return false;
  if (ESTATISTICA_LINE.test(trimmed) || CLASSIFICACAO_LINE.test(trimmed)) return false;
  return IPVC_NAME_PATTERNS.some((re) => re.test(trimmed));
}

function isIpvcInstitution(line: string): boolean {
  return IPVC_NAME_PATTERNS.some((re) => re.test(line));
}

function isValidStatisticsRow(
  codigo: string,
  nome: string,
  v: number,
  c: number,
  col: number
): boolean {
  if (!/^\d{3,5}$/.test(codigo)) return false;
  const nomeTrim = nome.trim();
  if (nomeTrim.length < 3) return false;
  if (/^\d+(\s+\d+)*$/.test(nomeTrim)) return false;
  if (v === 0 && c === 0 && col === 0) return false;
  return true;
}

/** Deteta se o PDF parece conter só outras instituições (sem IPVC) */
function detectNonIpvcInstitution(text: string): string | null {
  const sample = text.slice(0, 120_000);
  const hasIpvc = IPVC_NAME_PATTERNS.some((re) => re.test(sample));
  if (hasIpvc) return null;

  const otherInstitutions: { pattern: RegExp; label: string }[] = [
    { pattern: /universidade dos a[cç]ores/i, label: 'Universidade dos Açores' },
    { pattern: /universidade de (?!viana)/i, label: 'outra universidade' },
    {
      pattern: /instituto polit[eé]cnico de (?!viana do castelo)/i,
      label: 'outro instituto politécnico'
    }
  ];

  for (const { pattern, label } of otherInstitutions) {
    if (pattern.test(sample)) {
      return label;
    }
  }

  return null;
}

export function parseDgesText(
  text: string,
  docType: DgesDocType,
  fileName = ''
): { rows: DgesParsedRow[]; warnings: string[] } {
  const warnings: string[] = [];
  const rows: DgesParsedRow[] = [];

  if (docType === 'desconhecido') {
    warnings.push(
      'Tipo de documento não identificado. Selecione o tipo correto abaixo e clique «Pré-visualizar» novamente.'
    );
    return { rows, warnings };
  }

  if (isEc25FichaCurso(text, fileName) && docType.startsWith('estatistica')) {
    const fichaRows = parseEc25FichaCurso(text, docType);
    if (fichaRows.length > 0) {
      warnings.push(ec25FichaParseWarning());
      return { rows: fichaRows, warnings };
    }
  }

  const lines = text.split(/\r?\n/);

  let currentSchoolCode: string | undefined;
  let insideIpvc = false;

  for (const rawLine of lines) {
    const line = normalizeSpaces(rawLine);
    if (!line) continue;

    if (isInstitutionHeader(line)) {
      insideIpvc = isIpvcInstitution(line);
      const schoolMatch = line.match(/\b(316[1-4]|7075|ESDL)\b/);
      if (schoolMatch) currentSchoolCode = schoolMatch[1];
      continue;
    }

    if (!insideIpvc && !IPVC_NAME_PATTERNS.some((re) => re.test(line))) {
      continue;
    }

    if (docType.startsWith('classificacoes')) {
      const m = line.match(CLASSIFICACAO_LINE);
      if (!m) continue;
      const [, escola, codigo, nome, classificacaoStr] = m;
      const classificacao = parseNumberToken(classificacaoStr);
      if (classificacao == null) continue;
      const codigoEscola = escola || currentSchoolCode;
      if (codigoEscola && !IPVC_SCHOOL_CODES.has(codigoEscola)) continue;
      rows.push({
        codigoEscola: codigoEscola,
        codigoDges: codigo,
        nomeCurso: normalizeSpaces(nome),
        classificacao
      });
      continue;
    }

    if (docType.startsWith('estatistica')) {
      const m = line.match(ESTATISTICA_LINE);
      if (!m) continue;
      const [, escola, codigo, nome, v, c, col] = m;
      const vN = Number(v);
      const cN = Number(c);
      const colN = Number(col);
      if (!isValidStatisticsRow(codigo, nome, vN, cN, colN)) continue;
      const codigoEscola = escola || currentSchoolCode;
      if (codigoEscola && !IPVC_SCHOOL_CODES.has(codigoEscola)) continue;
      rows.push({
        codigoEscola: codigoEscola,
        codigoDges: codigo,
        nomeCurso: normalizeSpaces(nome),
        valores: [vN, cN, colN]
      });
    }
  }

  if (rows.length === 0) {
    const otherInst = detectNonIpvcInstitution(text);
    if (otherInst) {
      warnings.push(
        `Este PDF parece ser de ${otherInst}, não do IPVC. ` +
          'O importador só processa cursos do Instituto Politécnico de Viana do Castelo (ESA, ESE, ESTG, ESCE, ESS, ESDL). ' +
          'Descarregue o PDF nacional da statcol (com todos os estabelecimentos) ou confirme que o ficheiro inclui secções IPVC.'
      );
    } else {
      warnings.push(
        'Nenhuma linha IPVC reconhecida. Verifique se o PDF contém texto selecionável e secções dos estabelecimentos IPVC.'
      );
    }
  }

  return { rows, warnings };
}
