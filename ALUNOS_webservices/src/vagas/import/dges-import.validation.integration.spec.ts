import { BadRequestException } from '@nestjs/common';
import { DgesImportService } from './dges-import.service';

describe('DgesImportService validation (integration)', () => {
  const previewRepo = {
    savePreview: jest.fn().mockImplementation(async (p) => ({
      ...p,
      previewId: '550e8400-e29b-41d4-a716-446655440000',
      createdAt: Date.now()
    })),
    getAndDeletePreview: jest.fn()
  };

  const vagasService = {
    assertAnoLetivoExists: jest.fn().mockResolvedValue(undefined),
    listarResumoTabelaForImport: jest.fn().mockResolvedValue([]),
    anoLetivoExists: jest.fn().mockResolvedValue(true),
    applyDgesImportPreview: jest.fn()
  };

  const logRepo = { insertLog: jest.fn(), listHistorico: jest.fn().mockResolvedValue([]) };

  const service = new DgesImportService(vagasService as never, previewRepo as never, logRepo as never);

  beforeEach(() => jest.clearAllMocks());

  it('preview rejeita PDF inválido', async () => {
    await expect(
      service.previewImport(
        [{ buffer: Buffer.from('not-pdf'), originalname: 'bad.pdf' } as Express.Multer.File],
        2025,
        false
      )
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('apply rejeita previewId inválido', async () => {
    await expect(service.applyImport('not-a-uuid')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('apply rejeita conflitos', async () => {
    previewRepo.getAndDeletePreview.mockResolvedValue({
      previewId: '550e8400-e29b-41d4-a716-446655440000',
      createdAt: Date.now(),
      anoInicio: 2025,
      overwrite: false,
      files: [],
      summary: { fileCount: 1, courseCount: 1, fieldCount: 2, unmatchedCount: 0, conflictCount: 1 }
    });
    await expect(
      service.applyImport('550e8400-e29b-41d4-a716-446655440000')
    ).rejects.toThrow(/conflito/i);
  });
});
