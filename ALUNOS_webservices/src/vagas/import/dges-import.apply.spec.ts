import { applyDgesFieldUpdates } from './dges-statcol.apply';
import { groupDgesFieldsByPhase } from './dges-statcol.field-map';
import { getAndDeletePreview, savePreview } from './dges-import-preview.store';
import { VagasService } from '../vagas.service';
import type { DgesImportPreview } from './dges-statcol.types';

describe('applyDgesFieldUpdates (ec25 partial)', () => {
  it('ec25 só inclui candidatos/colocados — vagas1F não entra no UPDATE', async () => {
    const phaseValues = groupDgesFieldsByPhase({ candidatos1F: 9, colocados1F: 2 }).get(1);
    expect(phaseValues).toEqual({ candidatos: 9, colocados: 2 });
    expect(phaseValues?.vagas).toBeUndefined();

    const executeRaw = jest.fn().mockResolvedValue(0);
    const db = { $executeRaw: executeRaw };
    await applyDgesFieldUpdates(db as never, 10, 2024, {
      candidatos1F: 9,
      colocados1F: 2
    });

    expect(executeRaw).toHaveBeenCalledTimes(1);
  });
});

describe('dges-import-preview.store single-use', () => {
  it('getAndDeletePreview remove entrada após leitura', () => {
    const preview = savePreview({
      anoInicio: 2024,
      overwrite: false,
      files: [],
      summary: { fileCount: 0, courseCount: 0, fieldCount: 0, unmatchedCount: 0, conflictCount: 0 }
    });

    const first = getAndDeletePreview(preview.previewId);
    const second = getAndDeletePreview(preview.previewId);

    expect(first?.previewId).toBe(preview.previewId);
    expect(second).toBeUndefined();
  });
});

describe('VagasService.applyDgesImportPreview', () => {
  function buildPreview(): DgesImportPreview {
    return {
      previewId: '550e8400-e29b-41d4-a716-446655440000',
      createdAt: Date.now(),
      anoInicio: 2024,
      overwrite: false,
      files: [
        {
          fileName: 'ec25.pdf',
          detection: {
            tipo: 'estatistica-1f',
            confianca: 'alta',
            label: 'Estatística 1.ª fase',
            phaseAmbiguous: false
          },
          matched: [
            {
              rowId: '10-2024',
              idCursoOferta: 10,
              courseCode: '9003',
              courseName: 'Agronomia',
              schoolName: 'ESA',
              fields: [
                { fieldKey: 'candidatos1F', currentValue: 5, newValue: 9 },
                { fieldKey: 'colocados1F', currentValue: 3, newValue: 2 }
              ]
            }
          ],
          unmatched: [],
          parseWarnings: []
        }
      ],
      summary: { fileCount: 1, courseCount: 1, fieldCount: 2, unmatchedCount: 0, conflictCount: 0 }
    };
  }

  it('propaga erro de markCampoImportado (rollback via $transaction)', async () => {
    const executeRaw = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('MERGE failed'));

    const tx = { $executeRaw: executeRaw };
    const prisma = {
      $transaction: jest.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx))
    };

    const service = new VagasService(prisma as never);
    await expect(service.applyDgesImportPreview(buildPreview())).rejects.toThrow('MERGE failed');
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('aplica updates parciais sem chamar atualizarCnaCurso', async () => {
    const executeRaw = jest.fn().mockResolvedValue(undefined);
    const tx = { $executeRaw: executeRaw };
    const prisma = {
      $transaction: jest.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx))
    };

    const service = new VagasService(prisma as never);
    service['atualizarCnaCurso'] = jest.fn();

    const result = await service.applyDgesImportPreview(buildPreview());

    expect(result).toEqual({ ok: true, updatedFields: 2, updatedCourses: 1 });
    expect(service['atualizarCnaCurso']).not.toHaveBeenCalled();
    expect(executeRaw.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
