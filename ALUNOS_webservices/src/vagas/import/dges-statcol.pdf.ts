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
    // "URI malformed" vem do pdf.js quando o ficheiro está corrompido/truncado
    // (ex.: download incompleto) e entra em modo de recuperação.
    if (/URI malformed/i.test(msg)) {
      throw new BadRequestException(
        'Não foi possível ler o PDF: o ficheiro parece estar corrompido ou o download ficou incompleto. ' +
          'Volte a descarregar o PDF da página statcol da DGES e tente novamente.'
      );
    }
    throw new BadRequestException(`Não foi possível ler o PDF: ${msg}`);
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}
