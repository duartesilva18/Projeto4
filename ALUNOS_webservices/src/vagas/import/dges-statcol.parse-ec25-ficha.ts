import {
  IPVC_SCHOOL_CODES,
  type DgesDocType,
  type DgesParsedRow
} from './dges-statcol.types';

/** Ficha DGES ec25_XXXXXXXX — estatística detalhada de um único curso */
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

function extractCourseName(lines: string[], cursoLineIdx: number): string {
  for (let i = cursoLineIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (/^Curso Superior:/i.test(line)) continue;
    if (/Instituto Polit[eé]cnico/i.test(line)) continue;
    if (/^(Licenciatura|Mestrado|TeSP|Doutoramento|Curso de)/i.test(line)) continue;
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

export function parseEc25FichaCurso(text: string, docType: DgesDocType): DgesParsedRow[] {
  if (!isEc25FichaCurso(text, '')) return [];
  const phase = phaseFieldSuffix(docType);
  if (!phase) return [];

  const estabMatch = text.match(/Estabelecimento:\s*(\d{3,4}|ESDL)/i);
  const cursoMatch = text.match(/Curso Superior:\s*(\d{1,5})/i);
  if (!estabMatch || !cursoMatch) return [];

  const codigoEscola = estabMatch[1];
  if (!IPVC_SCHOOL_CODES.has(codigoEscola)) return [];

  const codigoDges = cursoMatch[1];
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const cursoIdx = lines.findIndex((l) => /^Curso Superior:/i.test(l));
  const nomeCurso = cursoIdx >= 0 ? extractCourseName(lines, cursoIdx) : '';
  const totais = extractOpcaoTotais(text);
  if (!totais) return [];

  const fieldValues: Record<string, number> = {
    [`candidatos${phase}`]: totais.candidatos,
    [`colocados${phase}`]: totais.colocados
  };

  return [
    {
      codigoEscola,
      codigoDges,
      nomeCurso: nomeCurso || `Curso ${codigoDges}`,
      fieldValues
    }
  ];
}

export function ec25FichaParseWarning(): string {
  return (
    'Ficha individual do curso (ec25): importados candidatos e colocados. ' +
    'Vagas não existem neste PDF — use o PDF nacional «Estatística por par estabelecimento/curso» para vagas.'
  );
}
