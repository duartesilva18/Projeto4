import { detectDgesDocumentType } from './dges-statcol.detect';
import { parseDgesText } from './dges-statcol.parse-text';
import { matchParsedRows } from './dges-statcol.match';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('dges-statcol.detect', () => {
  it('deteta estatística 1.ª fase', () => {
    const text = readFileSync(
      join(__dirname, '__fixtures__', 'estatistica-1f-ipvc.txt'),
      'utf8'
    );
    const result = detectDgesDocumentType(
      '1.ª FASE Estatística por par estabelecimento/curso\n' + text,
      'estatistica_1fase_2025.pdf'
    );
    expect(result.tipo).toBe('estatistica-1f');
    expect(result.confianca).toBe('alta');
  });

  it('rejeita resumo da colocação', () => {
    const result = detectDgesDocumentType(
      'Resumo da colocação por par estabelecimento/curso\nInstituto Politécnico de Viana do Castelo',
      'Resumo25.pdf'
    );
    expect(result.tipo).toBe('desconhecido');
    expect(result.unsupportedReason).toMatch(/Resumo da colocação/i);
  });

  it('deteta ficha ec25 como estatística 1F', () => {
    const text = readFileSync(
      join(__dirname, '__fixtures__', 'ec25-31619016-ficha.txt'),
      'utf8'
    );
    const result = detectDgesDocumentType(text, 'ec25_31619016.pdf');
    expect(result.tipo).toBe('estatistica-1f');
    expect(result.formatKind).toBe('ec25-ficha');
    expect(result.confianca).toBe('alta');
  });

  it('deteta classificações 2.ª fase', () => {
    const text = readFileSync(
      join(__dirname, '__fixtures__', 'classificacoes-2f-ipvc.txt'),
      'utf8'
    );
    const result = detectDgesDocumentType(text, 'classificacoes_2fase.pdf');
    expect(result.tipo).toBe('classificacoes-2f');
  });
});

describe('dges-statcol.parse-text', () => {
  it('extrai linhas IPVC de estatística 1F', () => {
    const text = readFileSync(
      join(__dirname, '__fixtures__', 'estatistica-1f-ipvc.txt'),
      'utf8'
    );
    const { rows } = parseDgesText(text, 'estatistica-1f');
    expect(rows.length).toBe(3);
    expect(rows[0].codigoDges).toBe('6799');
    expect(rows[0].valores).toEqual([15, 32, 12]);
  });

  it('extrai classificações 2F', () => {
    const text = readFileSync(
      join(__dirname, '__fixtures__', 'classificacoes-2f-ipvc.txt'),
      'utf8'
    );
    const { rows } = parseDgesText(text, 'classificacoes-2f');
    expect(rows.length).toBe(2);
    expect(rows[0].classificacao).toBe(142.5);
  });

  it('avisa quando PDF é de outra instituição', () => {
    const { rows, warnings } = parseDgesText(
      'Universidade dos Açores\n1234 5678 Engenharia 10 20 5',
      'estatistica-1f'
    );
    expect(rows.length).toBe(0);
    expect(warnings[0]).toMatch(/Universidade dos Açores/i);
    expect(warnings[0]).toMatch(/IPVC/i);
  });

  it('parseia ficha ec25 individual IPVC (candidatos/colocados)', () => {
    const text = readFileSync(
      join(__dirname, '__fixtures__', 'ec25-31619003-ficha.txt'),
      'utf8'
    );
    const { rows, warnings } = parseDgesText(text, 'estatistica-1f', 'ec25_31619003.pdf');
    expect(rows.length).toBe(1);
    expect(rows[0].codigoEscola).toBe('3161');
    expect(rows[0].codigoDges).toBe('9003');
    expect(rows[0].nomeCurso).toBe('Agronomia');
    expect(rows[0].fieldValues).toEqual({ candidatos1F: 9, colocados1F: 2 });
    expect(warnings[0]).toMatch(/ficha individual/i);
  });

  it('parseia ficha ec25 Biotecnologia 9016', () => {
    const text = readFileSync(
      join(__dirname, '__fixtures__', 'ec25-31619016-ficha.txt'),
      'utf8'
    );
    const { rows } = parseDgesText(text, 'estatistica-1f', 'ec25_31619016.pdf');
    expect(rows[0].codigoDges).toBe('9016');
    expect(rows[0].nomeCurso).toBe('Biotecnologia');
    expect(rows[0].fieldValues).toEqual({ candidatos1F: 18, colocados1F: 6 });
  });

  it('ignora linhas falsas de gráficos na ficha ec25', () => {
    const text = readFileSync(
      join(__dirname, '__fixtures__', 'ec25-31619003-ficha.txt'),
      'utf8'
    );
    const withNoise = `${text}\n0 0 0 0 0\n115 120 125 130 135 140 145 150 155 160`;
    const { rows } = parseDgesText(withNoise, 'estatistica-1f', 'ec25_31619003.pdf');
    expect(rows.length).toBe(1);
    expect(rows[0].fieldValues?.colocados1F).toBe(2);
  });

  it('combina várias fichas ec25 no mesmo lote', () => {
    const t1 = readFileSync(join(__dirname, '__fixtures__', 'ec25-31619003-ficha.txt'), 'utf8');
    const t2 = readFileSync(join(__dirname, '__fixtures__', 'ec25-31619016-ficha.txt'), 'utf8');
    const r1 = parseDgesText(t1, 'estatistica-1f', 'ec25_31619003.pdf');
    const r2 = parseDgesText(t2, 'estatistica-1f', 'ec25_31619016.pdf');
    expect(r1.rows.length + r2.rows.length).toBe(2);
    expect(r1.rows[0].codigoDges).toBe('9003');
    expect(r2.rows[0].codigoDges).toBe('9016');
  });
});

describe('dges-statcol.match', () => {
  const tableRows = [
    {
      id: '10-2024',
      idCursoOferta: 10,
      courseCode: '6799',
      courseName: 'Agricultura Biológica',
      schoolName: 'ESA',
      schoolCode: '3161',
      anoLetivoInicio: 2024,
      vagas1F: 0,
      candidatos1F: 0,
      colocados1F: 0
    }
  ];

  it('mapeia linhas parseadas para campos CourseData', () => {
    const text = readFileSync(
      join(__dirname, '__fixtures__', 'estatistica-1f-ipvc.txt'),
      'utf8'
    );
    const { rows } = parseDgesText(text, 'estatistica-1f');
    const { matched, unmatched } = matchParsedRows(rows, tableRows, 2024, 'estatistica-1f', true);
    expect(unmatched.length).toBe(2);
    expect(matched.length).toBe(1);
    expect(matched[0].fields.map((f) => f.fieldKey)).toEqual([
      'vagas1F',
      'candidatos1F',
      'colocados1F'
    ]);
    expect(matched[0].fields[0].newValue).toBe(15);
  });
});
