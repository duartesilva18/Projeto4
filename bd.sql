-- =========================================================
--  ESQUEMA
-- =========================================================
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'vagas')
    EXEC('CREATE SCHEMA vagas');
GO

-- =========================================================
--  TABELAS DE REFERÊNCIA
-- =========================================================

CREATE TABLE vagas.escola (
    id_escola      INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    codigo_escola  VARCHAR(10) NOT NULL,   -- ex: 3162, 3161, 3163, ...
    nome_escola    VARCHAR(150) NOT NULL,  -- ex: 'ESE', 'ESA', 'ESTG', ...
    CONSTRAINT uq_escola_codigo UNIQUE (codigo_escola)
);
GO

CREATE TABLE vagas.curso (
    id_curso       INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_escola      INT NOT NULL FOREIGN KEY REFERENCES vagas.escola(id_escola),
    codigo_dges    VARCHAR(10),            -- ex: 9853, 9723, L122, ...
    nome_curso     VARCHAR(200) NOT NULL,  -- ex: 'Educação Básica'
    regime         VARCHAR(30),            -- ex: 'Diurno', 'Nocturno', 'Pós-Laboral'
    CONSTRAINT uq_curso_dges UNIQUE (codigo_dges, id_escola)
);
GO

CREATE TABLE vagas.ano_letivo (
    id_ano_letivo  INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ano_inicio     SMALLINT NOT NULL,      -- 2024
    ano_fim        SMALLINT NOT NULL,      -- 2025
    CONSTRAINT uq_ano_letivo UNIQUE (ano_inicio, ano_fim)
);
GO

CREATE TABLE vagas.curso_oferta (
    id_curso_oferta INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_curso        INT NOT NULL FOREIGN KEY REFERENCES vagas.curso(id_curso),
    id_ano_letivo   INT NOT NULL FOREIGN KEY REFERENCES vagas.ano_letivo(id_ano_letivo),
    regime_oferta   VARCHAR(30) NOT NULL,  -- se houver variantes (diurno / pós-laboral) no mesmo ano
    CONSTRAINT uq_curso_oferta UNIQUE (id_curso, id_ano_letivo, regime_oferta)
);
GO

-- =========================================================
--  VIAS DE ACESSO E FASES
-- =========================================================

CREATE TABLE vagas.via_acesso (
    id_via_acesso  INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    codigo         VARCHAR(20) NOT NULL,   -- 'CNA', 'REING', 'MUD_PAR', 'ESP', 'REG_ESP', 'INT'
    descricao      VARCHAR(150) NOT NULL,
    CONSTRAINT uq_via_acesso_codigo UNIQUE (codigo)
);
GO

CREATE TABLE vagas.fase (
    id_fase        INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_via_acesso  INT NOT NULL FOREIGN KEY REFERENCES vagas.via_acesso(id_via_acesso),
    ordem          SMALLINT NOT NULL,      -- 1, 2, 3 (ou 1 para vias sem fases)
    nome           VARCHAR(30) NOT NULL,   -- '1ª fase', '2ª fase', '3ª fase'
    CONSTRAINT uq_fase_via_ordem UNIQUE (id_via_acesso, ordem)
);
GO

-- =========================================================
--  TABELA PRINCIPAL DE ESTATÍSTICAS DE ACESSO
--  (apenas dados “brutos” / atómicos)
-- =========================================================

CREATE TABLE vagas.estatistica_acesso (
    id_estatistica          INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_curso_oferta         INT NOT NULL FOREIGN KEY REFERENCES vagas.curso_oferta(id_curso_oferta),
    id_via_acesso           INT NOT NULL FOREIGN KEY REFERENCES vagas.via_acesso(id_via_acesso),
    id_fase                 INT NULL FOREIGN KEY REFERENCES vagas.fase(id_fase),
    ano                     SMALLINT NOT NULL,  -- ano civil da colocação (ex: 2024)

    -- DADOS ATÓMICOS (correspondem grosso modo às colunas básicas do Excel):
    vagas                   INT NULL,
    candidatos              INT NULL,
    candidatos_primeira_op  INT NULL,   -- "Candidatos 1ª opção"
    colocados               INT NULL,
    matriculados            INT NULL,
    classificacao_ultimo    NUMERIC(5,2) NULL,
    media_entrada           NUMERIC(5,2) NULL,

    CONSTRAINT uq_estatistica UNIQUE (id_curso_oferta, id_via_acesso, id_fase, ano)
);
GO

-- Índices úteis
CREATE INDEX idx_estatistica_cursooferta ON vagas.estatistica_acesso (id_curso_oferta);
CREATE INDEX idx_estatistica_via_fase    ON vagas.estatistica_acesso (id_via_acesso, id_fase);
CREATE INDEX idx_estatistica_ano         ON vagas.estatistica_acesso (ano);
GO

-- =========================================================
--  MATRÍCULAS POR ANO DE CURSO
--  (para suportar as colunas 1ºano, 2ºano, 3ºano, 4ºano, TOTAL)
-- =========================================================

CREATE TABLE vagas.matriculas_ano (
    id_matriculas_ano   INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_curso_oferta     INT NOT NULL FOREIGN KEY REFERENCES vagas.curso_oferta(id_curso_oferta),
    ano                 SMALLINT NOT NULL,    -- ano civil de referência
    ano_curso           SMALLINT NOT NULL,    -- 1, 2, 3, 4
    total_matriculados  INT NOT NULL,

    CONSTRAINT ck_matriculas_ano_curso CHECK (ano_curso BETWEEN 1 AND 4),
    CONSTRAINT uq_matriculas_ano UNIQUE (id_curso_oferta, ano, ano_curso)
);
GO

-- =========================================================
--  MOVIMENTOS CNA (TRANSFERÊNCIAS, ETC.)
--  (linha com "Transf CNA p outras IESup", "Transf CNA p o IPVC", etc.)
-- =========================================================

CREATE TABLE vagas.movimento_cna (
    id_movimento       INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_curso_oferta    INT NOT NULL FOREIGN KEY REFERENCES vagas.curso_oferta(id_curso_oferta),
    ano                SMALLINT NOT NULL,
    tipo_movimento     VARCHAR(40) NOT NULL,   -- 'TRANSF_OUT', 'TRANSF_IN_IPVC', etc.
    quantidade         INT NOT NULL,

    CONSTRAINT uq_movimento_cna UNIQUE (id_curso_oferta, ano, tipo_movimento)
);
GO

-- Índices adicionais
CREATE INDEX idx_curso_nome ON vagas.curso (nome_curso);
CREATE INDEX idx_curso_oferta_ano ON vagas.curso_oferta (id_ano_letivo);
CREATE INDEX idx_estatistica_curso_via_ano
    ON vagas.estatistica_acesso (id_curso_oferta, id_via_acesso, id_fase, ano);
CREATE INDEX idx_matriculas_curso_ano
    ON vagas.matriculas_ano (id_curso_oferta, ano);
CREATE INDEX idx_movimento_cna_curso_ano
    ON vagas.movimento_cna (id_curso_oferta, ano, tipo_movimento);
GO

-- =========================================================
--  SOBRAS PÓS 3.ª FASE (inseridas manualmente)
-- =========================================================
IF OBJECT_ID('vagas.sobras_pos_3f', 'U') IS NULL
BEGIN
    CREATE TABLE vagas.sobras_pos_3f (
        id_sobras_pos_3f INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        id_curso_oferta   INT NOT NULL FOREIGN KEY REFERENCES vagas.curso_oferta(id_curso_oferta),
        ano               SMALLINT NOT NULL, -- deve corresponder a `cna.ano_colocacao` (ea.ano)
        sobras_pos_3f     INT NOT NULL DEFAULT (0),

        CONSTRAINT uq_sobras_pos_3f UNIQUE (id_curso_oferta, ano)
    );
    CREATE INDEX idx_sobras_pos_3f_curso_ano
        ON vagas.sobras_pos_3f (id_curso_oferta, ano);
END
GO

-- =========================================================
--  DIFERENÇA VAGAS/MAT ANTES 3.ª FASE (override manual)
--  Permite editar o valor que antes vinha da fórmula/view
-- =========================================================
IF OBJECT_ID('vagas.diff_vagas_mat_antes_3f_override', 'U') IS NULL
BEGIN
    CREATE TABLE vagas.diff_vagas_mat_antes_3f_override (
        id_diff_override INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        id_curso_oferta  INT NOT NULL FOREIGN KEY REFERENCES vagas.curso_oferta(id_curso_oferta),
        ano               SMALLINT NOT NULL, -- deve corresponder a `cna.ano_colocacao`
        diff_vagas_mat_antes_3f INT NOT NULL DEFAULT (0),

        CONSTRAINT uq_diff_vagas_mat_antes_3f_override UNIQUE (id_curso_oferta, ano)
    );

    CREATE INDEX idx_diff_vagas_mat_antes_3f_override
        ON vagas.diff_vagas_mat_antes_3f_override (id_curso_oferta, ano);
END
GO

-- =========================================================
--  TRANSF CNA PARA IPVC (override manual)
--  Permite editar o campo que no Excel vinha como fórmula
--  (a view usa COALESCE para preferir este override).
-- =========================================================
IF OBJECT_ID('vagas.perc_ocupacao_cna_override', 'U') IS NULL
BEGIN
    CREATE TABLE vagas.perc_ocupacao_cna_override (
        id_perc_override INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        id_curso_oferta  INT NOT NULL FOREIGN KEY REFERENCES vagas.curso_oferta(id_curso_oferta),
        ano               SMALLINT NOT NULL, -- deve corresponder a `cna.ano_colocacao`
        perc_ocupacao_cna DECIMAL(10,2) NOT NULL DEFAULT (0),

        CONSTRAINT uq_perc_ocupacao_cna_override UNIQUE (id_curso_oferta, ano)
    );

    CREATE INDEX idx_perc_ocupacao_cna_override
        ON vagas.perc_ocupacao_cna_override (id_curso_oferta, ano);
END
GO

-- =========================================================
--  DADOS INICIAIS PARA VIA_ACESSO E FASE
-- =========================================================

-- Inserir vias de acesso (idempotente)
IF NOT EXISTS (SELECT 1 FROM vagas.via_acesso WHERE codigo = 'CNA')
    INSERT INTO vagas.via_acesso (codigo, descricao)
    VALUES ('CNA', 'Concurso Nacional de Acesso');
IF NOT EXISTS (SELECT 1 FROM vagas.via_acesso WHERE codigo = 'REING')
    INSERT INTO vagas.via_acesso (codigo, descricao)
    VALUES ('REING', 'Reingresso');
IF NOT EXISTS (SELECT 1 FROM vagas.via_acesso WHERE codigo = 'MUD_PAR')
    INSERT INTO vagas.via_acesso (codigo, descricao)
    VALUES ('MUD_PAR', 'Mudança de par instituição/curso');
IF NOT EXISTS (SELECT 1 FROM vagas.via_acesso WHERE codigo = 'ESP')
    INSERT INTO vagas.via_acesso (codigo, descricao)
    VALUES ('ESP', 'Concursos especiais');
IF NOT EXISTS (SELECT 1 FROM vagas.via_acesso WHERE codigo = 'REG_ESP')
    INSERT INTO vagas.via_acesso (codigo, descricao)
    VALUES ('REG_ESP', 'Regimes especiais');
IF NOT EXISTS (SELECT 1 FROM vagas.via_acesso WHERE codigo = 'INT')
    INSERT INTO vagas.via_acesso (codigo, descricao)
    VALUES ('INT', 'Estudantes internacionais');
GO

-- Fases apenas para CNA (1ª, 2ª, 3ª) – idempotente
INSERT INTO vagas.fase (id_via_acesso, ordem, nome)
SELECT v.id_via_acesso, f.ordem, f.nome
FROM vagas.via_acesso v
CROSS JOIN (VALUES
    (1, '1ª fase'),
    (2, '2ª fase'),
    (3, '3ª fase')
) AS f(ordem, nome)
WHERE v.codigo = 'CNA'
  AND NOT EXISTS (
        SELECT 1
        FROM vagas.fase fa
        WHERE fa.id_via_acesso = v.id_via_acesso
          AND fa.ordem = f.ordem
  );
GO

-- Fases para ESP (Concursos Especiais) – idempotente
-- Mapeamento de ordem (alinhar com o frontend):
-- 1 = >23 anos
-- 2 = CET
-- 3 = CTeSP
-- 4 = Outros sup.
-- 5 = Dupla cert.
INSERT INTO vagas.fase (id_via_acesso, ordem, nome)
SELECT v.id_via_acesso,
       esp.ordem,
       esp.nome
FROM vagas.via_acesso v
CROSS JOIN (VALUES
    (1, '>23 anos'),
    (2, 'CET'),
    (3, 'CTeSP'),
    (4, 'Outros sup.'),
    (5, 'Dupla cert.')
) AS esp(ordem, nome)
WHERE v.codigo = 'ESP'
  AND NOT EXISTS (
        SELECT 1
        FROM vagas.fase fa
        WHERE fa.id_via_acesso = v.id_via_acesso
          AND fa.ordem = esp.ordem
  );
GO

-- Fases para REING (Reingresso) – idempotente
-- 1..4 => 1.º ano .. 4.º ano (ordem usada no frontend)
INSERT INTO vagas.fase (id_via_acesso, ordem, nome)
SELECT v.id_via_acesso,
       reing.ordem,
       reing.nome
FROM vagas.via_acesso v
CROSS JOIN (VALUES
    (1, '1.º ano'),
    (2, '2.º ano'),
    (3, '3.º ano'),
    (4, '4.º ano')
) AS reing(ordem, nome)
WHERE v.codigo = 'REING'
  AND NOT EXISTS (
        SELECT 1
        FROM vagas.fase fa
        WHERE fa.id_via_acesso = v.id_via_acesso
          AND fa.ordem = reing.ordem
  );
GO

-- =========================================================
--  VIEWS COM CAMPOS QUE ERAM FÓRMULAS NO EXCEL
-- =========================================================
-- Nota: Campos marcados com "-- FÓRMULA:" são derivados,
--       não existem fisicamente em nenhuma tabela.
-- =========================================================

-- ---------------------------------------------------------
--  1) RESUMO CNA POR CURSO (1ª, 2ª, 3ª fase + totais)
-- ---------------------------------------------------------
IF OBJECT_ID('vagas.vw_resumo_cna_por_curso', 'V') IS NOT NULL
    DROP VIEW vagas.vw_resumo_cna_por_curso;
GO

CREATE VIEW vagas.vw_resumo_cna_por_curso
AS
SELECT
    co.id_curso_oferta,
    a.ano_inicio AS ano_letivo_inicio,
    a.ano_fim    AS ano_letivo_fim,
    ea.ano       AS ano_colocacao,

    -- Dados de identificação
    c.id_curso,
    c.nome_curso,
    c.codigo_dges,
    e.id_escola,
    e.codigo_escola,
    e.nome_escola,

    -- CNA 1ª fase
    SUM(CASE WHEN f.ordem = 1 THEN ea.vagas        END) AS vagas_1f,
    SUM(CASE WHEN f.ordem = 1 THEN ea.candidatos   END) AS candidatos_1f,
    SUM(CASE WHEN f.ordem = 1 THEN ea.candidatos_primeira_op END) AS candidatos_1op_1f,
    SUM(CASE WHEN f.ordem = 1 THEN ea.colocados    END) AS colocados_1f,
    SUM(CASE WHEN f.ordem = 1 THEN ea.matriculados END) AS matriculados_1f,
    MAX(CASE WHEN f.ordem = 1 THEN ea.classificacao_ultimo END) AS classificacao_ultimo_1f,
    MAX(CASE WHEN f.ordem = 1 THEN ea.media_entrada       END) AS media_entrada_1f,

    -- CNA 2ª fase
    SUM(CASE WHEN f.ordem = 2 THEN ea.vagas        END) AS vagas_2f,
    SUM(CASE WHEN f.ordem = 2 THEN ea.candidatos   END) AS candidatos_2f,
    SUM(CASE WHEN f.ordem = 2 THEN ea.candidatos_primeira_op END) AS candidatos_1op_2f,
    SUM(CASE WHEN f.ordem = 2 THEN ea.colocados    END) AS colocados_2f,
    SUM(CASE WHEN f.ordem = 2 THEN ea.matriculados END) AS matriculados_2f,
    MAX(CASE WHEN f.ordem = 2 THEN ea.classificacao_ultimo END) AS classificacao_ultimo_2f,

    -- CNA 3ª fase
    SUM(CASE WHEN f.ordem = 3 THEN ea.vagas        END) AS vagas_3f,
    SUM(CASE WHEN f.ordem = 3 THEN ea.candidatos   END) AS candidatos_3f,
    SUM(CASE WHEN f.ordem = 3 THEN ea.candidatos_primeira_op END) AS candidatos_1op_3f,
    SUM(CASE WHEN f.ordem = 3 THEN ea.colocados    END) AS colocados_3f,
    SUM(CASE WHEN f.ordem = 3 THEN ea.matriculados END) AS matriculados_3f,
    MAX(CASE WHEN f.ordem = 3 THEN ea.classificacao_ultimo END) AS classificacao_ultimo_3f,

    -- TOTAIS CNA (equivalentes a colunas como "Total Candidatos Total CNA",
    -- "Total Colocados", "Total Matriculados (nas 3 fases CNA)")
    -- FÓRMULA: soma das 3 fases
    SUM(ea.candidatos)   AS total_candidatos_cna,   -- "Total Candidatos Total CNA"
    SUM(ea.colocados)    AS total_colocados_cna,    -- "Total Colocados"
    SUM(ea.matriculados) AS total_matriculados_cna, -- "Total Matriculados (nas 3 fases CNA)"

    -- DIFERENÇA vagas/mat antes 3F
    -- FÓRMULA: (vagas 1F + 2F) - (matriculados 1F + 2F)
    (
        COALESCE(SUM(CASE WHEN f.ordem IN (1,2) THEN ea.vagas        END), 0)
      - COALESCE(SUM(CASE WHEN f.ordem IN (1,2) THEN ea.matriculados END), 0)
    ) AS diferenca_vagas_mat_antes_3f,

    -- Percentagem de ocupação CNA (matriculados / vagas)
    -- FÓRMULA: total_matriculados_cna / total_vagas_cna
    CASE
        WHEN COALESCE(SUM(ea.vagas), 0) > 0
        THEN ROUND(100.0 * SUM(ea.matriculados) / SUM(ea.vagas), 2)
    END AS perc_ocupacao_cna
FROM vagas.estatistica_acesso ea
JOIN vagas.curso_oferta co ON co.id_curso_oferta = ea.id_curso_oferta
JOIN vagas.curso       c  ON c.id_curso         = co.id_curso
JOIN vagas.escola      e  ON e.id_escola        = c.id_escola
JOIN vagas.ano_letivo  a  ON a.id_ano_letivo    = co.id_ano_letivo
JOIN vagas.via_acesso  va ON va.id_via_acesso   = ea.id_via_acesso AND va.codigo = 'CNA'
LEFT JOIN vagas.fase   f  ON f.id_fase          = ea.id_fase
GROUP BY
    co.id_curso_oferta,
    a.ano_inicio, a.ano_fim,
    ea.ano,
    c.id_curso, c.nome_curso, c.codigo_dges,
    e.id_escola, e.codigo_escola, e.nome_escola;
GO

-- ---------------------------------------------------------
--  2) RESUMO DE MATRÍCULAS POR CURSO (1º ao 4º ano)
-- ---------------------------------------------------------
IF OBJECT_ID('vagas.vw_matriculas_por_curso', 'V') IS NOT NULL
    DROP VIEW vagas.vw_matriculas_por_curso;
GO

CREATE VIEW vagas.vw_matriculas_por_curso
AS
SELECT
    co.id_curso_oferta,
    a.ano_inicio AS ano_letivo_inicio,
    a.ano_fim    AS ano_letivo_fim,
    m.ano        AS ano_referencia,

    c.id_curso,
    c.nome_curso,
    c.codigo_dges,
    e.id_escola,
    e.codigo_escola,
    e.nome_escola,

    -- Colunas 1º ano a 4º ano
    SUM(CASE WHEN m.ano_curso = 1 THEN m.total_matriculados END) AS matriculados_1ano,
    SUM(CASE WHEN m.ano_curso = 2 THEN m.total_matriculados END) AS matriculados_2ano,
    SUM(CASE WHEN m.ano_curso = 3 THEN m.total_matriculados END) AS matriculados_3ano,
    SUM(CASE WHEN m.ano_curso = 4 THEN m.total_matriculados END) AS matriculados_4ano,

    -- TOTAL matriculados por curso (coluna "Total matriculados p/ curso")
    -- FÓRMULA: soma dos 4 anos
    COALESCE(SUM(m.total_matriculados), 0) AS total_matriculados_curso
FROM vagas.matriculas_ano m
JOIN vagas.curso_oferta co ON co.id_curso_oferta = m.id_curso_oferta
JOIN vagas.curso       c  ON c.id_curso         = co.id_curso
JOIN vagas.escola      e  ON e.id_escola        = c.id_escola
JOIN vagas.ano_letivo  a  ON a.id_ano_letivo    = co.id_ano_letivo
GROUP BY
    co.id_curso_oferta,
    a.ano_inicio, a.ano_fim,
    m.ano,
    c.id_curso, c.nome_curso, c.codigo_dges,
    e.id_escola, e.codigo_escola, e.nome_escola;
GO

-- ---------------------------------------------------------
--  3) RESUMO GLOBAL POR ESCOLA (equivalente às linhas “TOTAL IPVC, ESE, ESA, …”
--     com percentagens do bloco "Primeira análise")
-- ---------------------------------------------------------
IF OBJECT_ID('vagas.vw_primeira_analise_escola', 'V') IS NOT NULL
    DROP VIEW vagas.vw_primeira_analise_escola;
GO

CREATE VIEW vagas.vw_primeira_analise_escola
AS
SELECT
    e.id_escola,
    e.codigo_escola,
    e.nome_escola,
    a.ano_inicio AS ano_letivo_inicio,
    a.ano_fim    AS ano_letivo_fim,
    ea.ano       AS ano_colocacao,

    -- Totais CNA 1ª fase por escola
    SUM(CASE WHEN va.codigo = 'CNA' AND f.ordem = 1 THEN ea.vagas        END) AS vagas_cna_1f,
    SUM(CASE WHEN va.codigo = 'CNA' AND f.ordem = 1 THEN ea.colocados    END) AS colocados_cna_1f,
    SUM(CASE WHEN va.codigo = 'CNA' AND f.ordem = 1 THEN ea.matriculados END) AS matriculados_cna_1f,

    -- FÓRMULA: percentagem de ocupação na 1ª fase (tipo "Matriculados 1F, %")
    CASE
        WHEN COALESCE(SUM(CASE WHEN va.codigo = 'CNA' AND f.ordem = 1 THEN ea.vagas END), 0) > 0
        THEN ROUND(
            100.0 * COALESCE(SUM(CASE WHEN va.codigo = 'CNA' AND f.ordem = 1 THEN ea.matriculados END), 0)
                   / SUM(CASE WHEN va.codigo = 'CNA' AND f.ordem = 1 THEN ea.vagas END),
            2
        )
    END AS perc_matriculados_cna_1f,

    -- Totais CNA (todas as fases) por escola
    SUM(CASE WHEN va.codigo = 'CNA' THEN ea.vagas        END) AS vagas_cna_total,
    SUM(CASE WHEN va.codigo = 'CNA' THEN ea.colocados    END) AS colocados_cna_total,
    SUM(CASE WHEN va.codigo = 'CNA' THEN ea.matriculados END) AS matriculados_cna_total,

    -- FÓRMULA: percentagem de ocupação CNA total
    CASE
        WHEN COALESCE(SUM(CASE WHEN va.codigo = 'CNA' THEN ea.vagas END), 0) > 0
        THEN ROUND(
            100.0 * COALESCE(SUM(CASE WHEN va.codigo = 'CNA' THEN ea.matriculados END), 0)
                   / SUM(CASE WHEN va.codigo = 'CNA' THEN ea.vagas END),
            2
        )
    END AS perc_matriculados_cna_total

FROM vagas.estatistica_acesso ea
JOIN vagas.curso_oferta co ON co.id_curso_oferta = ea.id_curso_oferta
JOIN vagas.curso       c  ON c.id_curso         = co.id_curso
JOIN vagas.escola      e  ON e.id_escola        = c.id_escola
JOIN vagas.ano_letivo  a  ON a.id_ano_letivo    = co.id_ano_letivo
JOIN vagas.via_acesso  va ON va.id_via_acesso   = ea.id_via_acesso
LEFT JOIN vagas.fase   f  ON f.id_fase          = ea.id_fase
GROUP BY
    e.id_escola, e.codigo_escola, e.nome_escola,
    a.ano_inicio, a.ano_fim,
    ea.ano;
GO

-- ---------------------------------------------------------
--  4) VIEW “FINAL” POR CURSO, JUNTANDO RESUMO CNA E MATRÍCULAS
--     (pode ser ponto de partida para substituir a folha principal)
-- ---------------------------------------------------------
IF OBJECT_ID('vagas.vw_relatorio_principal_curso', 'V') IS NOT NULL
    DROP VIEW vagas.vw_relatorio_principal_curso;
GO

CREATE VIEW vagas.vw_relatorio_principal_curso
AS
SELECT
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

    -- CNA (1ª, 2ª, 3ª fase, totais e diferença)
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

    -- Campos de fórmula do Excel:
    cna.total_candidatos_cna,        -- FÓRMULA (soma candidatos 1F+2F+3F)
    cna.total_colocados_cna,         -- FÓRMULA (soma colocados 1F+2F+3F)
    cna.total_matriculados_cna,      -- FÓRMULA (soma matriculados 1F+2F+3F)
    cna.diferenca_vagas_mat_antes_3f,-- FÓRMULA (vagas1F+2F - matr1F+2F)
    COALESCE(ipvc.perc_ocupacao_cna, cna.perc_ocupacao_cna) AS perc_ocupacao_cna, -- override manual

    -- Matrículas por ano de curso (1º, 2º, 3º, 4º) e total por curso
    mat.matriculados_1ano,
    mat.matriculados_2ano,
    mat.matriculados_3ano,
    mat.matriculados_4ano,
    mat.total_matriculados_curso,    -- FÓRMULA (soma 1º-4º ano)

    -- SOBRAS pós 3.ª fase (manual; não é derivado)
    COALESCE(sob.sobras_pos_3f, 0) AS sobras_pos_3f

FROM vagas.vw_resumo_cna_por_curso cna
LEFT JOIN vagas.vw_matriculas_por_curso mat
       ON mat.id_curso_oferta   = cna.id_curso_oferta
      AND mat.ano_referencia    = cna.ano_colocacao
      AND mat.ano_letivo_inicio = cna.ano_letivo_inicio
      AND mat.ano_letivo_fim    = cna.ano_letivo_fim
LEFT JOIN vagas.sobras_pos_3f sob
       ON sob.id_curso_oferta = cna.id_curso_oferta
      AND sob.ano = cna.ano_colocacao;
LEFT JOIN vagas.perc_ocupacao_cna_override ipvc
       ON ipvc.id_curso_oferta = cna.id_curso_oferta
      AND ipvc.ano = cna.ano_colocacao;
GO