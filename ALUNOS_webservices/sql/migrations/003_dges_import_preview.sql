-- Pré-visualizações de importação DGES (persistente, TTL 15 min)
IF NOT EXISTS (
  SELECT 1 FROM sys.tables t
  JOIN sys.schemas s ON t.schema_id = s.schema_id
  WHERE s.name = 'vagas' AND t.name = 'dges_import_preview'
)
BEGIN
  CREATE TABLE vagas.dges_import_preview (
    preview_id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    payload NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    expires_at DATETIME2 NOT NULL
  );
  CREATE INDEX idx_dges_import_preview_expires ON vagas.dges_import_preview (expires_at);
END;
GO
