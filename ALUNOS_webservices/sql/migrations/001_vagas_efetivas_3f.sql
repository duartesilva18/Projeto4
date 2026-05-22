-- Migração: separar "vagas(5)" de "vagas efetivas (2)" na 3.ª fase CNA
-- Executar uma vez na BD ONIPVC (SQL Server)

IF OBJECT_ID('vagas.vagas_efetivas_3f', 'U') IS NULL
BEGIN
    CREATE TABLE vagas.vagas_efetivas_3f (
        id_vagas_efetivas_3f INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        id_curso_oferta      INT NOT NULL FOREIGN KEY REFERENCES vagas.curso_oferta(id_curso_oferta),
        ano                  SMALLINT NOT NULL,
        vagas_efetivas_3f    INT NOT NULL DEFAULT (0),

        CONSTRAINT uq_vagas_efetivas_3f UNIQUE (id_curso_oferta, ano)
    );
    CREATE INDEX idx_vagas_efetivas_3f_curso_ano
        ON vagas.vagas_efetivas_3f (id_curso_oferta, ano);
END
GO

-- Opcional: pré-preencher com o valor atual de vagas_3f (antes eram duplicados na app)
INSERT INTO vagas.vagas_efetivas_3f (id_curso_oferta, ano, vagas_efetivas_3f)
SELECT cna.id_curso_oferta, cna.ano_colocacao, cna.vagas_3f
FROM vagas.vw_resumo_cna_por_curso cna
WHERE cna.vagas_3f IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM vagas.vagas_efetivas_3f vef
      WHERE vef.id_curso_oferta = cna.id_curso_oferta
        AND vef.ano = cna.ano_colocacao
  );
GO
