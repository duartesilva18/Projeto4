import { BadRequestException } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

export async function extractPdfText(buffer: Buffer): Promise<string> {
  let parser: PDFParse | undefined;
  try {
    parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    return result.text ?? '';
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    throw new BadRequestException(`Não foi possível ler o PDF: ${msg}`);
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}
