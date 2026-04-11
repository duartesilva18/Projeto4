-- =============================================================================
-- Comparar anos (/comparar-anos)
-- =============================================================================
-- A página usa apenas dados já expostos pelo endpoint existente GET vagas/tabela
-- (mesmo payload que a Proposta de Vagas). Não foi necessária qualquer alteração
-- ao esquema da base de dados (sem novas tabelas, colunas ou índices).
--
-- Não precisa de executar nada neste ficheiro — serve apenas como registo.
-- =============================================================================

-- Exemplo (opcional): se no futuro quiseres filtrar no servidor por ano em vez
-- de enviar toda a tabela ao cliente, poderias acrescentar algo como:
--
--   GET vagas/tabela?anoInicio=2024
--
-- Isso exigiria mudanças no Nest (VagasController/VagasService), não só SQL.

SELECT 1 AS nenhuma_migracao_necessaria;
