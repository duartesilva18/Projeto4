import {
  IPVC_DGES_CODES,
  toBdSchoolCode,
  type DgesDocType,
  type DgesParsedRow
} from './dges-statcol.types';

/**
 * Ficha DGES ec25_XXXXXXXX: estatística detalhada de um curso. O PDF nacional
 * «Estatística por par estabelecimento/curso» (StCEs25.pdf) é uma coleção destas
 * fichas, uma por página; o parser trata ambos os casos.
 */
export function isEc25FichaCurso(text: string, fileName: string): boolean {
  if (/^ec\d{2}_\d+\.pdf$/i.test(fileName)) return true;
  return (
    /Estabelecimento:\s*(?:\d{3,4}|ESDL)/i.test(text) &&
    /Curso Superior:\s*\d/i.test(text) &&
    /DISTRIBUI[ÇC][ÕO]ES DE NOTAS DE CANDIDATURA/i.test(text)
  );
}

function phaseFieldSuffix(docType: DgesDocType): '1F' | '2F' | '3F' | null {
  if (docType === 'estatistica-1f') return '1F';
  if (docType === 'estatistica-2f') return '2F';
  if (docType === 'estatistica-3f') return '3F';
  return null;
}

/** Linha do grau académico que fecha o cabeçalho da ficha */
const FICHA_DEGREE_LINE = /^(Licenciatura|Mestrado|Prep\.|TeSP|Doutoramento|Curso de)/i;

function extractCourseName(lines: string[], cursoLineIdx: number): string {
  // O nome do curso é a linha imediatamente antes do grau (Licenciatura, Mestrado, …);
  // o nome da instituição pode ocupar mais do que uma linha, por isso não serve
  // avançar linha a linha a partir do cabeçalho.
  for (let i = cursoLineIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^DISTRIBUI/i.test(line)) break;
    if (FICHA_DEGREE_LINE.test(line)) {
      for (let j = i - 1; j > cursoLineIdx; j--) {
        const candidate = lines[j].trim();
        if (candidate) return candidate;
      }
      return '';
    }
  }
  // Fallback: primeira linha "plausível" após o cabeçalho (formato antigo).
  for (let i = cursoLineIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (/^Curso Superior:/i.test(line)) continue;
    if (/Instituto Polit[eé]cnico/i.test(line)) continue;
    if (/^DISTRIBUI/i.test(line)) break;
    if (/^\d/.test(line)) continue;
    return line;
  }
  return '';
}

/** Extrai candidatos/colocados da secção «Opção candidatura» */
function extractOpcaoTotais(text: string): { candidatos: number; colocados: number } | null {
  const section = text.match(
    /OP[CÇ][AÃ]O CANDIDATURA[\s\S]*?Total\s+(\d+)\s+(\d+)/i
  );
  if (!section) return null;
  return { candidatos: Number(section[1]), colocados: Number(section[2]) };
}

function parseSingleFicha(block: string, phase: '1F' | '2F' | '3F'): DgesParsedRow | null {
  const estabMatch = block.match(/Estabelecimento:\s*(\d{3,4}|ESDL)/i);
  // Códigos de curso podem ter prefixo de letra (L164, A017, …)
  const cursoMatch = block.match(/Curso Superior:\s*([A-Z]?\d{1,5})/i);
  if (!estabMatch || !cursoMatch) return null;

  const codigoEscolaDges = estabMatch[1];
  if (!IPVC_DGES_CODES.has(codigoEscolaDges)) return null;

  const codigoDges = cursoMatch[1];
  const lines = block.split(/\r?\n/).map((l) => l.trim());
  const cursoIdx = lines.findIndex((l) => /^Curso Superior:/i.test(l));
  const nomeCurso = cursoIdx >= 0 ? extractCourseName(lines, cursoIdx) : '';
  const totais = extractOpcaoTotais(block);
  if (!totais) return null;

  const fieldValues: Record<string, number> = {
    [`candidatos${phase}`]: totais.candidatos,
    [`colocados${phase}`]: totais.colocados
  };

  return {
    codigoEscola: toBdSchoolCode(codigoEscolaDges),
    codigoDges,
    nomeCurso: nomeCurso || `Curso ${codigoDges}`,
    fieldValues
  };
}

export function parseEc25FichaCurso(text: string, docType: DgesDocType): DgesParsedRow[] {
  if (!isEc25FichaCurso(text, '')) return [];
  const phase = phaseFieldSuffix(docType);
  if (!phase) return [];

  // O PDF nacional (StCEs25.pdf) concatena centenas de fichas: divide-se por
  // "Estabelecimento:" e processa-se cada uma; ficheiros ec25_… têm uma só ficha.
  const blocks = text.split(/(?=Estabelecimento:\s*(?:\d{3,4}|ESDL))/i);
  const rows: DgesParsedRow[] = [];
  for (const block of blocks) {
    const row = parseSingleFicha(block, phase);
    if (row) rows.push(row);
  }
  return rows;
}

export function ec25FichaParseWarning(): string {
  return (
    'Ficha individual do curso (ec25): importados candidatos e colocados. ' +
    'Vagas não existem neste PDF — use o PDF nacional «Estatística por par estabelecimento/curso» para vagas.'
  );
}
