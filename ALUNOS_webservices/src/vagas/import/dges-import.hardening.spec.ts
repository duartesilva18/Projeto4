import { groupDgesFieldsByPhase, isAllowedDgesFieldKey } from './dges-statcol.field-map';
import {
  assertExtractedPdfText,
  assertPdfBuffer,
  assertPreviewId,
  parseTipoOverridesJson
} from './dges-import.validation';
import { matchParsedRows } from './dges-statcol.match';
import { BadRequestException } from '@nestjs/common';

describe('dges-statcol.field-map', () => {
  it('agrupa campos ec25 só candidatos/colocados na fase 1', () => {
    const grouped = groupDgesFieldsByPhase({ candidatos1F: 9, colocados1F: 2 });
    expect(grouped.get(1)).toEqual({ candidatos: 9, colocados: 2 });
    expect(grouped.has(2)).toBe(false);
    expect(isAllowedDgesFieldKey('vagas1F')).toBe(true);
    expect(isAllowedDgesFieldKey('invalid')).toBe(false);
  });

  it('rejeita fieldKey desconhecido', () => {
    expect(() => groupDgesFieldsByPhase({ foo: 1 })).toThrow(/não suportado/);
  });
});

describe('dges-import.validation', () => {
  it('valida previewId UUID', () => {
    expect(() => assertPreviewId('not-a-uuid')).toThrow(/previewId inválido/);
    expect(assertPreviewId('550e8400-e29b-41d4-a716-446655440000')).toBe(
      '550e8400-e29b-41d4-a716-446655440000'
    );
  });

  it('rejeita tipoOverrides JSON inválido', () => {
    expect(() => parseTipoOverridesJson('{')).toThrow(/JSON inválido/);
    expect(() => parseTipoOverridesJson('{"a.pdf":"foo"}')).toThrow(/tipo inválido/);
  });

  it('aceita tipoOverrides válidos', () => {
    const r = parseTipoOverridesJson('{"x.pdf":"estatistica-1f"}');
    expect(r).toEqual({ 'x.pdf': 'estatistica-1f' });
  });

  it('rejeita PDF inválido e texto vazio', () => {
    expect(() => assertPdfBuffer(Buffer.from('not-pdf'), 'x.pdf')).toThrow(BadRequestException);
    expect(() => assertExtractedPdfText('', 'x.pdf')).toThrow(/sem texto selecionável/);
  });

  it('aceita PDF com magic bytes', () => {
    expect(() => assertPdfBuffer(Buffer.from('%PDF-1.4 test'), 'ok.pdf')).not.toThrow();
  });
});

describe('dges-statcol.match overwrite', () => {
  const tableRows = [
    {
      id: '10-2024',
      idCursoOferta: 10,
      courseCode: '9003',
      courseName: 'Agronomia',
      schoolName: 'ESA',
      schoolCode: '3161',
      anoLetivoInicio: 2024,
      vagas1F: 20,
      candidatos1F: 5,
      colocados1F: 3,
      importedFields: ['candidatos1F']
    },
    {
      id: '11-2024',
      idCursoOferta: 11,
      courseCode: '9003',
      courseName: 'Outro curso',
      schoolName: 'ESE',
      schoolCode: '3162',
      anoLetivoInicio: 2024,
      vagas1F: 0,
      candidatos1F: 0,
      colocados1F: 0,
      importedFields: []
    }
  ];

  it('desambigua código DGES duplicado por escola', () => {
    const { matched, unmatched } = matchParsedRows(
      [
        {
          codigoDges: '9003',
          nomeCurso: 'X',
          codigoEscola: '3161',
          fieldValues: { candidatos1F: 9 }
        }
      ],
      tableRows,
      2024,
      'estatistica-1f',
      true
    );
    expect(matched.length).toBe(1);
    expect(matched[0].rowId).toBe('10-2024');
    expect(unmatched.length).toBe(0);
  });

  it('código ambíguo sem desambiguação fica unmatched', () => {
    const { matched, unmatched } = matchParsedRows(
      [{ codigoDges: '9003', nomeCurso: 'Nome desconhecido' }],
      tableRows,
      2024,
      'estatistica-1f',
      true
    );
    expect(matched.length).toBe(0);
    expect(unmatched[0].reason).toMatch(/ambíguo/i);
  });

  it('permite re-import de campo com origem DGES sem overwrite', () => {
    const { matched } = matchParsedRows(
      [
        {
          codigoDges: '9003',
          nomeCurso: 'Agronomia',
          codigoEscola: '3161',
          fieldValues: { candidatos1F: 9 }
        }
      ],
      tableRows,
      2024,
      'estatistica-1f',
      false
    );
    expect(matched[0].fields[0].skipped).toBeFalsy();
    expect(matched[0].fields[0].newValue).toBe(9);
  });

  it('bloqueia valor manual sem overwrite', () => {
    const { matched } = matchParsedRows(
      [
        {
          codigoDges: '9003',
          nomeCurso: 'Agronomia',
          codigoEscola: '3161',
          fieldValues: { vagas1F: 25 }
        }
      ],
      tableRows,
      2024,
      'estatistica-1f',
      false
    );
    expect(matched[0].fields[0].skipped).toBe(true);
    expect(matched[0].fields[0].skipReason).toMatch(/manual/i);
  });
});

describe('DgesImportService multi-file conflicts', () => {
  const tableRow = {
    id: '10-2024',
    idCursoOferta: 10,
    courseCode: '9003',
    courseName: 'Agronomia',
    schoolName: 'ESA',
    schoolCode: '3161',
    anoLetivoInicio: 2024,
    vagas1F: 20,
    candidatos1F: 0,
    colocados1F: 0,
    importedFields: []
  };

  beforeEach(() => {
    jest.resetModules();
  });

  it('reporta conflito quando dois PDFs alteram o mesmo campo', async () => {
    jest.doMock('./dges-statcol.pdf', () => ({
      extractPdfText: jest.fn().mockResolvedValue('texto')
    }));
    jest.doMock('./dges-statcol.detect', () => ({
      detectDgesDocumentType: jest.fn().mockReturnValue({
        tipo: 'estatistica-1f',
        confianca: 'alta',
        label: 'Estatística 1.ª fase'
      })
    }));
    jest.doMock('./dges-statcol.parse-text', () => ({
      parseDgesText: jest.fn().mockReturnValue({
        rows: [
          {
            codigoDges: '9003',
            nomeCurso: 'Agronomia',
            codigoEscola: '3161',
            fieldValues: { candidatos1F: 5 }
          }
        ],
        warnings: []
      })
    }));

    const { DgesImportService } = await import('./dges-import.service');
    const vagasService = {
      assertAnoLetivoExists: jest.fn().mockResolvedValue(undefined),
      listarResumoTabelaForImport: jest.fn().mockResolvedValue([tableRow])
    };
    const service = new DgesImportService(vagasService as never, {
      savePreview: jest.fn().mockImplementation(async (p) => ({
        ...p,
        previewId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: Date.now()
      }))
    } as never, { insertLog: jest.fn(), listHistorico: jest.fn() } as never);

    const files = [
      { originalname: 'a.pdf', buffer: Buffer.from('%PDF-1.4 a') },
      { originalname: 'b.pdf', buffer: Buffer.from('%PDF-1.4 b') }
    ] as Express.Multer.File[];

    const preview = await service.previewImport(files, 2024, true);
    expect(preview.summary.conflictCount).toBe(1);
    expect(preview.files[1].parseWarnings.some((w) => /Conflito/i.test(w))).toBe(true);
  });
});
