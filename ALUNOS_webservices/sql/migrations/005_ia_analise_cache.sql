-- Cache e histórico de relatórios da análise IA.
-- Idempotente: pode correr-se mais do que uma vez.

IF NOT EXISTS (
  SELECT 1 FROM sys.tables t
  JOIN sys.schemas s ON t.schema_id = s.schema_id
  WHERE s.name = 'vagas' AND t.name = 'ia_analise_cache'
)
BEGIN
  CREATE TABLE vagas.ia_analise_cache (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    escola          NVARCHAR(255) NOT NULL,
    curso           NVARCHAR(255) NOT NULL,
    ano_referencia  NVARCHAR(9)   NOT NULL,
    dados_hash      NVARCHAR(64)  NOT NULL,
    relatorio       NVARCHAR(MAX) NOT NULL,
    created_at      DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
  );

  CREATE INDEX IX_ia_analise_cache_lookup
    ON vagas.ia_analise_cache (escola, curso, ano_referencia, dados_hash);
END
