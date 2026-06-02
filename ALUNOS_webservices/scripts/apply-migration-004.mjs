import 'dotenv/config';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const sql = fs.readFileSync('sql/migrations/004_dges_import_log.sql', 'utf8');

for (const batch of sql.split(/^\s*GO\s*$/gim).filter((b) => b.trim())) {
  try {
    await prisma.$executeRawUnsafe(batch);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!/already exists/i.test(msg)) console.error(msg);
  }
}

const rows = await prisma.$queryRaw`
  SELECT t.name FROM sys.tables t
  JOIN sys.schemas s ON t.schema_id = s.schema_id
  WHERE s.name = 'vagas' AND t.name = 'dges_import_log'
`;
console.log('dges_import_log:', rows.length ? 'OK' : 'MISSING');
await prisma.$disconnect();
