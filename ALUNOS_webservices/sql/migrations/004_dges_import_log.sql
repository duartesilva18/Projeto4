-- Histórico de importações DGES (auditoria)
IF NOT EXISTS (
  SELECT 1 FROM sys.tables t
  JOIN sys.schemas s ON t.schema_id = s.schema_id
  WHERE s.name = 'vagas' AND t.name = 'dges_import_log'
)
BEGIN
  CREATE TABLE vagas.dges_import_log (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    preview_id UNIQUEIDENTIFIER NULL,
    user_id NVARCHAR(64) NULL,
    ano_inicio INT NOT NULL,
    ficheiros NVARCHAR(MAX) NOT NULL,
    updated_fields INT NOT NULL,
    updated_courses INT NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
  CREATE INDEX idx_dges_import_log_ano ON vagas.dges_import_log (ano_inicio, created_at DESC);
END;
GO
