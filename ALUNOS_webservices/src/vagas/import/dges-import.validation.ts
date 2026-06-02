import { BadRequestException } from '@nestjs/common';
import { DGES_DOC_LABELS, type DgesDocType } from './dges-statcol.types';

const VALID_DOC_TYPES = new Set(
  Object.keys(DGES_DOC_LABELS).filter((k) => k !== 'desconhecido')
);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const DGES_MAX_FILE_BYTES = 10 * 1024 * 1024;
export const DGES_MAX_FILES = 20;

export function assertPdfBuffer(buffer: Buffer, fileName: string): void {
  if (!buffer?.length) {
    throw new BadRequestException(`Ficheiro vazio: ${fileName}`);
  }
  if (buffer.length > DGES_MAX_FILE_BYTES) {
    throw new BadRequestException(
      `Ficheiro demasiado grande (${fileName}). Máximo ${DGES_MAX_FILE_BYTES / (1024 * 1024)}MB.`
    );
  }
  const header = buffer.subarray(0, 5).toString('ascii');
  if (!header.startsWith('%PDF-')) {
    throw new BadRequestException(`Ficheiro não é um PDF válido: ${fileName}`);
  }
}

export function assertExtractedPdfText(text: string, fileName: string): void {
  if (!text || !text.trim()) {
    throw new BadRequestException(
      `PDF sem texto selecionável (${fileName}). Use um PDF exportado com texto, não uma digitalização.`
    );
  }
}

export function parseTipoOverridesJson(
  json: string | undefined
): Record<string, DgesDocType> | undefined {
  if (!json) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new BadRequestException('tipoOverrides: JSON inválido.');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new BadRequestException('tipoOverrides: deve ser um objeto.');
  }

  const result: Record<string, DgesDocType> = {};
  for (const [fileName, tipo] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof tipo !== 'string' || !VALID_DOC_TYPES.has(tipo)) {
      throw new BadRequestException(
        `tipoOverrides: tipo inválido "${String(tipo)}" para ficheiro "${fileName}".`
      );
    }
    result[fileName] = tipo as DgesDocType;
  }
  return result;
}

export function assertPreviewId(previewId: string | undefined): string {
  if (!previewId || typeof previewId !== 'string' || !previewId.trim()) {
    throw new BadRequestException('previewId é obrigatório.');
  }
  const id = previewId.trim();
  if (!UUID_RE.test(id)) {
    throw new BadRequestException('previewId inválido.');
  }
  return id;
}
