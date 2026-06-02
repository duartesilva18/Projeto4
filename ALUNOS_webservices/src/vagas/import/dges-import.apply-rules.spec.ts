import { BadRequestException, ConflictException } from '@nestjs/common';
import { assertNoImportConflicts, assertPreviewFilesApplyable } from './dges-import.apply-rules';
import { validatePreviewBeforeApply } from './dges-import.revalidate';
import type { DgesImportPreview } from './dges-statcol.types';

describe('dges-import.apply-rules', () => {
  const baseFile = {
    fileName: 'a.pdf',
    detection: {
      tipo: 'estatistica-1f' as const,
      confianca: 'alta' as const,
      label: 'Estatística 1.ª fase'
    },
    matched: [],
    unmatched: [],
    parseWarnings: []
  };

  it('bloqueia apply com conflitos', () => {
    const preview = {
      summary: { conflictCount: 2 }
    } as DgesImportPreview;
    expect(() => assertNoImportConflicts(preview)).toThrow(BadRequestException);
  });

  it('bloqueia phaseAmbiguous sem override', () => {
    expect(() =>
      assertPreviewFilesApplyable([
        {
          ...baseFile,
          detection: { ...baseFile.detection, phaseAmbiguous: true }
        }
      ])
    ).toThrow(/ambígua/i);
  });

  it('permite phaseAmbiguous com override', () => {
    expect(() =>
      assertPreviewFilesApplyable([
        {
          ...baseFile,
          detection: { ...baseFile.detection, phaseAmbiguous: true },
          tipoOverride: 'estatistica-1f'
        }
      ])
    ).not.toThrow();
  });
});

describe('validatePreviewBeforeApply', () => {
  const preview: DgesImportPreview = {
    previewId: '550e8400-e29b-41d4-a716-446655440000',
    createdAt: Date.now(),
    anoInicio: 2024,
    overwrite: false,
    files: [
      {
        fileName: 'a.pdf',
        detection: {
          tipo: 'estatistica-1f',
          confianca: 'alta',
          label: 'Estatística 1.ª fase'
        },
        matched: [
          {
            rowId: '10-2024',
            idCursoOferta: 10,
            courseCode: '9003',
            courseName: 'Agronomia',
            schoolName: 'ESA',
            fields: [{ fieldKey: 'candidatos1F', currentValue: 5, newValue: 9 }]
          }
        ],
        unmatched: [],
        parseWarnings: []
      }
    ],
    summary: { fileCount: 1, courseCount: 1, fieldCount: 1, unmatchedCount: 0, conflictCount: 0 }
  };

  it('rejeita se valor mudou desde preview', () => {
    expect(() =>
      validatePreviewBeforeApply(preview, [
        {
          id: '10-2024',
          idCursoOferta: 10,
          courseCode: '9003',
          courseName: 'Agronomia',
          schoolName: 'ESA',
          anoLetivoInicio: 2024,
          candidatos1F: 7
        }
      ])
    ).toThrow(ConflictException);
  });

  it('aceita se valor igual ao preview', () => {
    expect(() =>
      validatePreviewBeforeApply(preview, [
        {
          id: '10-2024',
          idCursoOferta: 10,
          courseCode: '9003',
          courseName: 'Agronomia',
          schoolName: 'ESA',
          anoLetivoInicio: 2024,
          candidatos1F: 5
        }
      ])
    ).not.toThrow();
  });
});
