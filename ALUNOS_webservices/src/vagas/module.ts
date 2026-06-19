import { Module } from '@nestjs/common';
import { VagasService } from './vagas.service';
import { VagasController } from './vagas.controller';
import { DgesImportController } from './dges-import.controller';
import { DgesImportService } from './import/dges-import.service';
import { DgesImportPreviewRepository } from './import/dges-import-preview.repository';
import { DgesImportLogRepository } from './import/dges-import-log.repository';

@Module({
  controllers: [VagasController, DgesImportController],
  providers: [
    VagasService,
    DgesImportService,
    DgesImportPreviewRepository,
    DgesImportLogRepository
  ],
  exports: [VagasService],
})
export class VagasModule {}

