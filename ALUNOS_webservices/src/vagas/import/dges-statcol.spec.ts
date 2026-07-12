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

  it('deteta fase pelo nome do ficheiro DGES (fase1a25.pdf, sem ambiguidade)', () => {
    const text = readFileSync(
      join(__dirname, '__fixtures__', 'classificacoes-1f-nacional-2025.txt'),
      'utf8'
    );
    const result = detectDgesDocumentType(text, 'fase1a25 (1).pdf');
    expect(result.tipo).toBe('classificacoes-1f');
    expect(result.confianca).toBe('alta');
    expect(result.phaseAmbiguous).toBeUndefined();
  });

  it('deteta fase 2 no ficheiro StCEs25F2.pdf', () => {
    const text = readFileSync(join(__dirname, '__fixtures__', 'stces25-multifichas.txt'), 'utf8')
      .replace(/1ª Fase/g, '2ª Fase');
    const result = detectDgesDocumentType(text, 'StCEs25F2.pdf');
    expect(result.tipo).toBe('estatistica-2f');
    expect(result.formatKind).toBe('ec25-ficha');
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

  it('parseia classificações nacionais 2025 (fase1a25.pdf, linhas únicas)', () => {
    const text = readFileSync(
      join(__dirname, '__fixtures__', 'classificacoes-1f-nacional-2025.txt'),
      'utf8'
    );
    const { rows } = parseDgesText(text, 'classificacoes-1f', 'fase1a25.pdf');
    // 12 linhas IPVC no excerto; cursos sem nota (9003, L164) importam vagas/colocados na mesma.
    expect(rows.length).toBe(12);

    const biotec = rows.find((r) => r.codigoDges === '9016');
    expect(biotec?.codigoEscola).toBe('3161');
    expect(biotec?.nomeCurso).toBe('Biotecnologia');
    expect(biotec?.fieldValues).toEqual({
      classificacaoUltimo1F: 134.5,
      vagas1F: 27,
      colocados1F: 6
    });

    // Sem nota na 1.ª fase: importa só vagas e colocados.
    const agronomia = rows.find((r) => r.codigoDges === '9003');
    expect(agronomia?.fieldValues).toEqual({ vagas1F: 20, colocados1F: 2 });

    // Cursos de outras instituições (Setúbal, Viseu, Santarém, UTAD) ficam de fora.
    expect(rows.some((r) => ['3155', '3181', '7065', '7080'].includes(r.codigoEscola ?? ''))).toBe(
      false
    );

    // ESDL: código DGES 3165 convertido para o código da BD.
    const esdl = rows.filter((r) => r.codigoEscola === 'ESDL');
    expect(esdl.map((r) => r.codigoDges).sort()).toEqual(['9731', 'L375']);
  });

  it('parseia classificações nacionais 2025 com registos multi-linha (fase2a25.pdf)', () => {
    const text = readFileSync(
      join(__dirname, '__fixtures__', 'classificacoes-2f-nacional-2025.txt'),
      'utf8'
    );
    const { rows } = parseDgesText(text, 'classificacoes-2f', 'fase2a25.pdf');
    expect(rows.length).toBeGreaterThanOrEqual(6);

    // 2.ª fase: vagas = iniciais + recolocação (Biotecnologia: 21 + 2).
    const biotec = rows.find((r) => r.codigoDges === '9016');
    expect(biotec?.nomeCurso).toBe('Biotecnologia');
    expect(biotec?.fieldValues).toEqual({
      classificacaoUltimo2F: 135.3,
      vagas2F: 23,
      colocados2F: 1
    });

    // Sem nota na 2.ª fase: importa vagas/colocados na mesma.
    const agronomia = rows.find((r) => r.codigoDges === '9003');
    expect(agronomia?.fieldValues).toEqual({ vagas2F: 18, colocados2F: 0 });

    const gerontologia = rows.find((r) => r.codigoDges === '9833');
    expect(gerontologia?.fieldValues).toEqual({
      classificacaoUltimo2F: 120.0,
      vagas2F: 24,
      colocados2F: 10
    });
  });

  it('parseia classificações nacionais da 3.ª fase (fase3a25.pdf, layout próprio)', () => {
    const text = readFileSync(
      join(__dirname, '__fixtures__', 'classificacoes-3f-nacional-2025.txt'),
      'utf8'
    );
    const { rows } = parseDgesText(text, 'classificacoes-3f', 'fase3a25.pdf');
    expect(rows.length).toBeGreaterThanOrEqual(6);
    expect(rows.every((r) => r.codigoEscola?.startsWith('316'))).toBe(true);

    // 3.ª fase: colocados é a 5.ª coluna inteira; vagas = iniciais 3F + recolocação.
    const gerontologia = rows.find((r) => r.codigoDges === '9833');
    expect(gerontologia?.fieldValues).toEqual({
      classificacaoUltimo3F: 133.0,
      vagas3F: 5,
      colocados3F: 1
    });

    const biotec = rows.find((r) => r.codigoDges === '9016');
    expect(biotec?.fieldValues).toEqual({ vagas3F: 12, colocados3F: 0 });
  });

  it('parseia o PDF nacional StCEs25 (coleção de fichas, só cursos IPVC)', () => {
    const text = readFileSync(join(__dirname, '__fixtures__', 'stces25-multifichas.txt'), 'utf8');
    const { rows } = parseDgesText(text, 'estatistica-1f', 'StCEs25.pdf');

    // Excerto: 1 ficha Açores (excluída) + 2 fichas 3164 + 2 fichas ESDL (3165).
    expect(rows.length).toBe(4);
    expect(rows.every((r) => r.codigoEscola === '3164' || r.codigoEscola === 'ESDL')).toBe(true);

    const gestaoDist = rows.find((r) => r.codigoDges === '8464');
    expect(gestaoDist?.nomeCurso).toBe('Gestão da Distribuição e Logística');
    expect(gestaoDist?.fieldValues).toEqual({ candidatos1F: 31, colocados1F: 4 });

    const esdl = rows.filter((r) => r.codigoEscola === 'ESDL');
    expect(esdl.length).toBe(2);
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
