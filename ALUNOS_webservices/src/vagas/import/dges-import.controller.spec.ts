import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DgesImportController } from '../dges-import.controller';
import { DgesImportService } from './dges-import.service';
import { JwtGuard } from '../../auth/guard';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest');

describe('DgesImportController (HTTP)', () => {
  let app: INestApplication;
  const dgesImportService = {
    listTipos: jest.fn().mockReturnValue([]),
    listFormatos: jest.fn().mockReturnValue({ suportados: [], naoSuportados: [] }),
    listHistorico: jest.fn().mockResolvedValue([]),
    previewImport: jest.fn().mockResolvedValue({ previewId: '550e8400-e29b-41d4-a716-446655440000' }),
    applyImport: jest.fn().mockResolvedValue({ ok: true, updatedFields: 2, updatedCourses: 1 })
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [DgesImportController],
      providers: [{ provide: DgesImportService, useValue: dgesImportService }]
    })
      .overrideGuard(JwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /vagas/import/dges/formatos', () => {
    return request(app.getHttpServer()).get('/vagas/import/dges/formatos').expect(200);
  });

  it('GET /vagas/import/dges/historico', async () => {
    await request(app.getHttpServer()).get('/vagas/import/dges/historico?ano=2025').expect(200);
    expect(dgesImportService.listHistorico).toHaveBeenCalledWith(2025);
  });

  it('POST /vagas/import/dges/apply delega ao service', async () => {
    await request(app.getHttpServer())
      .post('/vagas/import/dges/apply')
      .send({ previewId: '550e8400-e29b-41d4-a716-446655440000' })
      .expect(201);
    expect(dgesImportService.applyImport).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440000',
      null
    );
  });

  it('POST /vagas/import/dges/preview delega ao service', async () => {
    await request(app.getHttpServer())
      .post('/vagas/import/dges/preview')
      .field('anoInicio', '2025')
      .attach('files', Buffer.from('%PDF-1.4 test'), 'ok.pdf')
      .expect(201);
    expect(dgesImportService.previewImport).toHaveBeenCalled();
  });
});
