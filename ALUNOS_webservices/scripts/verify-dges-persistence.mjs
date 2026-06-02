import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRaw`
    SELECT t.name AS table_name
    FROM sys.tables t
    JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE s.name = 'vagas' AND t.name = 'campo_origem'
  `;
  console.log('=== Tabela vagas.campo_origem ===');
  console.log(tables.length ? 'EXISTE' : 'NAO EXISTE');

  if (tables.length) {
    const count = await prisma.$queryRaw`SELECT COUNT(*) AS n FROM vagas.campo_origem`;
    console.log('Registos:', Number(count[0].n));

    const sample = await prisma.$queryRaw`
      SELECT TOP 5 id_curso_oferta, ano_colocacao, chave_campo, origem, tipo_documento, ficheiro_nome, importado_em
      FROM vagas.campo_origem
      ORDER BY importado_em DESC
    `;
    console.log('Ultimos registos:', JSON.stringify(sample, null, 2));
  } else {
    console.log('ACCAO: executar sql/migrations/002_campo_origem.sql');
  }

  const anos = await prisma.$queryRaw`
    SELECT TOP 5 ano_inicio, ano_fim FROM vagas.ano_letivo ORDER BY ano_inicio DESC
  `;
  console.log('\n=== Anos letivos ===');
  console.log(JSON.stringify(anos, null, 2));

  const withOrigem = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT CAST(id_curso_oferta AS VARCHAR) + '-' + CAST(ano_colocacao AS VARCHAR)) AS cursos
    FROM vagas.campo_origem
    WHERE origem = 'DGES_STATCOL'
  `.catch(() => [{ cursos: 0 }]);
  console.log('\n=== Importacoes DGES registadas ===');
  console.log('Cursos com campos importados:', Number(withOrigem[0]?.cursos ?? 0));

  const eaCount = await prisma.$queryRaw`
    SELECT COUNT(*) AS n
    FROM vagas.estatistica_acesso ea
    JOIN vagas.via_acesso va ON va.id_via_acesso = ea.id_via_acesso
    WHERE va.codigo = 'CNA'
  `;
  console.log('\n=== Dados base proposta vagas ===');
  console.log('Linhas CNA em estatistica_acesso:', Number(eaCount[0].n));

  const cursos2025 = await prisma.$queryRaw`
    SELECT COUNT(*) AS n FROM vagas.vw_relatorio_principal_curso WHERE ano_letivo_inicio = 2025
  `;
  console.log('Cursos visiveis ano 2025/2026:', Number(cursos2025[0].n));
}

main()
  .catch((e) => {
    console.error('ERRO BD:', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
