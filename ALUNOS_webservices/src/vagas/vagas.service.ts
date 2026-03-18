import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VagasService {
  constructor(private prisma: PrismaService) {}

  /**
   * Atualiza dados CNA "atómicos" (vagas/candidatos/colocados) para que as VIEWs
   * recalculadas (totais/diferença/percentagens) se reflitam no frontend.
   *
   * Nota: o frontend trata "matriculados" como dependente do Excel; como o modal
   * não edita "matriculados" diretamente, aqui assumimos (para manter consistência
   * com o dataset) que matriculados = colocados.
   */
  async atualizarCnaCurso(
    id: string,
    body: {
      vagas1F?: number;
      candidatos1F?: number;
      colocados1F?: number;
      candidatos1Opcao1F?: number;
      classificacaoUltimo1F?: number;
      mediaEntrada1F?: number;
      vagas2F?: number;
      candidatos2F?: number;
      colocados2F?: number;
      candidatos1Opcao2F?: number;
      classificacaoUltimo2F?: number;
      vagas3F?: number;
      candidatos3F?: number;
      colocados3F?: number;
      candidatos1Opcao3F?: number;
      classificacaoUltimo3F?: number;
      sobrasPos3F?: number;
      diffVagasMatAntes3F?: number;
      percOcupacaoCna?: number;
    }
  ) {
    // id gerado no frontend: `${id_curso_oferta}-${ano_colocacao}`
    const [idCursoOfertaStr, anoColocacaoStr] = id.split('-');
    const idCursoOferta = Number(idCursoOfertaStr);
    const anoColocacao = Number(anoColocacaoStr);

    if (!Number.isFinite(idCursoOferta) || !Number.isFinite(anoColocacao)) {
      throw new Error(`id inválido para curso CNA: ${id}`);
    }

    const toInt = (v: unknown) => {
      if (v === undefined || v === null) return undefined;
      const raw = typeof v === 'string' ? v.replace(',', '.') : v;
      const n = Number(raw);
      return Number.isFinite(n) ? Math.trunc(n) : undefined;
    };
    const toNullableNumber = (v: unknown) => {
      if (v === undefined || v === null) return undefined;
      const raw = typeof v === 'string' ? v.replace(',', '.') : v;
      const n = Number(raw);
      return Number.isFinite(n) ? n : undefined;
    };

    const v1 = toInt(body.vagas1F);
    const c1 = toInt(body.candidatos1F);
    const l1 = toInt(body.colocados1F);
    const opc1 = toInt(body.candidatos1Opcao1F);
    const class1 = toNullableNumber(body.classificacaoUltimo1F);
    const media1 = toNullableNumber(body.mediaEntrada1F);

    const v2 = toInt(body.vagas2F);
    const c2 = toInt(body.candidatos2F);
    const l2 = toInt(body.colocados2F);
    const opc2 = toInt(body.candidatos1Opcao2F);
    const class2 = toNullableNumber(body.classificacaoUltimo2F);

    const v3 = toInt(body.vagas3F);
    const c3 = toInt(body.candidatos3F);
    const l3 = toInt(body.colocados3F);
    const opc3 = toInt(body.candidatos1Opcao3F);
    const class3 = toNullableNumber(body.classificacaoUltimo3F);

    const sobrasPos3F = toInt(body.sobrasPos3F);
    const diffVagasMatAntes3F = toInt(body.diffVagasMatAntes3F);
    const percOcupacaoCna = toNullableNumber(body.percOcupacaoCna);

    // Se nada veio, não fazemos update.
    if (
      [
        v1,
        c1,
        l1,
        opc1,
        class1,
        media1,
        v2,
        c2,
        l2,
        opc2,
        class2,
        v3,
        c3,
        l3,
        opc3,
        class3,
        sobrasPos3F,
        diffVagasMatAntes3F,
        percOcupacaoCna
      ].every((x) => x === undefined)
    ) {
      return { ok: true, updated: 0 };
    }

    // Executar em sequência (transaction implícita por batch T-SQL)
    // Usamos UPDATE/INSERT por fase (idempotente) para evitar depender de MERGE.
    await this.prisma.$executeRawUnsafe(`
      DECLARE @id_curso_oferta INT = ${idCursoOferta};
      DECLARE @ano SMALLINT = ${anoColocacao};
      DECLARE @id_via_cna INT = (SELECT id_via_acesso FROM vagas.via_acesso WHERE codigo = 'CNA');

      DECLARE @id_fase_1 INT = (SELECT id_fase FROM vagas.fase WHERE id_via_acesso = @id_via_cna AND ordem = 1);
      DECLARE @id_fase_2 INT = (SELECT id_fase FROM vagas.fase WHERE id_via_acesso = @id_via_cna AND ordem = 2);
      DECLARE @id_fase_3 INT = (SELECT id_fase FROM vagas.fase WHERE id_via_acesso = @id_via_cna AND ordem = 3);

      -- 1.ª fase
      ${v1 !== undefined || c1 !== undefined || l1 !== undefined || opc1 !== undefined || class1 !== undefined || media1 !== undefined ? `
      IF EXISTS (
        SELECT 1
        FROM vagas.estatistica_acesso
        WHERE id_curso_oferta = @id_curso_oferta
          AND id_via_acesso = @id_via_cna
          AND id_fase = @id_fase_1
          AND ano = @ano
      )
      BEGIN
        UPDATE vagas.estatistica_acesso
        SET vagas = ${v1 ?? 'NULL'},
            candidatos = ${c1 ?? 'NULL'},
            candidatos_primeira_op = ${opc1 ?? 'NULL'},
            classificacao_ultimo = ${class1 ?? 'NULL'},
            colocados = ${l1 ?? 'NULL'},
            matriculados = ${l1 ?? 'NULL'},
            media_entrada = ${media1 ?? 'NULL'}
        WHERE id_curso_oferta = @id_curso_oferta
          AND id_via_acesso = @id_via_cna
          AND id_fase = @id_fase_1
          AND ano = @ano;
      END
      ELSE
      BEGIN
        INSERT INTO vagas.estatistica_acesso
          (id_curso_oferta, id_via_acesso, id_fase, ano, vagas, candidatos, candidatos_primeira_op, colocados, matriculados, classificacao_ultimo, media_entrada)
        VALUES
          (@id_curso_oferta, @id_via_cna, @id_fase_1, @ano, ${v1 ?? 'NULL'}, ${c1 ?? 'NULL'}, ${opc1 ?? 'NULL'}, ${l1 ?? 'NULL'}, ${l1 ?? 'NULL'}, ${class1 ?? 'NULL'}, ${media1 ?? 'NULL'});
      END
      ` : ''}

      -- 2.ª fase
      ${v2 !== undefined || c2 !== undefined || l2 !== undefined || opc2 !== undefined || class2 !== undefined ? `
      IF EXISTS (
        SELECT 1
        FROM vagas.estatistica_acesso
        WHERE id_curso_oferta = @id_curso_oferta
          AND id_via_acesso = @id_via_cna
          AND id_fase = @id_fase_2
          AND ano = @ano
      )
      BEGIN
        UPDATE vagas.estatistica_acesso
        SET vagas = ${v2 ?? 'NULL'},
            candidatos = ${c2 ?? 'NULL'},
            candidatos_primeira_op = ${opc2 ?? 'NULL'},
            colocados = ${l2 ?? 'NULL'},
            matriculados = ${l2 ?? 'NULL'},
            classificacao_ultimo = ${class2 ?? 'NULL'}
        WHERE id_curso_oferta = @id_curso_oferta
          AND id_via_acesso = @id_via_cna
          AND id_fase = @id_fase_2
          AND ano = @ano;
      END
      ELSE
      BEGIN
        INSERT INTO vagas.estatistica_acesso
          (id_curso_oferta, id_via_acesso, id_fase, ano, vagas, candidatos, candidatos_primeira_op, colocados, matriculados, classificacao_ultimo, media_entrada)
        VALUES
          (@id_curso_oferta, @id_via_cna, @id_fase_2, @ano, ${v2 ?? 'NULL'}, ${c2 ?? 'NULL'}, ${opc2 ?? 'NULL'}, ${l2 ?? 'NULL'}, ${l2 ?? 'NULL'}, ${class2 ?? 'NULL'}, NULL);
      END
      ` : ''}

      -- 3.ª fase
      ${v3 !== undefined || c3 !== undefined || l3 !== undefined || opc3 !== undefined || class3 !== undefined ? `
      IF EXISTS (
        SELECT 1
        FROM vagas.estatistica_acesso
        WHERE id_curso_oferta = @id_curso_oferta
          AND id_via_acesso = @id_via_cna
          AND id_fase = @id_fase_3
          AND ano = @ano
      )
      BEGIN
        UPDATE vagas.estatistica_acesso
        SET vagas = ${v3 ?? 'NULL'},
            candidatos = ${c3 ?? 'NULL'},
            candidatos_primeira_op = ${opc3 ?? 'NULL'},
            colocados = ${l3 ?? 'NULL'},
            matriculados = ${l3 ?? 'NULL'},
            classificacao_ultimo = ${class3 ?? 'NULL'}
        WHERE id_curso_oferta = @id_curso_oferta
          AND id_via_acesso = @id_via_cna
          AND id_fase = @id_fase_3
          AND ano = @ano;
      END
      ELSE
      BEGIN
        INSERT INTO vagas.estatistica_acesso
          (id_curso_oferta, id_via_acesso, id_fase, ano, vagas, candidatos, candidatos_primeira_op, colocados, matriculados, classificacao_ultimo, media_entrada)
        VALUES
          (@id_curso_oferta, @id_via_cna, @id_fase_3, @ano, ${v3 ?? 'NULL'}, ${c3 ?? 'NULL'}, ${opc3 ?? 'NULL'}, ${l3 ?? 'NULL'}, ${l3 ?? 'NULL'}, ${class3 ?? 'NULL'}, NULL);
      END
      ` : ''}

      -- SOBRAS (inseridas manualmente)
      ${sobrasPos3F !== undefined ? `
      IF EXISTS (
        SELECT 1
        FROM vagas.sobras_pos_3f
        WHERE id_curso_oferta = @id_curso_oferta
          AND ano = @ano
      )
      BEGIN
        UPDATE vagas.sobras_pos_3f
        SET sobras_pos_3f = ${sobrasPos3F}
        WHERE id_curso_oferta = @id_curso_oferta
          AND ano = @ano;
      END
      ELSE
      BEGIN
        INSERT INTO vagas.sobras_pos_3f (id_curso_oferta, ano, sobras_pos_3f)
        VALUES (@id_curso_oferta, @ano, ${sobrasPos3F});
      END
      ` : ''}

      -- DIFERENÇA VAGAS/MAT (override manual)
      ${diffVagasMatAntes3F !== undefined ? `
      IF EXISTS (
        SELECT 1
        FROM vagas.diff_vagas_mat_antes_3f_override
        WHERE id_curso_oferta = @id_curso_oferta
          AND ano = @ano
      )
      BEGIN
        UPDATE vagas.diff_vagas_mat_antes_3f_override
        SET diff_vagas_mat_antes_3f = ${diffVagasMatAntes3F}
        WHERE id_curso_oferta = @id_curso_oferta
          AND ano = @ano;
      END
      ELSE
      BEGIN
        INSERT INTO vagas.diff_vagas_mat_antes_3f_override (id_curso_oferta, ano, diff_vagas_mat_antes_3f)
        VALUES (@id_curso_oferta, @ano, ${diffVagasMatAntes3F});
      END
      ` : ''}

      -- TRANSF CNA p o IPVC (override manual)
      ${percOcupacaoCna !== undefined ? `
      IF EXISTS (
        SELECT 1
        FROM vagas.perc_ocupacao_cna_override
        WHERE id_curso_oferta = @id_curso_oferta
          AND ano = @ano
      )
      BEGIN
        UPDATE vagas.perc_ocupacao_cna_override
        SET perc_ocupacao_cna = ${percOcupacaoCna}
        WHERE id_curso_oferta = @id_curso_oferta
          AND ano = @ano;
      END
      ELSE
      BEGIN
        INSERT INTO vagas.perc_ocupacao_cna_override (id_curso_oferta, ano, perc_ocupacao_cna)
        VALUES (@id_curso_oferta, @ano, ${percOcupacaoCna});
      END
      ` : ''}
    `);

    return { ok: true };
  }

  async atualizarConcursosEspeciais(
    id: string,
    body: {
      over23Vagas?: number;
      over23Candidatos?: number;
      over23Colocados?: number;
      over23Matriculados?: number;
      cetVagas?: number;
      cetCandidatos?: number;
      cetColocados?: number;
      cetMatriculados?: number;
      ctespVagas?: number;
      ctespCandidatos?: number;
      ctespColocados?: number;
      ctespMatriculados?: number;
      otherHigherVagas?: number;
      otherHigherCandidatos?: number;
      otherHigherColocados?: number;
      otherHigherMatriculados?: number;
      dualCertVagas?: number;
      dualCertCandidatos?: number;
      dualCertColocados?: number;
      dualCertMatriculados?: number;
    }
  ) {
    const [idCursoOfertaStr, anoColocacaoStr] = id.split('-');
    const idCursoOferta = Number(idCursoOfertaStr);
    const anoColocacao = Number(anoColocacaoStr);

    if (!Number.isFinite(idCursoOferta) || !Number.isFinite(anoColocacao)) {
      throw new Error(`id inválido para concursos especiais: ${id}`);
    }

    const toInt = (v: unknown) => {
      if (v === undefined || v === null) return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? Math.trunc(n) : undefined;
    };

    const toVal = (v: unknown) => toInt(v) ?? 0;

    const over23V = toVal(body.over23Vagas);
    const over23C = toVal(body.over23Candidatos);
    const over23L = toVal(body.over23Colocados);
    const over23M = toVal(body.over23Matriculados);

    const cetV = toVal(body.cetVagas);
    const cetC = toVal(body.cetCandidatos);
    const cetL = toVal(body.cetColocados);
    const cetM = toVal(body.cetMatriculados);

    const ctespV = toVal(body.ctespVagas);
    const ctespC = toVal(body.ctespCandidatos);
    const ctespL = toVal(body.ctespColocados);
    const ctespM = toVal(body.ctespMatriculados);

    const otherV = toVal(body.otherHigherVagas);
    const otherC = toVal(body.otherHigherCandidatos);
    const otherL = toVal(body.otherHigherColocados);
    const otherM = toVal(body.otherHigherMatriculados);

    const dualV = toVal(body.dualCertVagas);
    const dualC = toVal(body.dualCertCandidatos);
    const dualL = toVal(body.dualCertColocados);
    const dualM = toVal(body.dualCertMatriculados);

    await this.prisma.$executeRawUnsafe(`
      DECLARE @id_curso_oferta INT = ${idCursoOferta};
      DECLARE @ano SMALLINT = ${anoColocacao};
      DECLARE @id_via_esp INT = (SELECT id_via_acesso FROM vagas.via_acesso WHERE codigo = 'ESP');

      DECLARE @id_fase_1 INT = (SELECT id_fase FROM vagas.fase WHERE id_via_acesso = @id_via_esp AND ordem = 1);
      DECLARE @id_fase_2 INT = (SELECT id_fase FROM vagas.fase WHERE id_via_acesso = @id_via_esp AND ordem = 2);
      DECLARE @id_fase_3 INT = (SELECT id_fase FROM vagas.fase WHERE id_via_acesso = @id_via_esp AND ordem = 3);
      DECLARE @id_fase_4 INT = (SELECT id_fase FROM vagas.fase WHERE id_via_acesso = @id_via_esp AND ordem = 4);
      DECLARE @id_fase_5 INT = (SELECT id_fase FROM vagas.fase WHERE id_via_acesso = @id_via_esp AND ordem = 5);

      IF @id_fase_1 IS NULL OR @id_fase_2 IS NULL OR @id_fase_3 IS NULL OR @id_fase_4 IS NULL OR @id_fase_5 IS NULL
      BEGIN
        THROW 50001, 'Faltam fases para ESP (ordens 1..5). Corre o bd.sql com a insercao das fases.', 1;
      END

      -- >23 anos (ordem 1)
      IF EXISTS (
        SELECT 1
        FROM vagas.estatistica_acesso
        WHERE id_curso_oferta = @id_curso_oferta
          AND id_via_acesso = @id_via_esp
          AND id_fase = @id_fase_1
          AND ano = @ano
      )
      BEGIN
        UPDATE vagas.estatistica_acesso
        SET vagas = ${over23V},
            candidatos = ${over23C},
            colocados = ${over23L},
            matriculados = ${over23M},
            candidatos_primeira_op = NULL,
            classificacao_ultimo = NULL,
            media_entrada = NULL
        WHERE id_curso_oferta = @id_curso_oferta
          AND id_via_acesso = @id_via_esp
          AND id_fase = @id_fase_1
          AND ano = @ano;
      END
      ELSE
      BEGIN
        INSERT INTO vagas.estatistica_acesso
          (id_curso_oferta, id_via_acesso, id_fase, ano, vagas, candidatos, candidatos_primeira_op, colocados, matriculados, classificacao_ultimo, media_entrada)
        VALUES
          (@id_curso_oferta, @id_via_esp, @id_fase_1, @ano, ${over23V}, ${over23C}, NULL, ${over23L}, ${over23M}, NULL, NULL);
      END

      -- CET (ordem 2)
      IF EXISTS (
        SELECT 1
        FROM vagas.estatistica_acesso
        WHERE id_curso_oferta = @id_curso_oferta
          AND id_via_acesso = @id_via_esp
          AND id_fase = @id_fase_2
          AND ano = @ano
      )
      BEGIN
        UPDATE vagas.estatistica_acesso
        SET vagas = ${cetV},
            candidatos = ${cetC},
            colocados = ${cetL},
            matriculados = ${cetM},
            candidatos_primeira_op = NULL,
            classificacao_ultimo = NULL,
            media_entrada = NULL
        WHERE id_curso_oferta = @id_curso_oferta
          AND id_via_acesso = @id_via_esp
          AND id_fase = @id_fase_2
          AND ano = @ano;
      END
      ELSE
      BEGIN
        INSERT INTO vagas.estatistica_acesso
          (id_curso_oferta, id_via_acesso, id_fase, ano, vagas, candidatos, candidatos_primeira_op, colocados, matriculados, classificacao_ultimo, media_entrada)
        VALUES
          (@id_curso_oferta, @id_via_esp, @id_fase_2, @ano, ${cetV}, ${cetC}, NULL, ${cetL}, ${cetM}, NULL, NULL);
      END

      -- CTeSP (ordem 3)
      IF EXISTS (
        SELECT 1
        FROM vagas.estatistica_acesso
        WHERE id_curso_oferta = @id_curso_oferta
          AND id_via_acesso = @id_via_esp
          AND id_fase = @id_fase_3
          AND ano = @ano
      )
      BEGIN
        UPDATE vagas.estatistica_acesso
        SET vagas = ${ctespV},
            candidatos = ${ctespC},
            colocados = ${ctespL},
            matriculados = ${ctespM},
            candidatos_primeira_op = NULL,
            classificacao_ultimo = NULL,
            media_entrada = NULL
        WHERE id_curso_oferta = @id_curso_oferta
          AND id_via_acesso = @id_via_esp
          AND id_fase = @id_fase_3
          AND ano = @ano;
      END
      ELSE
      BEGIN
        INSERT INTO vagas.estatistica_acesso
          (id_curso_oferta, id_via_acesso, id_fase, ano, vagas, candidatos, candidatos_primeira_op, colocados, matriculados, classificacao_ultimo, media_entrada)
        VALUES
          (@id_curso_oferta, @id_via_esp, @id_fase_3, @ano, ${ctespV}, ${ctespC}, NULL, ${ctespL}, ${ctespM}, NULL, NULL);
      END

      -- Outros sup. (ordem 4)
      IF EXISTS (
        SELECT 1
        FROM vagas.estatistica_acesso
        WHERE id_curso_oferta = @id_curso_oferta
          AND id_via_acesso = @id_via_esp
          AND id_fase = @id_fase_4
          AND ano = @ano
      )
      BEGIN
        UPDATE vagas.estatistica_acesso
        SET vagas = ${otherV},
            candidatos = ${otherC},
            colocados = ${otherL},
            matriculados = ${otherM},
            candidatos_primeira_op = NULL,
            classificacao_ultimo = NULL,
            media_entrada = NULL
        WHERE id_curso_oferta = @id_curso_oferta
          AND id_via_acesso = @id_via_esp
          AND id_fase = @id_fase_4
          AND ano = @ano;
      END
      ELSE
      BEGIN
        INSERT INTO vagas.estatistica_acesso
          (id_curso_oferta, id_via_acesso, id_fase, ano, vagas, candidatos, candidatos_primeira_op, colocados, matriculados, classificacao_ultimo, media_entrada)
        VALUES
          (@id_curso_oferta, @id_via_esp, @id_fase_4, @ano, ${otherV}, ${otherC}, NULL, ${otherL}, ${otherM}, NULL, NULL);
      END

      -- Dupla cert. (ordem 5)
      IF EXISTS (
        SELECT 1
        FROM vagas.estatistica_acesso
        WHERE id_curso_oferta = @id_curso_oferta
          AND id_via_acesso = @id_via_esp
          AND id_fase = @id_fase_5
          AND ano = @ano
      )
      BEGIN
        UPDATE vagas.estatistica_acesso
        SET vagas = ${dualV},
            candidatos = ${dualC},
            colocados = ${dualL},
            matriculados = ${dualM},
            candidatos_primeira_op = NULL,
            classificacao_ultimo = NULL,
            media_entrada = NULL
        WHERE id_curso_oferta = @id_curso_oferta
          AND id_via_acesso = @id_via_esp
          AND id_fase = @id_fase_5
          AND ano = @ano;
      END
      ELSE
      BEGIN
        INSERT INTO vagas.estatistica_acesso
          (id_curso_oferta, id_via_acesso, id_fase, ano, vagas, candidatos, candidatos_primeira_op, colocados, matriculados, classificacao_ultimo, media_entrada)
        VALUES
          (@id_curso_oferta, @id_via_esp, @id_fase_5, @ano, ${dualV}, ${dualC}, NULL, ${dualL}, ${dualM}, NULL, NULL);
      END
    `);

    return { ok: true };
  }

  async atualizarRegimesEspInternacionais(
    id: string,
    body: {
      regimesEspVagas?: number;
      regimesEspCandidatos?: number;
      regimesEspMatriculados?: number;
      internationalVagas?: number;
      internationalCandidatos?: number;
      internationalMatriculados?: number;
    }
  ) {
    const [idCursoOfertaStr, anoColocacaoStr] = id.split('-');
    const idCursoOferta = Number(idCursoOfertaStr);
    const anoColocacao = Number(anoColocacaoStr);

    if (!Number.isFinite(idCursoOferta) || !Number.isFinite(anoColocacao)) {
      throw new Error(`id inválido para regimes: ${id}`);
    }

    const toInt = (v: unknown) => {
      if (v === undefined || v === null) return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? Math.trunc(n) : undefined;
    };

    const toVal = (v: unknown) => toInt(v) ?? 0;

    const regV = toVal(body.regimesEspVagas);
    const regC = toVal(body.regimesEspCandidatos);
    const regM = toVal(body.regimesEspMatriculados);

    const intV = toVal(body.internationalVagas);
    const intC = toVal(body.internationalCandidatos);
    const intM = toVal(body.internationalMatriculados);

    await this.prisma.$executeRawUnsafe(`
      DECLARE @id_curso_oferta INT = ${idCursoOferta};
      DECLARE @ano SMALLINT = ${anoColocacao};

      DECLARE @id_via_reg_esp INT = (SELECT id_via_acesso FROM vagas.via_acesso WHERE codigo = 'REG_ESP');
      DECLARE @id_via_int INT = (SELECT id_via_acesso FROM vagas.via_acesso WHERE codigo = 'INT');

      -- REG_ESP (id_fase = NULL)
      DELETE FROM vagas.estatistica_acesso
      WHERE id_curso_oferta = @id_curso_oferta
        AND id_via_acesso = @id_via_reg_esp
        AND id_fase IS NULL
        AND ano = @ano;

      INSERT INTO vagas.estatistica_acesso
        (id_curso_oferta, id_via_acesso, id_fase, ano, vagas, candidatos, candidatos_primeira_op, colocados, matriculados, classificacao_ultimo, media_entrada)
      VALUES
        (@id_curso_oferta, @id_via_reg_esp, NULL, @ano, ${regV}, ${regC}, NULL, ${regM}, ${regM}, NULL, NULL);

      -- INT (id_fase = NULL)
      DELETE FROM vagas.estatistica_acesso
      WHERE id_curso_oferta = @id_curso_oferta
        AND id_via_acesso = @id_via_int
        AND id_fase IS NULL
        AND ano = @ano;

      INSERT INTO vagas.estatistica_acesso
        (id_curso_oferta, id_via_acesso, id_fase, ano, vagas, candidatos, candidatos_primeira_op, colocados, matriculados, classificacao_ultimo, media_entrada)
      VALUES
        (@id_curso_oferta, @id_via_int, NULL, @ano, ${intV}, ${intC}, NULL, ${intM}, ${intM}, NULL, NULL);
    `);

    return { ok: true };
  }

  async atualizarReingressoMudanca(
    id: string,
    body: {
      reingressoVagas?: number;
      reingressoCandidatos?: number;
      reingressoAno1?: number;
      reingressoAno2?: number;
      reingressoAno3?: number;
      reingressoAno4?: number;

      mudancaVagas?: number;
      mudancaCandidatos?: number;
      mudancaColocadosMatriculados?: number;
    }
  ) {
    const [idCursoOfertaStr, anoColocacaoStr] = id.split('-');
    const idCursoOferta = Number(idCursoOfertaStr);
    const anoColocacao = Number(anoColocacaoStr);

    if (!Number.isFinite(idCursoOferta) || !Number.isFinite(anoColocacao)) {
      throw new Error(`id inválido para reingresso/mudança: ${id}`);
    }

    const toInt = (v: unknown) => {
      if (v === undefined || v === null) return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? Math.trunc(n) : undefined;
    };

    const toVal = (v: unknown) => toInt(v) ?? 0;

    const reingV = toVal(body.reingressoVagas);
    const reingC = toVal(body.reingressoCandidatos);
    const reing1 = toVal(body.reingressoAno1);
    const reing2 = toVal(body.reingressoAno2);
    const reing3 = toVal(body.reingressoAno3);
    const reing4 = toVal(body.reingressoAno4);

    const mudV = toVal(body.mudancaVagas);
    const mudC = toVal(body.mudancaCandidatos);
    const mudCM = toVal(body.mudancaColocadosMatriculados);

    await this.prisma.$executeRawUnsafe(`
      DECLARE @id_curso_oferta INT = ${idCursoOferta};
      DECLARE @ano SMALLINT = ${anoColocacao};
      DECLARE @id_via_reing INT = (SELECT id_via_acesso FROM vagas.via_acesso WHERE codigo = 'REING');
      DECLARE @id_via_mud INT = (SELECT id_via_acesso FROM vagas.via_acesso WHERE codigo = 'MUD_PAR');

      DECLARE @id_fase_1 INT = (SELECT id_fase FROM vagas.fase WHERE id_via_acesso = @id_via_reing AND ordem = 1);
      DECLARE @id_fase_2 INT = (SELECT id_fase FROM vagas.fase WHERE id_via_acesso = @id_via_reing AND ordem = 2);
      DECLARE @id_fase_3 INT = (SELECT id_fase FROM vagas.fase WHERE id_via_acesso = @id_via_reing AND ordem = 3);
      DECLARE @id_fase_4 INT = (SELECT id_fase FROM vagas.fase WHERE id_via_acesso = @id_via_reing AND ordem = 4);

      IF @id_fase_1 IS NULL OR @id_fase_2 IS NULL OR @id_fase_3 IS NULL OR @id_fase_4 IS NULL
      BEGIN
        THROW 50002, 'Faltam fases para REING (ordens 1..4). Corre o bd.sql com a insercao das fases.', 1;
      END

      -- REING (id_fase = NULL) => vagas/candidatos
      IF EXISTS (
        SELECT 1 FROM vagas.estatistica_acesso
        WHERE id_curso_oferta = @id_curso_oferta
          AND id_via_acesso = @id_via_reing
          AND id_fase IS NULL
          AND ano = @ano
      )
      BEGIN
        UPDATE vagas.estatistica_acesso
        SET vagas = ${reingV},
            candidatos = ${reingC},
            candidatos_primeira_op = NULL,
            colocados = NULL,
            matriculados = NULL,
            classificacao_ultimo = NULL,
            media_entrada = NULL
        WHERE id_curso_oferta = @id_curso_oferta
          AND id_via_acesso = @id_via_reing
          AND id_fase IS NULL
          AND ano = @ano;
      END
      ELSE
      BEGIN
        INSERT INTO vagas.estatistica_acesso
          (id_curso_oferta, id_via_acesso, id_fase, ano, vagas, candidatos, candidatos_primeira_op, colocados, matriculados, classificacao_ultimo, media_entrada)
        VALUES
          (@id_curso_oferta, @id_via_reing, NULL, @ano, ${reingV}, ${reingC}, NULL, NULL, NULL, NULL, NULL);
      END

      -- REING ano 1..4 (id_fase = fase por ano) => colocados/matriculados
      DELETE FROM vagas.estatistica_acesso
      WHERE id_curso_oferta = @id_curso_oferta
        AND id_via_acesso = @id_via_reing
        AND id_fase = @id_fase_1
        AND ano = @ano;
      INSERT INTO vagas.estatistica_acesso
        (id_curso_oferta, id_via_acesso, id_fase, ano, vagas, candidatos, candidatos_primeira_op, colocados, matriculados, classificacao_ultimo, media_entrada)
      VALUES
        (@id_curso_oferta, @id_via_reing, @id_fase_1, @ano, NULL, NULL, NULL, ${reing1}, ${reing1}, NULL, NULL);

      DELETE FROM vagas.estatistica_acesso
      WHERE id_curso_oferta = @id_curso_oferta
        AND id_via_acesso = @id_via_reing
        AND id_fase = @id_fase_2
        AND ano = @ano;
      INSERT INTO vagas.estatistica_acesso
        (id_curso_oferta, id_via_acesso, id_fase, ano, vagas, candidatos, candidatos_primeira_op, colocados, matriculados, classificacao_ultimo, media_entrada)
      VALUES
        (@id_curso_oferta, @id_via_reing, @id_fase_2, @ano, NULL, NULL, NULL, ${reing2}, ${reing2}, NULL, NULL);

      DELETE FROM vagas.estatistica_acesso
      WHERE id_curso_oferta = @id_curso_oferta
        AND id_via_acesso = @id_via_reing
        AND id_fase = @id_fase_3
        AND ano = @ano;
      INSERT INTO vagas.estatistica_acesso
        (id_curso_oferta, id_via_acesso, id_fase, ano, vagas, candidatos, candidatos_primeira_op, colocados, matriculados, classificacao_ultimo, media_entrada)
      VALUES
        (@id_curso_oferta, @id_via_reing, @id_fase_3, @ano, NULL, NULL, NULL, ${reing3}, ${reing3}, NULL, NULL);

      DELETE FROM vagas.estatistica_acesso
      WHERE id_curso_oferta = @id_curso_oferta
        AND id_via_acesso = @id_via_reing
        AND id_fase = @id_fase_4
        AND ano = @ano;
      INSERT INTO vagas.estatistica_acesso
        (id_curso_oferta, id_via_acesso, id_fase, ano, vagas, candidatos, candidatos_primeira_op, colocados, matriculados, classificacao_ultimo, media_entrada)
      VALUES
        (@id_curso_oferta, @id_via_reing, @id_fase_4, @ano, NULL, NULL, NULL, ${reing4}, ${reing4}, NULL, NULL);

      -- MUD_PAR (id_fase = NULL) => vagas/candidatos/colocados+matriculados
      DELETE FROM vagas.estatistica_acesso
      WHERE id_curso_oferta = @id_curso_oferta
        AND id_via_acesso = @id_via_mud
        AND id_fase IS NULL
        AND ano = @ano;
      INSERT INTO vagas.estatistica_acesso
        (id_curso_oferta, id_via_acesso, id_fase, ano, vagas, candidatos, candidatos_primeira_op, colocados, matriculados, classificacao_ultimo, media_entrada)
      VALUES
        (@id_curso_oferta, @id_via_mud, NULL, @ano, ${mudV}, ${mudC}, NULL, ${mudCM}, ${mudCM}, NULL, NULL);
    `);

    return { ok: true };
  }

  async listarResumoTabela() {
    // Para já usamos diretamente a view agregada definida em bd.sql:
    // vagas.vw_resumo_cna_por_curso
    const rows: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT
         cna.id_curso_oferta,
         cna.ano_letivo_inicio,
         cna.ano_letivo_fim,
         cna.ano_colocacao,
         cna.id_curso,
         cna.nome_curso,
         cna.codigo_dges,
         cna.id_escola,
         cna.codigo_escola,
         cna.nome_escola,
         cna.vagas_1f,
         cna.candidatos_1f,
         cna.candidatos_1op_1f,
         cna.colocados_1f,
         cna.matriculados_1f,
         cna.classificacao_ultimo_1f,
         cna.media_entrada_1f,
         cna.vagas_2f,
         cna.candidatos_2f,
         cna.candidatos_1op_2f,
         cna.colocados_2f,
         cna.matriculados_2f,
         cna.classificacao_ultimo_2f,
         cna.vagas_3f,
         cna.candidatos_3f,
         cna.candidatos_1op_3f,
         cna.colocados_3f,
         cna.matriculados_3f,
         cna.classificacao_ultimo_3f,
         cna.total_candidatos_cna,
         cna.total_colocados_cna,
         cna.total_matriculados_cna,
         COALESCE(dfo.diff_vagas_mat_antes_3f, cna.diferenca_vagas_mat_antes_3f) AS diferenca_vagas_mat_antes_3f,
         COALESCE(ipvc.perc_ocupacao_cna, cna.perc_ocupacao_cna) AS perc_ocupacao_cna,
         cna.matriculados_1ano,
         cna.matriculados_2ano,
         cna.matriculados_3ano,
         cna.matriculados_4ano,
         cna.total_matriculados_curso,

         COALESCE(sob.sobras_pos_3f, 0) AS sobras_pos_3f,

         -- Concursos Especiais (ESP) - via f.ordem (1..5)
         COALESCE(esp.over23Vagas, 0) AS over23Vagas,
         COALESCE(esp.over23Candidatos, 0) AS over23Candidatos,
         COALESCE(esp.over23Colocados, 0) AS over23Colocados,
         COALESCE(esp.over23Matriculados, 0) AS over23Matriculados,

         COALESCE(esp.cetVagas, 0) AS cetVagas,
         COALESCE(esp.cetCandidatos, 0) AS cetCandidatos,
         COALESCE(esp.cetColocados, 0) AS cetColocados,
         COALESCE(esp.cetMatriculados, 0) AS cetMatriculados,

         COALESCE(esp.ctespVagas, 0) AS ctespVagas,
         COALESCE(esp.ctespCandidatos, 0) AS ctespCandidatos,
         COALESCE(esp.ctespColocados, 0) AS ctespColocados,
         COALESCE(esp.ctespMatriculados, 0) AS ctespMatriculados,

         COALESCE(esp.otherHigherVagas, 0) AS otherHigherVagas,
         COALESCE(esp.otherHigherCandidatos, 0) AS otherHigherCandidatos,
         COALESCE(esp.otherHigherColocados, 0) AS otherHigherColocados,
         COALESCE(esp.otherHigherMatriculados, 0) AS otherHigherMatriculados,

         COALESCE(esp.dualCertVagas, 0) AS dualCertVagas,
         COALESCE(esp.dualCertCandidatos, 0) AS dualCertCandidatos,
         COALESCE(esp.dualCertColocados, 0) AS dualCertColocados,
         COALESCE(esp.dualCertMatriculados, 0) AS dualCertMatriculados,

         -- Regimes Esp + Internacionais (REG_ESP / INT)
         COALESCE(regint.regimesEspVagas, 0) AS regimesEspVagas,
         COALESCE(regint.regimesEspCandidatos, 0) AS regimesEspCandidatos,
         COALESCE(regint.regimesEspMatriculados, 0) AS regimesEspMatriculados,

         COALESCE(regint.internationalVagas, 0) AS internationalVagas,
         COALESCE(regint.internationalCandidatos, 0) AS internationalCandidatos,
         COALESCE(regint.internationalMatriculados, 0) AS internationalMatriculados,

         -- Reingresso (REING + fases 1..4)
         COALESCE(reing.reingressoVagas, 0) AS reingressoVagas,
         COALESCE(reing.reingressoCandidatos, 0) AS reingressoCandidatos,
         COALESCE(reing.reingressoAno1, 0) AS reingressoAno1,
         COALESCE(reing.reingressoAno2, 0) AS reingressoAno2,
         COALESCE(reing.reingressoAno3, 0) AS reingressoAno3,
         COALESCE(reing.reingressoAno4, 0) AS reingressoAno4,

         -- Mudança par (MUD_PAR, id_fase=NULL)
         COALESCE(mud.mudancaVagas, 0) AS mudancaVagas,
         COALESCE(mud.mudancaCandidatos, 0) AS mudancaCandidatos,
         COALESCE(mud.mudancaColocadosMatriculados, 0) AS mudancaColocadosMatriculados

       FROM vagas.vw_relatorio_principal_curso cna
       LEFT JOIN vagas.sobras_pos_3f sob
              ON sob.id_curso_oferta = cna.id_curso_oferta
             AND sob.ano = cna.ano_colocacao
      LEFT JOIN vagas.diff_vagas_mat_antes_3f_override dfo
             ON dfo.id_curso_oferta = cna.id_curso_oferta
            AND dfo.ano = cna.ano_colocacao
      LEFT JOIN vagas.perc_ocupacao_cna_override ipvc
             ON ipvc.id_curso_oferta = cna.id_curso_oferta
            AND ipvc.ano = cna.ano_colocacao

       LEFT JOIN (
         SELECT
           ea.id_curso_oferta,
           ea.ano AS ano_colocacao,
           SUM(CASE WHEN f.ordem = 1 THEN COALESCE(ea.vagas, 0) ELSE 0 END) AS over23Vagas,
           SUM(CASE WHEN f.ordem = 1 THEN COALESCE(ea.candidatos, 0) ELSE 0 END) AS over23Candidatos,
           SUM(CASE WHEN f.ordem = 1 THEN COALESCE(ea.colocados, 0) ELSE 0 END) AS over23Colocados,
           SUM(CASE WHEN f.ordem = 1 THEN COALESCE(ea.matriculados, 0) ELSE 0 END) AS over23Matriculados,

           SUM(CASE WHEN f.ordem = 2 THEN COALESCE(ea.vagas, 0) ELSE 0 END) AS cetVagas,
           SUM(CASE WHEN f.ordem = 2 THEN COALESCE(ea.candidatos, 0) ELSE 0 END) AS cetCandidatos,
           SUM(CASE WHEN f.ordem = 2 THEN COALESCE(ea.colocados, 0) ELSE 0 END) AS cetColocados,
           SUM(CASE WHEN f.ordem = 2 THEN COALESCE(ea.matriculados, 0) ELSE 0 END) AS cetMatriculados,

           SUM(CASE WHEN f.ordem = 3 THEN COALESCE(ea.vagas, 0) ELSE 0 END) AS ctespVagas,
           SUM(CASE WHEN f.ordem = 3 THEN COALESCE(ea.candidatos, 0) ELSE 0 END) AS ctespCandidatos,
           SUM(CASE WHEN f.ordem = 3 THEN COALESCE(ea.colocados, 0) ELSE 0 END) AS ctespColocados,
           SUM(CASE WHEN f.ordem = 3 THEN COALESCE(ea.matriculados, 0) ELSE 0 END) AS ctespMatriculados,

           SUM(CASE WHEN f.ordem = 4 THEN COALESCE(ea.vagas, 0) ELSE 0 END) AS otherHigherVagas,
           SUM(CASE WHEN f.ordem = 4 THEN COALESCE(ea.candidatos, 0) ELSE 0 END) AS otherHigherCandidatos,
           SUM(CASE WHEN f.ordem = 4 THEN COALESCE(ea.colocados, 0) ELSE 0 END) AS otherHigherColocados,
           SUM(CASE WHEN f.ordem = 4 THEN COALESCE(ea.matriculados, 0) ELSE 0 END) AS otherHigherMatriculados,

           SUM(CASE WHEN f.ordem = 5 THEN COALESCE(ea.vagas, 0) ELSE 0 END) AS dualCertVagas,
           SUM(CASE WHEN f.ordem = 5 THEN COALESCE(ea.candidatos, 0) ELSE 0 END) AS dualCertCandidatos,
           SUM(CASE WHEN f.ordem = 5 THEN COALESCE(ea.colocados, 0) ELSE 0 END) AS dualCertColocados,
           SUM(CASE WHEN f.ordem = 5 THEN COALESCE(ea.matriculados, 0) ELSE 0 END) AS dualCertMatriculados
         FROM vagas.estatistica_acesso ea
         JOIN vagas.via_acesso va ON va.id_via_acesso = ea.id_via_acesso
         LEFT JOIN vagas.fase f ON f.id_fase = ea.id_fase
         WHERE va.codigo = 'ESP'
         GROUP BY ea.id_curso_oferta, ea.ano
       ) esp
              ON esp.id_curso_oferta = cna.id_curso_oferta
             AND esp.ano_colocacao = cna.ano_colocacao

       LEFT JOIN (
         SELECT
           ea.id_curso_oferta,
           ea.ano AS ano_colocacao,
           SUM(CASE WHEN va.codigo = 'REG_ESP' THEN COALESCE(ea.vagas, 0) ELSE 0 END) AS regimesEspVagas,
           SUM(CASE WHEN va.codigo = 'REG_ESP' THEN COALESCE(ea.candidatos, 0) ELSE 0 END) AS regimesEspCandidatos,
           SUM(CASE WHEN va.codigo = 'REG_ESP' THEN COALESCE(ea.matriculados, 0) ELSE 0 END) AS regimesEspMatriculados,

           SUM(CASE WHEN va.codigo = 'INT' THEN COALESCE(ea.vagas, 0) ELSE 0 END) AS internationalVagas,
           SUM(CASE WHEN va.codigo = 'INT' THEN COALESCE(ea.candidatos, 0) ELSE 0 END) AS internationalCandidatos,
           SUM(CASE WHEN va.codigo = 'INT' THEN COALESCE(ea.matriculados, 0) ELSE 0 END) AS internationalMatriculados
         FROM vagas.estatistica_acesso ea
         JOIN vagas.via_acesso va ON va.id_via_acesso = ea.id_via_acesso
         WHERE va.codigo IN ('REG_ESP', 'INT')
         GROUP BY ea.id_curso_oferta, ea.ano
       ) regint
              ON regint.id_curso_oferta = cna.id_curso_oferta
             AND regint.ano_colocacao = cna.ano_colocacao

       LEFT JOIN (
         SELECT
           ea.id_curso_oferta,
           ea.ano AS ano_colocacao,
           MAX(CASE WHEN ea.id_fase IS NULL THEN COALESCE(ea.vagas, 0) ELSE 0 END) AS reingressoVagas,
           MAX(CASE WHEN ea.id_fase IS NULL THEN COALESCE(ea.candidatos, 0) ELSE 0 END) AS reingressoCandidatos,

           SUM(CASE WHEN f.ordem = 1 THEN COALESCE(ea.matriculados, 0) ELSE 0 END) AS reingressoAno1,
           SUM(CASE WHEN f.ordem = 2 THEN COALESCE(ea.matriculados, 0) ELSE 0 END) AS reingressoAno2,
           SUM(CASE WHEN f.ordem = 3 THEN COALESCE(ea.matriculados, 0) ELSE 0 END) AS reingressoAno3,
           SUM(CASE WHEN f.ordem = 4 THEN COALESCE(ea.matriculados, 0) ELSE 0 END) AS reingressoAno4
         FROM vagas.estatistica_acesso ea
         JOIN vagas.via_acesso va ON va.id_via_acesso = ea.id_via_acesso
         LEFT JOIN vagas.fase f ON f.id_fase = ea.id_fase
         WHERE va.codigo = 'REING'
         GROUP BY ea.id_curso_oferta, ea.ano
       ) reing
              ON reing.id_curso_oferta = cna.id_curso_oferta
             AND reing.ano_colocacao = cna.ano_colocacao

       LEFT JOIN (
         SELECT
           ea.id_curso_oferta,
           ea.ano AS ano_colocacao,
           MAX(CASE WHEN ea.id_fase IS NULL THEN COALESCE(ea.vagas, 0) ELSE 0 END) AS mudancaVagas,
           MAX(CASE WHEN ea.id_fase IS NULL THEN COALESCE(ea.candidatos, 0) ELSE 0 END) AS mudancaCandidatos,
           MAX(CASE WHEN ea.id_fase IS NULL THEN COALESCE(ea.matriculados, 0) ELSE 0 END) AS mudancaColocadosMatriculados
         FROM vagas.estatistica_acesso ea
         JOIN vagas.via_acesso va ON va.id_via_acesso = ea.id_via_acesso
         WHERE va.codigo = 'MUD_PAR'
         GROUP BY ea.id_curso_oferta, ea.ano
       ) mud
              ON mud.id_curso_oferta = cna.id_curso_oferta
             AND mud.ano_colocacao = cna.ano_colocacao

       ORDER BY cna.ano_letivo_inicio DESC, cna.nome_escola, cna.nome_curso`
    );

    // Mapear para estrutura tipo CourseData do mockup
    const mapped = rows.map((row) => {
      const vagasTotal = (row.vagas_1f || 0) + (row.vagas_2f || 0) + (row.vagas_3f || 0);
      const matricTotal = row.total_matriculados_cna || 0;

      const totalColocadosConcursos =
        (row.over23Colocados ?? 0) +
        (row.cetColocados ?? 0) +
        (row.ctespColocados ?? 0) +
        (row.otherHigherColocados ?? 0) +
        (row.dualCertColocados ?? 0);

      const totalMatriculadosConcursos =
        (row.over23Matriculados ?? 0) +
        (row.cetMatriculados ?? 0) +
        (row.ctespMatriculados ?? 0) +
        (row.otherHigherMatriculados ?? 0) +
        (row.dualCertMatriculados ?? 0);

      const totalMatriculados =
        totalMatriculadosConcursos + (row.regimesEspMatriculados ?? 0) + (row.internationalMatriculados ?? 0);

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

        // Concursos Especiais
        over23Vagas: row.over23Vagas ?? 0,
        over23Candidatos: row.over23Candidatos ?? 0,
        over23Colocados: row.over23Colocados ?? 0,
        over23Matriculados: row.over23Matriculados ?? 0,

        cetVagas: row.cetVagas ?? 0,
        cetCandidatos: row.cetCandidatos ?? 0,
        cetColocados: row.cetColocados ?? 0,
        cetMatriculados: row.cetMatriculados ?? 0,

        ctespVagas: row.ctespVagas ?? 0,
        ctespCandidatos: row.ctespCandidatos ?? 0,
        ctespColocados: row.ctespColocados ?? 0,
        ctespMatriculados: row.ctespMatriculados ?? 0,

        otherHigherVagas: row.otherHigherVagas ?? 0,
        otherHigherCandidatos: row.otherHigherCandidatos ?? 0,
        otherHigherColocados: row.otherHigherColocados ?? 0,
        otherHigherMatriculados: row.otherHigherMatriculados ?? 0,

        dualCertVagas: row.dualCertVagas ?? 0,
        dualCertCandidatos: row.dualCertCandidatos ?? 0,
        dualCertColocados: row.dualCertColocados ?? 0,
        dualCertMatriculados: row.dualCertMatriculados ?? 0,

        // Regimes Esp + Internacionais
        regimesEspVagas: row.regimesEspVagas ?? 0,
        regimesEspCandidatos: row.regimesEspCandidatos ?? 0,
        regimesEspMatriculados: row.regimesEspMatriculados ?? 0,

        internationalVagas: row.internationalVagas ?? 0,
        internationalCandidatos: row.internationalCandidatos ?? 0,
        internationalMatriculados: row.internationalMatriculados ?? 0,

        // Totals – baseados na view CNA
        totalCandidatosCna: row.total_candidatos_cna || 0,
        totalColocados: totalColocadosConcursos,
        totalMatriculados: totalMatriculados,
        pedidosAnulacao: 0,
        totalAvailableVacancies: vagasTotal,
        diffVacanciesEnrolled: vagasTotal - matricTotal,

        // Diferença vagas/matriculados antes da 3.ª fase (campo de fórmula da view)
        diffVagasMatAntes3F: row.diferenca_vagas_mat_antes_3f || 0,
        // Ocupação CNA (matriculados / vagas), vindo da view
        percOcupacaoCna: row.perc_ocupacao_cna || 0,
        transfCnaOutrasIESup: 0,
        transfCnaIpvc: 0,
        sobrasPos3F: row.sobras_pos_3f || 0,

        // Reingresso + Mudança
        reingressoVagas: row.reingressoVagas ?? 0,
        reingressoCandidatos: row.reingressoCandidatos ?? 0,
        reingressoAno1: row.reingressoAno1 ?? 0,
        reingressoAno2: row.reingressoAno2 ?? 0,
        reingressoAno3: row.reingressoAno3 ?? 0,
        reingressoAno4: row.reingressoAno4 ?? 0,
        reingressoTotal1Ano: row.reingressoAno1 ?? 0,

        mudancaVagas: row.mudancaVagas ?? 0,
        mudancaCandidatos: row.mudancaCandidatos ?? 0,
        mudancaColocadosMatriculados: row.mudancaColocadosMatriculados ?? 0,

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

