import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface IaAnaliseCacheEntry {
  escola: string;
  curso: string;
  anoReferencia: string;
  dadosHash: string;
  /** Relatório serializado (IaAnalyzeResponse em JSON). */
  relatorio: string;
  createdAt: string;
}

export interface IaAnaliseHistoricoEntry {
  id: number;
  escola: string;
  curso: string;
  anoReferencia: string;
  createdAt: string;
}

const memoryCache: (IaAnaliseCacheEntry & { id: number })[] = [];
let memoryIdSeq = 1;
const MEMORY_LIMIT = 50;

/**
 * Cache de relatórios da análise IA: o mesmo pedido (filtros + hash dos dados)
 * reutiliza o relatório guardado em vez de chamar a OpenAI outra vez.
 * Sem a tabela (migration 005), cai numa cache em memória.
 */
@Injectable()
export class IaAnaliseCacheRepository {
  private readonly logger = new Logger(IaAnaliseCacheRepository.name);
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
        WHERE s.name = 'vagas' AND t.name = 'ia_analise_cache'
      `;
      this.tableExists = Number(rows[0]?.cnt ?? 0) > 0;
    } catch {
      this.tableExists = false;
    }
    if (!this.tableExists) {
      this.logger.warn(
        'Tabela vagas.ia_analise_cache ausente: a usar memória (aplique a migration 005).'
      );
    }
    return this.tableExists;
  }

  async find(
    escola: string,
    curso: string,
    anoReferencia: string,
    dadosHash: string
  ): Promise<IaAnaliseCacheEntry | null> {
    if (await this.ensureTable()) {
      const rows: {
        escola: string;
        curso: string;
        ano_referencia: string;
        dados_hash: string;
        relatorio: string;
        created_at: Date;
      }[] = await this.prisma.$queryRaw`
        SELECT TOP (1) escola, curso, ano_referencia, dados_hash, relatorio, created_at
        FROM vagas.ia_analise_cache
        WHERE escola = ${escola} AND curso = ${curso}
          AND ano_referencia = ${anoReferencia} AND dados_hash = ${dadosHash}
        ORDER BY created_at DESC
      `;
      const r = rows[0];
      if (!r) return null;
      return {
        escola: r.escola,
        curso: r.curso,
        anoReferencia: r.ano_referencia,
        dadosHash: r.dados_hash,
        relatorio: r.relatorio,
        createdAt: r.created_at?.toISOString?.() ?? String(r.created_at)
      };
    }

    return (
      memoryCache.find(
        (e) =>
          e.escola === escola &&
          e.curso === curso &&
          e.anoReferencia === anoReferencia &&
          e.dadosHash === dadosHash
      ) ?? null
    );
  }

  async save(entry: Omit<IaAnaliseCacheEntry, 'createdAt'>): Promise<void> {
    if (await this.ensureTable()) {
      await this.prisma.$executeRaw`
        INSERT INTO vagas.ia_analise_cache (escola, curso, ano_referencia, dados_hash, relatorio)
        VALUES (${entry.escola}, ${entry.curso}, ${entry.anoReferencia},
                ${entry.dadosHash}, ${entry.relatorio})
      `;
      return;
    }

    memoryCache.unshift({
      id: memoryIdSeq++,
      ...entry,
      createdAt: new Date().toISOString()
    });
    if (memoryCache.length > MEMORY_LIMIT) memoryCache.length = MEMORY_LIMIT;
  }

  /** Histórico dos relatórios gerados (mais recentes primeiro). */
  async listHistorico(limit = 20): Promise<IaAnaliseHistoricoEntry[]> {
    const cap = Math.min(Math.max(limit, 1), 50);
    if (await this.ensureTable()) {
      const rows: {
        id: bigint;
        escola: string;
        curso: string;
        ano_referencia: string;
        created_at: Date;
      }[] = await this.prisma.$queryRaw`
        SELECT TOP (${cap}) id, escola, curso, ano_referencia, created_at
        FROM vagas.ia_analise_cache
        ORDER BY created_at DESC
      `;
      return rows.map((r) => ({
        id: Number(r.id),
        escola: r.escola,
        curso: r.curso,
        anoReferencia: r.ano_referencia,
        createdAt: r.created_at?.toISOString?.() ?? String(r.created_at)
      }));
    }

    return memoryCache.slice(0, cap).map((e) => ({
      id: e.id,
      escola: e.escola,
      curso: e.curso,
      anoReferencia: e.anoReferencia,
      createdAt: e.createdAt
    }));
  }
}
