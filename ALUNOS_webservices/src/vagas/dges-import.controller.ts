import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../auth/guard';
import { DgesImportService } from './import/dges-import.service';
import { parseTipoOverridesJson } from './import/dges-import.validation';
import { DGES_MAX_FILE_BYTES, DGES_MAX_FILES } from './import/dges-import.validation';

@Controller('vagas/import/dges')
export class DgesImportController {
  constructor(private readonly dgesImportService: DgesImportService) {}

  @Get('tipos')
  listTipos() {
    return this.dgesImportService.listTipos();
  }

  @Get('formatos')
  listFormatos() {
    return this.dgesImportService.listFormatos();
  }

  @Get('historico')
  @UseGuards(JwtGuard)
  listHistorico(@Query('ano') ano: string) {
    return this.dgesImportService.listHistorico(Number(ano));
  }

  @Post('preview')
  @UseGuards(JwtGuard)
  @UseInterceptors(
    FilesInterceptor('files', DGES_MAX_FILES, { limits: { fileSize: DGES_MAX_FILE_BYTES } })
  )
  async preview(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('anoInicio') anoInicio: string,
    @Body('overwrite') overwrite?: string,
    @Body('tipoOverrides') tipoOverridesJson?: string
  ) {
    const tipoOverrides = parseTipoOverridesJson(tipoOverridesJson);
    return this.dgesImportService.previewImport(
      files ?? [],
      Number(anoInicio),
      overwrite === 'true' || overwrite === '1',
      tipoOverrides
    );
  }

  @Post('apply')
  @UseGuards(JwtGuard)
  apply(@Body('previewId') previewId: string, @Req() req: { user?: { id_utilizador?: string } }) {
    const userId = req.user?.id_utilizador ?? null;
    return this.dgesImportService.applyImport(previewId, userId);
  }
}
