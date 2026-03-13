import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VagasService {
  constructor(private prisma: PrismaService) {}

  async listarResumoTabela() {
    // Para já usamos diretamente a view agregada definida em bd.sql:
    // vagas.vw_resumo_cna_por_curso
    const rows: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT
         id_curso_oferta,
         ano_letivo_inicio,
         ano_letivo_fim,
         ano_colocacao,
         id_curso,
         nome_curso,
         codigo_dges,
         id_escola,
         codigo_escola,
         nome_escola,
         vagas_1f,
         candidatos_1f,
         candidatos_1op_1f,
         colocados_1f,
         matriculados_1f,
         classificacao_ultimo_1f,
         media_entrada_1f,
         vagas_2f,
         candidatos_2f,
         candidatos_1op_2f,
         colocados_2f,
         matriculados_2f,
         classificacao_ultimo_2f,
         vagas_3f,
         candidatos_3f,
         candidatos_1op_3f,
         colocados_3f,
         matriculados_3f,
         classificacao_ultimo_3f,
         total_candidatos_cna,
         total_colocados_cna,
         total_matriculados_cna,
         diferenca_vagas_mat_antes_3f,
         perc_ocupacao_cna,
         matriculados_1ano,
         matriculados_2ano,
         matriculados_3ano,
         matriculados_4ano,
         total_matriculados_curso
       FROM vagas.vw_relatorio_principal_curso
       ORDER BY ano_letivo_inicio DESC, nome_escola, nome_curso`
    );

    // Mapear para estrutura tipo CourseData do mockup
    const mapped = rows.map((row) => {
      const vagasTotal = (row.vagas_1f || 0) + (row.vagas_2f || 0) + (row.vagas_3f || 0);
      const matricTotal = row.total_matriculados_cna || 0;

      return {
        id: String(row.id_curso_oferta) + '-' + String(row.ano_colocacao),
        courseCode: row.codigo_dges,
        courseName: row.nome_curso,
        schoolName: row.nome_escola,
        anoLetivoInicio: row.ano_letivo_inicio,
        anoLetivoFim: row.ano_letivo_fim,

        // Regime Nacional de Acesso – detalhe por fase
        vagas1F: row.vagas_1f || 0,
        candidatos1F: row.candidatos_1f || 0,
        candidatos1Opcao1F: row.candidatos_1op_1f || 0,
        colocados1F: row.colocados_1f || 0,
        matriculados1F: row.matriculados_1f || 0,
        classificacaoUltimo1F: row.classificacao_ultimo_1f || 0,
        mediaEntrada1F: row.media_entrada_1f || 0,

        vagas2F: row.vagas_2f || 0,
        candidatos2F: row.candidatos_2f || 0,
        candidatos1Opcao2F: row.candidatos_1op_2f || 0,
        colocados2F: row.colocados_2f || 0,
        matriculados2F: row.matriculados_2f || 0,
        classificacaoUltimo2F: row.classificacao_ultimo_2f || 0,

        vagas3F: row.vagas_3f || 0,
        candidatos3F: row.candidatos_3f || 0,
        candidatos1Opcao3F: row.candidatos_1op_3f || 0,
        colocados3F: row.colocados_3f || 0,
        matriculados3F: row.matriculados_3f || 0,
        classificacaoUltimo3F: row.classificacao_ultimo_3f || 0,
        // Por enquanto usamos as mesmas vagas da 3.ª fase como "vagas efetivas"
        vagasEfetivas3F: row.vagas_3f || 0,

        // Special Contests - por agora sem detalhe: 0
        over23Vagas: 0,
        over23Candidatos: 0,
        over23Colocados: 0,
        over23Matriculados: 0,

        cetVagas: 0,
        cetCandidatos: 0,
        cetColocados: 0,
        cetMatriculados: 0,

        ctespVagas: 0,
        ctespCandidatos: 0,
        ctespColocados: 0,
        ctespMatriculados: 0,

        otherHigherVagas: 0,
        otherHigherCandidatos: 0,
        otherHigherColocados: 0,
        otherHigherMatriculados: 0,

        dualCertVagas: 0,
        dualCertCandidatos: 0,
        dualCertColocados: 0,
        dualCertMatriculados: 0,

        // Special Regimes (sem detalhe por enquanto)
        regimesEspVagas: 0,
        regimesEspCandidatos: 0,
        regimesEspMatriculados: 0,

        // International Students
        internationalVagas: 0,
        internationalCandidatos: 0,
        internationalMatriculados: 0,

        // Totals – baseados na view CNA
        totalCandidatosCna: row.total_candidatos_cna || 0,
        totalColocados: row.total_colocados_cna || 0,
        totalMatriculados: matricTotal,
        pedidosAnulacao: 0,
        totalAvailableVacancies: vagasTotal,
        diffVacanciesEnrolled: vagasTotal - matricTotal,

        // Diferença vagas/matriculados antes da 3.ª fase (campo de fórmula da view)
        diffVagasMatAntes3F: row.diferenca_vagas_mat_antes_3f || 0,
        transfCnaOutrasIESup: 0,
        transfCnaIpvc: 0,
        sobrasPos3F: 0,

        // Reingresso (por agora ainda sem detalhe real)
        reingressoVagas: 0,
        reingressoCandidatos: 0,
        reingressoAno1: 0,
        reingressoAno2: 0,
        reingressoAno3: 0,
        reingressoAno4: 0,
        reingressoTotal1Ano: 0,

        // Mudança par Int/Curso (por agora ainda sem detalhe real)
        mudancaVagas: 0,
        mudancaCandidatos: 0,
        mudancaColocadosMatriculados: 0,

        // Yearly breakdown – a partir da view de matrículas
        year1: row.matriculados_1ano || 0,
        year2: row.matriculados_2ano || 0,
        year3: row.matriculados_3ano || 0,
        year4: row.matriculados_4ano || 0,
        totalMatriculatedPerCourse: row.total_matriculados_curso || 0,

        isEdited: false
      };
    });

    // Se ainda não houver dados reais, devolver algumas linhas mock
    if (mapped.length === 0) {
      return [
        {
          id: 'demo-1',
          courseCode: 'L001',
          courseName: 'Educação Básica',
          schoolName: 'ESE',
          anoLetivoInicio: 2024,
          anoLetivoFim: 2025,
          over23Vagas: 10,
          over23Candidatos: 15,
          over23Colocados: 8,
          over23Matriculados: 7,
          cetVagas: 5,
          cetCandidatos: 6,
          cetColocados: 4,
          cetMatriculados: 3,
          ctespVagas: 4,
          ctespCandidatos: 5,
          ctespColocados: 3,
          ctespMatriculados: 3,
          otherHigherVagas: 3,
          otherHigherCandidatos: 4,
          otherHigherColocados: 2,
          otherHigherMatriculados: 2,
          dualCertVagas: 2,
          dualCertCandidatos: 3,
          dualCertColocados: 2,
          dualCertMatriculados: 2,
          regimesEspVagas: 3,
          regimesEspCandidatos: 2,
          regimesEspMatriculados: 1,
          internationalVagas: 5,
          internationalCandidatos: 4,
          internationalMatriculados: 3,
          totalCandidatosCna: 40,
          totalColocados: 30,
          totalMatriculados: 28,
          pedidosAnulacao: 1,
          totalAvailableVacancies: 40,
          diffVacanciesEnrolled: 12,
          year1: 12,
          year2: 8,
          year3: 5,
          year4: 3,
          totalMatriculatedPerCourse: 28
        },
        {
          id: 'demo-2',
          courseCode: 'L002',
          courseName: 'Engenharia Informática',
          schoolName: 'ESTG',
          anoLetivoInicio: 2024,
          anoLetivoFim: 2025,
          over23Vagas: 8,
          over23Candidatos: 12,
          over23Colocados: 7,
          over23Matriculados: 6,
          cetVagas: 4,
          cetCandidatos: 5,
          cetColocados: 3,
          cetMatriculados: 3,
          ctespVagas: 6,
          ctespCandidatos: 7,
          ctespColocados: 5,
          ctespMatriculados: 5,
          otherHigherVagas: 3,
          otherHigherCandidatos: 4,
          otherHigherColocados: 3,
          otherHigherMatriculados: 3,
          dualCertVagas: 2,
          dualCertCandidatos: 2,
          dualCertColocados: 2,
          dualCertMatriculados: 2,
          regimesEspVagas: 2,
          regimesEspCandidatos: 2,
          regimesEspMatriculados: 1,
          internationalVagas: 4,
          internationalCandidatos: 5,
          internationalMatriculados: 4,
          totalCandidatosCna: 50,
          totalColocados: 40,
          totalMatriculados: 35,
          pedidosAnulacao: 2,
          totalAvailableVacancies: 50,
          diffVacanciesEnrolled: 15,
          year1: 15,
          year2: 10,
          year3: 6,
          year4: 4,
          totalMatriculatedPerCourse: 35
        }
      ];
    }

    return mapped;
  }

  async criarAnoLetivoSeguinte() {
    // cria o ano letivo seguinte com todos os cursos a 0
    await this.prisma.$executeRawUnsafe(`
      -- obter último ano letivo existente
      DECLARE @max_ano_inicio INT =
      (
        SELECT MAX(ano_inicio) FROM vagas.ano_letivo
      );

      IF @max_ano_inicio IS NULL
      BEGIN
        SET @max_ano_inicio = YEAR(GETDATE());
      END;

      DECLARE @ano_inicio INT = @max_ano_inicio + 1;
      DECLARE @ano_fim    INT = @ano_inicio + 1;
      DECLARE @ano_coloc  INT = @ano_inicio;

      --------------------------------------------------
      -- 1) Ano letivo
      --------------------------------------------------
      IF NOT EXISTS (
          SELECT 1 FROM vagas.ano_letivo
          WHERE ano_inicio = @ano_inicio AND ano_fim = @ano_fim
      )
      BEGIN
          INSERT INTO vagas.ano_letivo (ano_inicio, ano_fim)
          VALUES (@ano_inicio, @ano_fim);
      END;

      DECLARE @id_ano_letivo INT =
      (
          SELECT id_ano_letivo
          FROM vagas.ano_letivo
          WHERE ano_inicio = @ano_inicio AND ano_fim = @ano_fim
      );

      --------------------------------------------------
      -- 2) Curso_oferta para todos os cursos (regime Diurno)
      --------------------------------------------------
      ;WITH C AS (
          SELECT id_curso
          FROM vagas.curso
      )
      INSERT INTO vagas.curso_oferta (id_curso, id_ano_letivo, regime_oferta)
      SELECT
          C.id_curso,
          @id_ano_letivo,
          'Diurno'
      FROM C
      LEFT JOIN vagas.curso_oferta co
          ON co.id_curso = C.id_curso
         AND co.id_ano_letivo = @id_ano_letivo
         AND co.regime_oferta = 'Diurno'
      WHERE co.id_curso_oferta IS NULL;

      --------------------------------------------------
      -- 3) Estatística CNA a 0 para todos os cursos_oferta
      --------------------------------------------------
      DECLARE @id_via_CNA INT = (SELECT id_via_acesso FROM vagas.via_acesso WHERE codigo = 'CNA');
      DECLARE @id_fase_1  INT = (SELECT id_fase FROM vagas.fase WHERE id_via_acesso = @id_via_CNA AND ordem = 1);
      DECLARE @id_fase_2  INT = (SELECT id_fase FROM vagas.fase WHERE id_via_acesso = @id_via_CNA AND ordem = 2);
      DECLARE @id_fase_3  INT = (SELECT id_fase FROM vagas.fase WHERE id_via_acesso = @id_via_CNA AND ordem = 3);

      ;WITH CO AS (
          SELECT id_curso_oferta
          FROM vagas.curso_oferta
          WHERE id_ano_letivo = @id_ano_letivo
      )
      INSERT INTO vagas.estatistica_acesso (
          id_curso_oferta, id_via_acesso, id_fase, ano,
          vagas, candidatos, candidatos_primeira_op,
          colocados, matriculados, classificacao_ultimo, media_entrada
      )
      SELECT
          CO.id_curso_oferta,
          @id_via_CNA,
          F.id_fase,
          @ano_coloc,
          0, 0, 0,
          0, 0, 0, 0
      FROM CO
      CROSS JOIN (VALUES (@id_fase_1), (@id_fase_2), (@id_fase_3)) AS F(id_fase)
      LEFT JOIN vagas.estatistica_acesso ea
          ON ea.id_curso_oferta = CO.id_curso_oferta
         AND ea.id_via_acesso   = @id_via_CNA
         AND ea.id_fase         = F.id_fase
         AND ea.ano             = @ano_coloc
      WHERE ea.id_estatistica IS NULL;

      --------------------------------------------------
      -- 4) Matrículas_ano (1º ao 4º ano) a 0 para todos os cursos_oferta
      --------------------------------------------------
      ;WITH CO AS (
          SELECT id_curso_oferta
          FROM vagas.curso_oferta
          WHERE id_ano_letivo = @id_ano_letivo
      ),
      ANOS_C AS (
          SELECT 1 AS ano_curso UNION ALL
          SELECT 2 UNION ALL
          SELECT 3 UNION ALL
          SELECT 4
      )
      INSERT INTO vagas.matriculas_ano (id_curso_oferta, ano, ano_curso, total_matriculados)
      SELECT
          CO.id_curso_oferta,
          @ano_coloc,
          AC.ano_curso,
          0
      FROM CO
      CROSS JOIN ANOS_C AC
      LEFT JOIN vagas.matriculas_ano m
          ON m.id_curso_oferta = CO.id_curso_oferta
         AND m.ano            = @ano_coloc
         AND m.ano_curso      = AC.ano_curso
      WHERE m.id_matriculas_ano IS NULL;
    `);

    // devolver informação mínima sobre o ano criado
    const created = await this.prisma.$queryRawUnsafe<
      { ano_inicio: number; ano_fim: number }[]
    >(
      `SELECT ano_inicio, ano_fim
       FROM vagas.ano_letivo
       WHERE ano_inicio = (SELECT MAX(ano_inicio) FROM vagas.ano_letivo)`
    );

    return {
      ok: true,
      ano: created[0] ?? null
    };
  }
}

