import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function buildMinimalPdf(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter(Boolean);
  const escaped = lines.map((line) =>
    line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
  );

  let streamBody = 'BT\n/F1 10 Tf\n';
  escaped.forEach((line, i) => {
    const y = 750 - i * 14;
    streamBody += `50 ${y} Td\n(${line}) Tj\n`;
    if (i < escaped.length - 1) streamBody += '0 -14 Td\n';
  });
  streamBody += 'ET';

  const streamLen = Buffer.byteLength(streamBody, 'utf8');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamBody}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf8');
}

const fixturesDir = path.join(__dirname, '../../../src/vagas/import/__fixtures__');

const estatistica = fs.readFileSync(path.join(fixturesDir, 'estatistica-1f-ipvc.txt'), 'utf8');
const ec25 = fs.readFileSync(path.join(fixturesDir, 'ec25-31619016-ficha.txt'), 'utf8');
const classificacoes = fs.readFileSync(path.join(fixturesDir, 'classificacoes-2f-ipvc.txt'), 'utf8');

const files = {
  'estatistica-1f-ipvc.pdf': `1.ª FASE Estatística por par estabelecimento/curso\n${estatistica}`,
  'ec25-9003-ipvc.pdf': ec25,
  'classificacoes-2f-ipvc.pdf': `2.ª FASE Classificações últimos colocados\n${classificacoes}`,
  'resumo-colocacao.pdf':
    'Resumo da colocação por par estabelecimento/curso\nInstituto Politécnico de Viana do Castelo'
};

for (const [name, text] of Object.entries(files)) {
  fs.writeFileSync(path.join(__dirname, name), buildMinimalPdf(text));
  console.log('Wrote', name);
}
