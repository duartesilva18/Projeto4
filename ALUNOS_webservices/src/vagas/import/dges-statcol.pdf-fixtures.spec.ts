import { readFileSync } from 'fs';
import { join } from 'path';
import { detectDgesDocumentType } from './dges-statcol.detect';
import { parseDgesText } from './dges-statcol.parse-text';
import { buildMinimalPdf } from '../../../test/fixtures/dges/build-minimal-pdf';

const FIXTURES = join(__dirname, '../../../test/fixtures/dges');
const TXT = join(__dirname, '__fixtures__');

describe('dges PDF fixtures (regressão parse/detect)', () => {
  it('PDFs commitados existem e têm cabeçalho válido', () => {
    for (const name of [
      'estatistica-1f-ipvc.pdf',
      'ec25-9003-ipvc.pdf',
      'classificacoes-2f-ipvc.pdf',
      'resumo-colocacao.pdf'
    ]) {
      const buf = readFileSync(join(FIXTURES, name));
      expect(buf.subarray(0, 5).toString('utf8')).toBe('%PDF-');
      expect(buf.length).toBeGreaterThan(100);
    }
  });

  it('buildMinimalPdf gera bytes PDF válidos', () => {
    const pdf = buildMinimalPdf('teste IPVC 3161 6799 Curso 1 2 3');
    expect(pdf.subarray(0, 5).toString('utf8')).toBe('%PDF-');
    expect(pdf.toString('utf8')).toContain('%%EOF');
  });

  it('estatística 1F IPVC — detect + parse (conteúdo dos fixtures)', () => {
    const text = readFileSync(join(TXT, 'estatistica-1f-ipvc.txt'), 'utf8');
    const combined = `1.ª FASE Estatística por par estabelecimento/curso\n${text}`;
    const detection = detectDgesDocumentType(combined, 'estatistica_1fase_2025.pdf');
    expect(detection.tipo).toBe('estatistica-1f');
    const { rows } = parseDgesText(combined, 'estatistica-1f');
    expect(rows.length).toBeGreaterThanOrEqual(3);
    expect(rows[0].codigoDges).toBe('6799');
  });

  it('ficha ec25 — detect (conteúdo dos fixtures)', () => {
    const text = readFileSync(join(TXT, 'ec25-31619016-ficha.txt'), 'utf8');
    const detection = detectDgesDocumentType(text, 'ec25_31619016.pdf');
    expect(detection.tipo).toBe('estatistica-1f');
    expect(detection.formatKind).toBe('ec25-ficha');
  });

  it('classificações 2F — parse (conteúdo dos fixtures)', () => {
    const text = readFileSync(join(TXT, 'classificacoes-2f-ipvc.txt'), 'utf8');
    const combined = `2.ª FASE Classificações últimos colocados\n${text}`;
    const detection = detectDgesDocumentType(combined, 'classificacoes_2fase.pdf');
    expect(detection.tipo).toBe('classificacoes-2f');
    const { rows } = parseDgesText(combined, 'classificacoes-2f');
    expect(rows.length).toBe(2);
  });

  it('resumo da colocação — rejeitado', () => {
    const combined =
      'Resumo da colocação por par estabelecimento/curso\nInstituto Politécnico de Viana do Castelo';
    const detection = detectDgesDocumentType(combined, 'Resumo25.pdf');
    expect(detection.unsupportedReason).toMatch(/Resumo da colocação/i);
  });
});
