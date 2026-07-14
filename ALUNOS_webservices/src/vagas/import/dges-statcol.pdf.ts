import { BadRequestException } from '@nestjs/common';
import * as PDFParser from 'pdf2json';

/**
 * Extração de texto com pdf2json (obrigatório em produção).
 *
 * O pdf2json devolve itens de texto posicionados (x, y, w). Para as tabelas da
 * DGES é preciso reconstruir as linhas visuais, porque:
 * - itens da mesma linha vêm separados (agrupa-se por y e ordena-se por x);
 * - um valor pode vir partido em vários itens ("147.0" chega como "1" + "47.0"),
 *   que se juntam quando o espaço horizontal entre eles é mínimo;
 * - um item pode fundir células de colunas diferentes ("0" e "7" chegam como
 *   "07" com largura declarada enorme). Nesses casos o valor real é
 *   irrecuperável; a linha é marcada com ILLEGIBLE_MARKER para que o parser a
 *   descarte em vez de importar números errados.
 */

/** Linhas marcadas com isto contêm células fundidas e não podem ser importadas. */
export const ILLEGIBLE_MARKER = '☠';

/** Itens na mesma linha visual têm y (quase) igual; linhas consecutivas distam >= 0.5. */
const Y_TOLERANCE = 0.25;

interface TextItem {
  x: number;
  y: number;
  w: number;
  text: string;
}

/** decodeURIComponent seguro: sequências % inválidas ficam como estão. */
function safeDecode(encoded: string): string {
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
}

function collectItems(page: { Texts?: unknown[] }): TextItem[] {
  const items: TextItem[] = [];
  for (const raw of page.Texts ?? []) {
    const t = raw as { x?: number; y?: number; w?: number; R?: { T?: string }[] };
    const text = (t.R ?? []).map((run) => safeDecode(run.T ?? '')).join('');
    if (!text.trim()) continue;
    items.push({
      x: Number(t.x) || 0,
      y: Number(t.y) || 0,
      w: Number(t.w) || 0,
      text
    });
  }
  return items;
}

function groupIntoLines(items: TextItem[]): TextItem[][] {
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const lines: TextItem[][] = [];
  let currentY = Number.NEGATIVE_INFINITY;
  for (const item of sorted) {
    if (Math.abs(item.y - currentY) > Y_TOLERANCE) {
      lines.push([]);
      currentY = item.y;
    }
    lines[lines.length - 1].push(item);
  }
  for (const line of lines) line.sort((a, b) => a.x - b.x);
  return lines;
}

/**
 * Calibração por documento (a escala de w varia com o tamanho da fonte):
 * - charW: largura declarada (unidades w) por caracter;
 * - charX: avanço horizontal (unidades x) por caracter, estimado pelos pares
 *   de itens adjacentes mais apertados (tipicamente valores partidos).
 */
function calibrate(pages: TextItem[][][]): { charW: number; charX: number } {
  const wPerChar: number[] = [];
  const gapPerChar: number[] = [];

  for (const lines of pages) {
    for (const line of lines) {
      for (let i = 0; i < line.length; i++) {
        const item = line[i];
        if (item.w > 0) wPerChar.push(item.w / item.text.length);
        if (i > 0) {
          const prev = line[i - 1];
          const ratio = (item.x - prev.x) / prev.text.length;
          if (ratio > 0.02) gapPerChar.push(ratio);
        }
      }
    }
  }

  const charW = median(wPerChar) || 0.55;
  // Percentil baixo: os pares mais próximos são os pedaços do mesmo valor.
  const charX = Math.min(Math.max(percentile(gapPerChar, 0.05), 0.15), 0.6);
  return { charW, charX };
}

/** Junta os itens de uma linha em texto, resolvendo pedaços e células fundidas. */
function lineToText(line: TextItem[], charW: number, charX: number): string {
  const parts: string[] = [];
  let prevEnd = Number.NEGATIVE_INFINITY;

  for (const item of line) {
    let text = item.text;

    // Item mais largo do que o texto justifica: células de colunas diferentes
    // fundidas num só item. Com 2 caracteres o ponto de corte é inequívoco;
    // com mais, o valor real é ambíguo e a linha fica marcada como ilegível.
    const charsEquivalent = item.w > 0 ? item.w / charW : text.length;
    if (charsEquivalent > text.length * 1.8 && text.trim().length >= 2) {
      text = text.trim().length === 2
        ? `${text.trim()[0]} ${text.trim()[1]}`
        : ILLEGIBLE_MARKER;
    }

    const gap = item.x - prevEnd;
    if (parts.length === 0 || gap > charX * 0.8) {
      parts.push(text);
    } else {
      // Pedaço do mesmo valor: junta sem espaço ("1" + "47.0" = "147.0").
      parts[parts.length - 1] += text;
    }
    prevEnd = item.x + item.text.length * charX;
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfParser = new (PDFParser as any)();

    const text = await new Promise<string>((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', (error: any) => {
        reject(error?.parserError ?? error);
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          const pages: TextItem[][][] = (pdfData.Pages ?? []).map(
            (page: { Texts?: unknown[] }) => groupIntoLines(collectItems(page))
          );
          const { charW, charX } = calibrate(pages);

          const rendered = pages.map((lines) =>
            lines.map((line) => lineToText(line, charW, charX)).join('\n')
          );
          resolve(rendered.join('\n\n').trim());
        } catch (error) {
          reject(error);
        }
      });

      pdfParser.parseBuffer(buffer);
    });

    return text;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    throw new BadRequestException(`Não foi possível ler o PDF: ${msg}`);
  }
}
