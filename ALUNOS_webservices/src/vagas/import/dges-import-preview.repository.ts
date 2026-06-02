import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import type { DgesImportPreview } from './dges-statcol.types';

const TTL_MS = 15 * 60 * 1000;
const MAX_ENTRIES = 200;

/** Fallback em memória se a tabela SQL ainda não existir */
const memoryStore = new Map<string, DgesImportPreview>();

@Injectable()
export class DgesImportPreviewRepository {
  private readonly logger = new Logger(DgesImportPreviewRepository.name);
  private sqlAvailable: boolean | null = null;

  constructor(private readonly prisma: PrismaService) {}

  private async useSqlStore(): Promise<boolean> {
    if (this.sqlAvailable !== null) return this.sqlAvailable;
    try {
      const rows: { ok: number }[] = await this.prisma.$queryRaw`
        SELECT TOP 1 1 AS ok
        FROM sys.tables t
        JOIN sys.schemas s ON t.schema_id = s.schema_id
        WHERE s.name = 'vagas' AND t.name = 'dges_import_preview'
      `;
      this.sqlAvailable = rows.length > 0;
    } catch {
      this.sqlAvailable = false;
    }
    if (!this.sqlAvailable) {
      this.logger.warn(
        'Tabela vagas.dges_import_preview ausente — a usar store em memória. Execute sql/migrations/003_dges_import_preview.sql'
      );
    }
    return this.sqlAvailable;
  }

  private async purgeExpiredSql(): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM vagas.dges_import_preview WHERE expires_at < SYSUTCDATETIME()
    `;
  }

  private purgeExpiredMemory(): void {
    const now = Date.now();
    for (const [id, p] of memoryStore.entries()) {
      if (now - p.createdAt > TTL_MS) memoryStore.delete(id);
    }
  }

  async savePreview(
    preview: Omit<DgesImportPreview, 'previewId' | 'createdAt'>
  ): Promise<DgesImportPreview> {
    const entry: DgesImportPreview = {
      ...preview,
      previewId: randomUUID(),
      createdAt: Date.now()
    };

    if (await this.useSqlStore()) {
      await this.purgeExpiredSql();
      const countRows: { n: number }[] = await this.prisma.$queryRaw`
        SELECT COUNT(*) AS n FROM vagas.dges_import_preview
      `;
      if (Number(countRows[0]?.n ?? 0) >= MAX_ENTRIES) {
        await this.prisma.$executeRaw`
          DELETE FROM vagas.dges_import_preview
          WHERE preview_id = (
            SELECT TOP 1 preview_id FROM vagas.dges_import_preview ORDER BY created_at ASC
          )
        `;
      }
      const expiresAt = new Date(entry.createdAt + TTL_MS);
      await this.prisma.$executeRaw`
        INSERT INTO vagas.dges_import_preview (preview_id, payload, created_at, expires_at)
        VALUES (${entry.previewId}, ${JSON.stringify(entry)}, ${new Date(entry.createdAt)}, ${expiresAt})
      `;
      return entry;
    }

    this.purgeExpiredMemory();
    if (memoryStore.size >= MAX_ENTRIES) {
      const oldest = [...memoryStore.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt)[0];
      if (oldest) memoryStore.delete(oldest[0]);
    }
    memoryStore.set(entry.previewId, entry);
    return entry;
  }

  async getAndDeletePreview(previewId: string): Promise<DgesImportPreview | undefined> {
    if (await this.useSqlStore()) {
      await this.purgeExpiredSql();
      const rows: { payload: string }[] = await this.prisma.$queryRaw`
        SELECT payload FROM vagas.dges_import_preview
        WHERE preview_id = ${previewId} AND expires_at >= SYSUTCDATETIME()
      `;
      if (!rows.length) return undefined;
      await this.prisma.$executeRaw`
        DELETE FROM vagas.dges_import_preview WHERE preview_id = ${previewId}
      `;
      try {
        return JSON.parse(rows[0].payload) as DgesImportPreview;
      } catch {
        return undefined;
      }
    }

    this.purgeExpiredMemory();
    const entry = memoryStore.get(previewId);
    if (entry) memoryStore.delete(previewId);
    return entry;
  }
}
