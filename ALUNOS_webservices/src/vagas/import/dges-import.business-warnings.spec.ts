import { collectBusinessWarnings, collectFileBusinessWarnings } from './dges-import.business-warnings';
import type { DgesFilePreview, DgesImportPreview } from './dges-statcol.types';

describe('dges-import.business-warnings', () => {
  const baseFile = (): DgesFilePreview => ({
    fileName: 'test.pdf',
    detection: { tipo: 'estatistica-1f', confianca: 'alta', label: 'test' },
    matched: [],
    unmatched: [],
    parseWarnings: []
  });

  it('avisa colocados > vagas', () => {
    const file: DgesFilePreview = {
      ...baseFile(),
      matched: [
        {
          rowId: '1-2025',
          idCursoOferta: 1,
          courseCode: '6799',
          courseName: 'Agricultura',
          schoolName: 'ESA',
          fields: [
            { fieldKey: 'vagas1F', currentValue: 0, newValue: 10 },
            { fieldKey: 'colocados1F', currentValue: 0, newValue: 15 }
          ]
        }
      ]
    };
    const warnings = collectFileBusinessWarnings(file);
    expect(warnings.some((w) => /colocados.*>.*vagas/i.test(w))).toBe(true);
  });

  it('avisa candidatos < colocados', () => {
    const file: DgesFilePreview = {
      ...baseFile(),
      matched: [
        {
          rowId: '1-2025',
          idCursoOferta: 1,
          courseCode: '6799',
          courseName: 'Agricultura',
          schoolName: 'ESA',
          fields: [
            { fieldKey: 'candidatos1F', currentValue: 0, newValue: 5 },
            { fieldKey: 'colocados1F', currentValue: 0, newValue: 12 }
          ]
        }
      ]
    };
    const warnings = collectFileBusinessWarnings(file);
    expect(warnings.some((w) => /candidatos.*<.*colocados/i.test(w))).toBe(true);
  });

  it('avisa zero suspeito quando havia valor manual', () => {
    const file: DgesFilePreview = {
      ...baseFile(),
      matched: [
        {
          rowId: '1-2025',
          idCursoOferta: 1,
          courseCode: '6799',
          courseName: 'Agricultura',
          schoolName: 'ESA',
          fields: [{ fieldKey: 'vagas1F', currentValue: 20, newValue: 0 }]
        }
      ]
    };
    const warnings = collectFileBusinessWarnings(file);
    expect(warnings.some((w) => /passa de 20 para 0/i.test(w))).toBe(true);
  });

  it('agrega avisos no preview', () => {
    const preview: DgesImportPreview = {
      previewId: 'x',
      anoInicio: 2025,
      overwrite: false,
      files: [
        {
          ...baseFile(),
          matched: [
            {
              rowId: '1-2025',
              idCursoOferta: 1,
              courseCode: '6799',
              courseName: 'Agricultura',
              schoolName: 'ESA',
              fields: [{ fieldKey: 'vagas1F', currentValue: 5, newValue: 0 }]
            }
          ]
        }
      ],
      summary: { fileCount: 1, courseCount: 1, fieldCount: 1, unmatchedCount: 0 },
      createdAt: Date.now()
    };
    expect(collectBusinessWarnings(preview).length).toBeGreaterThan(0);
  });
});
