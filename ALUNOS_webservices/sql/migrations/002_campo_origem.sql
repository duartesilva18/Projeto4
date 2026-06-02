-- Origem dos campos importados (DGES statcol)
IF NOT EXISTS (
  SELECT 1 FROM sys.tables t
  JOIN sys.schemas s ON t.schema_id = s.schema_id
  WHERE s.name = 'vagas' AND t.name = 'campo_origem'
)
BEGIN
  CREATE TABLE vagas.campo_origem (
    id_curso_oferta INT NOT NULL,
    ano_colocacao INT NOT NULL,
    chave_campo NVARCHAR(64) NOT NULL,
    origem NVARCHAR(32) NOT NULL DEFAULT 'DGES_STATCOL',
    tipo_documento NVARCHAR(64) NULL,
    ficheiro_nome NVARCHAR(255) NULL,
    importado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_campo_origem PRIMARY KEY (id_curso_oferta, ano_colocacao, chave_campo),
    CONSTRAINT FK_campo_origem_curso_oferta FOREIGN KEY (id_curso_oferta)
      REFERENCES vagas.curso_oferta (id_curso_oferta)
  );
  CREATE INDEX idx_campo_origem_ano ON vagas.campo_origem (ano_colocacao);
END;
GO
