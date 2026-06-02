import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { VagasService } from '../vagas.service';
import { detectDgesDocumentType } from './dges-statcol.detect';
import { DgesImportPreviewRepository } from './dges-import-preview.repository';
import { DgesImportLogRepository } from './dges-import-log.repository';
import { collectBusinessWarnings } from './dges-import.business-warnings';
import { assertNoImportConflicts, assertPreviewFilesApplyable } from './dges-import.apply-rules';
import { validatePreviewBeforeApply } from './dges-import.revalidate';
import { matchParsedRows, type CourseIndexRow } from './dges-statcol.match';
import { parseDgesText } from './dges-statcol.parse-text';
import { extractPdfText } from './dges-statcol.pdf';
import {
  assertExtractedPdfText,
  assertPdfBuffer,
  assertPreviewId,
  parseTipoOverridesJson
} from './dges-import.validation';
import {
  DGES_DOC_LABELS,
  type DgesDocType,
  type DgesFilePreview,
  type DgesImportPreview,
  type DgesApplyResult,
  type DgesImportLogRow
} from './dges-statcol.types';
import {
  DGES_SUPPORTED_PDF_FORMATS,
  DGES_NAO_COBERTO_PROPOSTA,
  DGES_STATCOL_PAGE_COVERAGE,
  DGES_UNSUPPORTED_PDF_HINTS
} from './dges-statcol.formats';

@Injectable()
export class DgesImportService {
  constructor(
    private readonly vagasService: VagasService,
    private readonly previewRepository: DgesImportPreviewRepository,
    private readonly logRepository: DgesImportLogRepository
  ) {}

  listTipos() {
    return Object.entries(DGES_DOC_LABELS)
      .filter(([k]) => k !== 'desconhecido')
      .map(([id, label]) => ({ id, label }));
  }

  listFormatos() {
    return {
      suportados: DGES_SUPPORTED_PDF_FORMATS,
      naoSuportados: DGES_UNSUPPORTED_PDF_HINTS,
      coberturaStatcol: DGES_STATCOL_PAGE_COVERAGE,
      naoCobertoProposta: DGES_NAO_COBERTO_PROPOSTA,
      nota: 'Pode carregar vários PDFs de formatos diferentes na mesma importação (ex.: 2 fichas ec25 + 1 estatística nacional).'
    };
  }

  async previewImport(
    files: Express.Multer.File[],
    anoInicio: number,
    overwrite: boolean,
    tipoOverrides?: Record<string, DgesDocType>
  ): Promise<DgesImportPreview> {
    if (!files?.length) {
      throw new BadRequestException('Nenhum ficheiro PDF enviado.');
    }
    if (!Number.isFinite(anoInicio)) {
      throw new BadRequestException('Ano letivo inválido.');
    }
    await this.vagasService.assertAnoLetivoExists(anoInicio);

    const tableRows = await this.vagasService.listarResumoTabelaForImport(anoInicio);
    const indexRows: CourseIndexRow[] = tableRows.map((r) => ({
      ...r,
      idCursoOferta: Number(String(r.id).split('-')[0]),
      importedFields: r.importedFields ?? []
    }));

    const filePreviews: DgesFilePreview[] = [];
    const fieldSources = new Map<string, string>();
    let conflictCount = 0;

    for (const file of files) {
      assertPdfBuffer(file.buffer, file.originalname);
      const text = await extractPdfText(file.buffer);
      assertExtractedPdfText(text, file.originalname);

      const detection = detectDgesDocumentType(text, file.originalname);
      const override = tipoOverrides?.[file.originalname];
      const docType = override ?? detection.tipo;

      const { rows, warnings } = parseDgesText(text, docType, file.originalname);
      const parseWarnings = [...warnings];
      if (detection.unsupportedReason) {
        parseWarnings.unshift(detection.unsupportedReason);
      } else if (detection.phaseAmbiguous && !override) {
        parseWarnings.unshift(
          'Fase do concurso ambígua — confirme o tipo de documento manualmente.'
        );
      } else if (docType === 'desconhecido' && !override) {
        parseWarnings.unshift(
          'Não foi possível identificar o tipo de documento. Confirme o tipo manualmente abaixo.'
        );
      }

      const { matched, unmatched } = matchParsedRows(
        rows,
        indexRows,
        anoInicio,
        docType,
        overwrite
      );

      for (const m of matched) {
        for (const field of m.fields) {
          if (field.skipped) continue;
          const key = `${m.rowId}|${field.fieldKey}`;
          if (fieldSources.has(key)) {
            conflictCount++;
            parseWarnings.push(
              `Conflito: ${field.fieldKey} para ${m.courseName} também em «${fieldSources.get(key)}» — prevalece «${file.originalname}».`
            );
          }
          fieldSources.set(key, file.originalname);
        }
      }

      filePreviews.push({
        fileName: file.originalname,
        detection,
        tipoOverride: override,
        matched,
        unmatched,
        parseWarnings
      });
    }

    let courseCount = 0;
    let fieldCount = 0;
    let unmatchedCount = 0;
    const courseIds = new Set<string>();

    for (const fp of filePreviews) {
      unmatchedCount += fp.unmatched.length;
      for (const m of fp.matched) {
        courseIds.add(m.rowId);
        fieldCount += m.fields.filter((f) => !f.skipped).length;
      }
    }
    courseCount = courseIds.size;

    const saved = await this.previewRepository.savePreview({
      anoInicio,
      overwrite,
      files: filePreviews,
      summary: {
        fileCount: filePreviews.length,
        courseCount,
        fieldCount,
        unmatchedCount,
        conflictCount
      }
    });

    const businessWarnings = collectBusinessWarnings(saved);
    if (businessWarnings.length) {
      saved.businessWarnings = businessWarnings;
    }
    return saved;
  }

  async listHistorico(anoInicio: number): Promise<DgesImportLogRow[]> {
    if (!Number.isFinite(anoInicio)) {
      throw new BadRequestException('Ano letivo inválido.');
    }
    return this.logRepository.listHistorico(anoInicio);
  }

  async applyImport(previewId: string, userId?: string | null): Promise<DgesApplyResult> {
    const id = assertPreviewId(previewId);
    const preview = await this.previewRepository.getAndDeletePreview(id);
    if (!preview) {
      throw new NotFoundException('Pré-visualização expirada ou inválida. Gere novamente.');
    }

    const anoExists = await this.vagasService.anoLetivoExists(preview.anoInicio);
    if (!anoExists) {
      throw new ConflictException(
        'O ano letivo já não existe na base de dados. Gere a pré-visualização novamente.'
      );
    }

    if (preview.summary.fieldCount <= 0) {
      throw new BadRequestException('Não há campos para importar nesta pré-visualização.');
    }

    assertNoImportConflicts(preview);
    assertPreviewFilesApplyable(preview.files);

    const tableRows = await this.vagasService.listarResumoTabelaForImport(preview.anoInicio);
    const indexRows: CourseIndexRow[] = tableRows.map((r) => ({
      ...r,
      idCursoOferta: Number(String(r.id).split('-')[0]),
      importedFields: r.importedFields ?? []
    }));
    validatePreviewBeforeApply(preview, indexRows);

    const ficheiros = preview.files.map((f) => f.fileName);
    const result = await this.vagasService.applyDgesImportPreview(preview);

    await this.logRepository.insertLog({
      previewId: id,
      userId: userId ?? null,
      anoInicio: preview.anoInicio,
      ficheiros,
      updatedFields: result.updatedFields,
      updatedCourses: result.updatedCourses
    });

    return { ...result, ficheiros };
  }
}
