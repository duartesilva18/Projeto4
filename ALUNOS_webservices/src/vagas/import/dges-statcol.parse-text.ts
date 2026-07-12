import {
  IPVC_DGES_CODES,
  IPVC_NAME_PATTERNS,
  IPVC_SCHOOL_CODES,
  toBdSchoolCode,
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

/**
 * Formato nacional 2025 («Classificações dos últimos colocados», ex.: fase1a25.pdf):
 * cada registo começa com "codInstit codCurso" e pode partir-se em 2–3 linhas físicas
 * quando o nome da instituição quebra. Colunas (após o grau): vagas, colocados, …,
 * nota do último colocado (decimal, pode faltar) e sobras.
 */
const NACIONAL_RECORD_START = /^(\d{4})\s+([A-Z]?\d{3,4})\b/;

/** Grau académico entre o nome do curso e os números (L1, MI, PM, PL, …) */
const GRAU_TOKEN = /^(?:L1|LM|MI|PM|PL|DL|L|M|D)$/;

/** Nota do último colocado: decimal com 1–2 casas (ex.: 134.5 ou 134,5) */
const NOTA_DECIMAL = /^\d{2,3}[.,]\d{1,2}$/;

const NUMERIC_TOKEN = /^\d+(?:[.,]\d+)?$/;

/** Prefixo da instituição nos registos IPVC (nome da escola pode vir colado ao curso) */
const IPVC_INSTITUTION_PREFIX =
  /^Instituto\s+Polit[eé]cnico\s+de\s+Viana\s+do\s+Castelo\s*-?\s*Escola\s+Superior\s+(?:Agr[aá]ria|de\s+Educa[cç][aã]o|de\s+Tecnologia\s+e\s+Gest[aã]o|de\s+Ci[eê]ncias\s+Empresariais|de\s+Sa[uú]de|de\s+Desporto\s+e\s+Lazer(?:\s+de\s+Melga[cç]o)?)\s*/i;

function trailingNumericTokens(tokens: string[]): string[] {
  const tail: string[] = [];
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (!NUMERIC_TOKEN.test(tokens[i])) break;
    tail.unshift(tokens[i]);
  }
  return tail;
}

function isNacionalNoiseLine(line: string): boolean {
  return (
    /^Dire[cç][aã]o-Geral/i.test(line) ||
    /^ACESSO AO ENSINO SUPERIOR/i.test(line) ||
    /^Classifica[cç][oõ]es dos [uú]ltimos/i.test(line) ||
    /^P[aá]gina \d+/i.test(line) ||
    /^--? ?\d+ of \d+ --?$/i.test(line)
  );
}

/** Reconstrói os registos lógicos (multi-linha) do PDF nacional. */
function collectNacionalRecords(lines: string[]): string[] {
  const records: string[] = [];
  let current = '';

  const isComplete = (record: string) => {
    const tokens = record.split(' ');
    // Um registo completo termina numa cauda de ≥4 números (vagas, colocados, …, sobras).
    return trailingNumericTokens(tokens).length >= 4;
  };

  const flush = () => {
    if (current && isComplete(current)) records.push(current);
    current = '';
  };

  for (const rawLine of lines) {
    const line = normalizeSpaces(rawLine);
    if (!line || isNacionalNoiseLine(line)) {
      flush();
      continue;
    }
    if (NACIONAL_RECORD_START.test(line)) {
      flush();
      current = line;
    } else if (current) {
      current += ` ${line}`;
    }
    if (current && isComplete(current)) {
      records.push(current);
      current = '';
    }
  }
  flush();
  return records;
}

/**
 * Colunas inteiras da cauda numérica por fase (sem contar a nota decimal).
 * A última coluna (vagas sobrantes) pode ser omitida, daí o intervalo de comprimentos.
 * - 1F: iniciais, colocados, desemp., sem class., vaga adic., [sobras]
 * - 2F: iniciais, recolocação, colocados, desemp., sem class., vaga adic., vaga adic. alíneas, [sobrantes]
 * - 3F: iniciais 3F, recolocação, vaga adic. sem class., vaga adic. desemp., colocados, [sobrantes]
 */
const NACIONAL_TAIL_LAYOUT: Record<
  '1F' | '2F' | '3F',
  { min: number; max: number; vagas: number[]; colocados: number }
> = {
  '1F': { min: 5, max: 6, vagas: [0], colocados: 1 },
  '2F': { min: 7, max: 8, vagas: [0, 1], colocados: 2 },
  '3F': { min: 5, max: 6, vagas: [0, 1], colocados: 4 }
};

function classificacoesPhaseSuffix(docType: DgesDocType): '1F' | '2F' | '3F' {
  if (docType === 'classificacoes-2f') return '2F';
  if (docType === 'classificacoes-3f') return '3F';
  return '1F';
}

/** Extrai as linhas IPVC do formato nacional 2025 de classificações. */
function parseClassificacoesNacional(lines: string[], docType: DgesDocType): DgesParsedRow[] {
  const rows: DgesParsedRow[] = [];
  const phase = classificacoesPhaseSuffix(docType);
  const layout = NACIONAL_TAIL_LAYOUT[phase];

  for (const record of collectNacionalRecords(lines)) {
    const tokens = record.split(' ');
    const codigoEscolaDges = tokens[0];
    if (!IPVC_DGES_CODES.has(codigoEscolaDges)) continue;

    const codigoDges = tokens[1];
    const numericTail = trailingNumericTokens(tokens);
    if (numericTail.length < 4) continue;

    const fieldValues: Record<string, number> = {};

    // A nota do último colocado é o único decimal na cauda; sem colocados não há nota.
    const notaToken = numericTail.find((t) => NOTA_DECIMAL.test(t) && /[.,]/.test(t));
    if (notaToken) {
      const classificacao = Number(notaToken.replace(',', '.'));
      if (Number.isFinite(classificacao)) {
        fieldValues[`classificacaoUltimo${phase}`] = classificacao;
      }
    }

    // Vagas e colocados: só quando a cauda inteira tem o nº de colunas esperado
    // para a fase (evita mapear posições erradas em linhas atípicas).
    const intTail = numericTail.filter((t) => !/[.,]/.test(t)).map(Number);
    if (intTail.length >= layout.min && intTail.length <= layout.max) {
      fieldValues[`vagas${phase}`] = layout.vagas.reduce((sum, i) => sum + (intTail[i] ?? 0), 0);
      fieldValues[`colocados${phase}`] = intTail[layout.colocados] ?? 0;
    }

    if (Object.keys(fieldValues).length === 0) continue;

    // Nome do curso: entre o código e a cauda numérica, sem prefixo da instituição nem grau.
    const nameTokens = tokens.slice(2, tokens.length - numericTail.length);
    if (nameTokens.length && GRAU_TOKEN.test(nameTokens[nameTokens.length - 1])) {
      nameTokens.pop();
    }
    const nomeCurso = normalizeSpaces(
      nameTokens.join(' ').replace(IPVC_INSTITUTION_PREFIX, '')
    );

    rows.push({
      codigoEscola: toBdSchoolCode(codigoEscolaDges),
      codigoDges,
      nomeCurso: nomeCurso || `Curso ${codigoDges}`,
      fieldValues
    });
  }

  return rows;
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

  // Formato nacional 2025 (fase1a25.pdf, fase2a25.pdf, …): registos multi-linha
  // "codInstit codCurso instituição curso grau números". Se reconhecer linhas IPVC,
  // usa-o; caso contrário cai no formato antigo (secções por instituição).
  if (docType.startsWith('classificacoes')) {
    const nacionalRows = parseClassificacoesNacional(lines, docType);
    if (nacionalRows.length > 0) {
      warnings.push(
        'PDF nacional de classificações: além da nota do último colocado, importa também ' +
          'vagas e colocados da fase (na 2.ª/3.ª fase, vagas = iniciais + recolocação).'
      );
      return { rows: nacionalRows, warnings };
    }
  }

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
