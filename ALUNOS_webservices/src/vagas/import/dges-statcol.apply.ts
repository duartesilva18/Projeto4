import { Prisma } from '@prisma/client';
import type { PrismaService } from '../../prisma/prisma.service';
import {
  groupDgesFieldsByPhase,
  type DgesDbColumn,
  type DgesPhaseColumnValues
} from './dges-statcol.field-map';

type DbClient = PrismaService | Prisma.TransactionClient;

function insertDefaults(values: DgesPhaseColumnValues) {
  return {
    vagas: values.vagas ?? 0,
    candidatos: values.candidatos ?? 0,
    colocados: values.colocados ?? 0,
    classificacao: values.classificacao_ultimo ?? null
  };
}

function buildSetFragments(values: DgesPhaseColumnValues): Prisma.Sql[] {
  const parts: Prisma.Sql[] = [];
  const columns: DgesDbColumn[] = ['vagas', 'candidatos', 'colocados', 'classificacao_ultimo'];
  for (const col of columns) {
    if (values[col] !== undefined) {
      parts.push(Prisma.sql`${Prisma.raw(col === 'classificacao_ultimo' ? 'classificacao_ultimo' : col)} = ${values[col]}`);
    }
  }
  if (values.colocados !== undefined) {
    parts.push(Prisma.sql`matriculados = ${values.colocados}`);
  }
  return parts;
}

async function applyPhasePartialUpdate(
  db: DbClient,
  idCursoOferta: number,
  anoColocacao: number,
  phaseOrder: 1 | 2 | 3,
  values: DgesPhaseColumnValues
): Promise<void> {
  const setParts = buildSetFragments(values);
  if (setParts.length === 0) return;

  const defaults = insertDefaults(values);

  await db.$executeRaw`
    DECLARE @id_via_cna INT = (SELECT id_via_acesso FROM vagas.via_acesso WHERE codigo = 'CNA');
    DECLARE @id_fase INT = (SELECT id_fase FROM vagas.fase WHERE id_via_acesso = @id_via_cna AND ordem = ${phaseOrder});
    DECLARE @id_curso_oferta INT = ${idCursoOferta};
    DECLARE @ano INT = ${anoColocacao};

    IF @id_fase IS NULL
      RETURN;

    IF EXISTS (
      SELECT 1
      FROM vagas.estatistica_acesso
      WHERE id_curso_oferta = @id_curso_oferta
        AND id_via_acesso = @id_via_cna
        AND id_fase = @id_fase
        AND ano = @ano
    )
    BEGIN
      UPDATE vagas.estatistica_acesso
      SET ${Prisma.join(setParts, ', ')}
      WHERE id_curso_oferta = @id_curso_oferta
        AND id_via_acesso = @id_via_cna
        AND id_fase = @id_fase
        AND ano = @ano;
    END
    ELSE
    BEGIN
      INSERT INTO vagas.estatistica_acesso
        (id_curso_oferta, id_via_acesso, id_fase, ano, vagas, candidatos, candidatos_primeira_op, colocados, matriculados, classificacao_ultimo, media_entrada)
      VALUES
        (@id_curso_oferta, @id_via_cna, @id_fase, @ano, ${defaults.vagas}, ${defaults.candidatos}, 0, ${defaults.colocados}, ${defaults.colocados}, ${defaults.classificacao}, NULL);
    END
  `;
}

/** UPDATE parcial em estatistica_acesso — só colunas presentes em fields */
export async function applyDgesFieldUpdates(
  db: DbClient,
  idCursoOferta: number,
  anoColocacao: number,
  fields: Record<string, number>
): Promise<void> {
  if (!Number.isFinite(idCursoOferta) || !Number.isFinite(anoColocacao)) {
    throw new Error('id_curso_oferta ou ano inválidos');
  }
  if (Object.keys(fields).length === 0) return;

  const byPhase = groupDgesFieldsByPhase(fields);
  for (const [phaseOrder, phaseValues] of byPhase.entries()) {
    await applyPhasePartialUpdate(db, idCursoOferta, anoColocacao, phaseOrder, phaseValues);
  }
}
