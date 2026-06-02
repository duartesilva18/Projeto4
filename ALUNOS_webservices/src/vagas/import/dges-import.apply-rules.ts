import { BadRequestException } from '@nestjs/common';
import type { DgesFilePreview, DgesImportPreview } from './dges-statcol.types';

export function assertPreviewFilesApplyable(files: DgesFilePreview[]): void {
  for (const file of files) {
    const docType = file.tipoOverride ?? file.detection.tipo;
    if (docType === 'desconhecido' || file.detection.unsupportedReason) {
      throw new BadRequestException(
        `Ficheiro «${file.fileName}» não pode ser aplicado (tipo não suportado).`
      );
    }
    if (file.detection.confianca === 'baixa' && !file.tipoOverride) {
      throw new BadRequestException(
        `Ficheiro «${file.fileName}»: confirme o tipo de documento antes de aplicar.`
      );
    }
    if (file.detection.phaseAmbiguous && !file.tipoOverride) {
      throw new BadRequestException(
        `Ficheiro «${file.fileName}»: fase do concurso ambígua — confirme o tipo de documento antes de aplicar.`
      );
    }
  }
}

export function assertNoImportConflicts(preview: DgesImportPreview): void {
  const conflicts = preview.summary.conflictCount ?? 0;
  if (conflicts > 0) {
    throw new BadRequestException(
      `Existem ${conflicts} conflito(s) entre ficheiros. Remova PDFs em duplicado ou gere a pré-visualização apenas com um ficheiro por campo.`
    );
  }
}
