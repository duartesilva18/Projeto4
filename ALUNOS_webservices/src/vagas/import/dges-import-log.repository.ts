import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface DgesImportLogEntry {
  id: number;
  previewId: string | null;
  userId: string | null;
  anoInicio: number;
  ficheiros: string[];
  updatedFields: number;
  updatedCourses: number;
  createdAt: string;
}

const memoryLog: DgesImportLogEntry[] = [];
let memoryIdSeq = 1;

@Injectable()
export class DgesImportLogRepository {
  private readonly logger = new Logger(DgesImportLogRepository.name);
  private tableChecked = false;
  private tableExists = false;

  constructor(private readonly prisma: PrismaService) {}

  private async ensureTable(): Promise<boolean> {
    if (this.tableChecked) return this.tableExists;
    this.tableChecked = true;
    try {
      const rows: { cnt: number }[] = await this.prisma.$queryRaw`
        SELECT COUNT(*) AS cnt FROM sys.tables t
        JOIN sys.schemas s ON t.schema_id = s.schema_id
        WHERE s.name = 'vagas' AND t.name = 'dges_import_log'
      `;
      this.tableExists = Number(rows[0]?.cnt ?? 0) > 0;
    } catch {
      this.tableExists = false;
    }
    if (!this.tableExists) {
      this.logger.warn('Tabela vagas.dges_import_log ausente — a usar memória (aplique migration 004).');
    }
    return this.tableExists;
  }

  async insertLog(entry: {
    previewId: string;
    userId: string | null;
    anoInicio: number;
    ficheiros: string[];
    updatedFields: number;
    updatedCourses: number;
  }): Promise<void> {
    const ficheirosJson = JSON.stringify(entry.ficheiros);
    if (await this.ensureTable()) {
      await this.prisma.$executeRaw`
        INSERT INTO vagas.dges_import_log
          (preview_id, user_id, ano_inicio, ficheiros, updated_fields, updated_courses)
        VALUES
          (${entry.previewId}, ${entry.userId}, ${entry.anoInicio}, ${ficheirosJson},
           ${entry.updatedFields}, ${entry.updatedCourses})
      `;
      return;
    }
    memoryLog.unshift({
      id: memoryIdSeq++,
      previewId: entry.previewId,
      userId: entry.userId,
      anoInicio: entry.anoInicio,
      ficheiros: entry.ficheiros,
      updatedFields: entry.updatedFields,
      updatedCourses: entry.updatedCourses,
      createdAt: new Date().toISOString()
    });
    if (memoryLog.length > 100) memoryLog.length = 100;
  }

  async listHistorico(anoInicio: number, limit = 20): Promise<DgesImportLogEntry[]> {
    const cap = Math.min(Math.max(limit, 1), 50);
    if (await this.ensureTable()) {
      const rows: {
        id: bigint;
        preview_id: string | null;
        user_id: string | null;
        ano_inicio: number;
        ficheiros: string;
        updated_fields: number;
        updated_courses: number;
        created_at: Date;
      }[] = await this.prisma.$queryRaw`
        SELECT TOP (${cap})
          id, preview_id, user_id, ano_inicio, ficheiros,
          updated_fields, updated_courses, created_at
        FROM vagas.dges_import_log
        WHERE ano_inicio = ${anoInicio}
        ORDER BY created_at DESC
      `;
      return rows.map((r) => ({
        id: Number(r.id),
        previewId: r.preview_id,
        userId: r.user_id,
        anoInicio: r.ano_inicio,
        ficheiros: parseFicheiros(r.ficheiros),
        updatedFields: r.updated_fields,
        updatedCourses: r.updated_courses,
        createdAt: r.created_at?.toISOString?.() ?? String(r.created_at)
      }));
    }
    return memoryLog
      .filter((e) => e.anoInicio === anoInicio)
      .slice(0, cap);
  }
}

function parseFicheiros(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
