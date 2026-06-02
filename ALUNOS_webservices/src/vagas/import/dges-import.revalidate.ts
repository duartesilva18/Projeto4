import { ConflictException } from '@nestjs/common';
import type { DgesImportPreview } from './dges-statcol.types';
import type { CourseIndexRow } from './dges-statcol.match';

function liveFieldValue(row: CourseIndexRow, fieldKey: string): number {
  const v = Number(row[fieldKey]);
  return Number.isFinite(v) ? v : 0;
}

/** Garante que cursos existem e valores não mudaram desde o preview */
export function validatePreviewBeforeApply(
  preview: DgesImportPreview,
  tableRows: CourseIndexRow[]
): void {
  const indexById = new Map(tableRows.map((r) => [r.id, r]));

  for (const file of preview.files) {
    for (const match of file.matched) {
      const row = indexById.get(match.rowId);
      if (!row) {
        throw new ConflictException(
          `Curso «${match.courseName}» (${match.courseCode}) já não existe na tabela do ano selecionado. Gere a pré-visualização novamente.`
        );
      }

      for (const field of match.fields) {
        if (field.skipped) continue;
        const live = liveFieldValue(row, field.fieldKey);
        if (live !== field.currentValue) {
          throw new ConflictException(
            `O campo «${field.fieldKey}» de «${match.courseName}» foi alterado desde a pré-visualização (${field.currentValue} → ${live}). Gere a pré-visualização novamente.`
          );
        }
      }
    }
  }
}
