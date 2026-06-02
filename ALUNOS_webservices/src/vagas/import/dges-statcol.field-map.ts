export type DgesDbColumn = 'vagas' | 'candidatos' | 'colocados' | 'classificacao_ultimo';

export interface DgesFieldDbTarget {
  column: DgesDbColumn;
  phaseOrder: 1 | 2 | 3;
  numericKind: 'int' | 'decimal';
}

/** Whitelist fieldKey → coluna BD + fase CNA */
export const DGES_FIELD_DB_MAP: Record<string, DgesFieldDbTarget> = {
  vagas1F: { column: 'vagas', phaseOrder: 1, numericKind: 'int' },
  candidatos1F: { column: 'candidatos', phaseOrder: 1, numericKind: 'int' },
  colocados1F: { column: 'colocados', phaseOrder: 1, numericKind: 'int' },
  classificacaoUltimo1F: { column: 'classificacao_ultimo', phaseOrder: 1, numericKind: 'decimal' },
  vagas2F: { column: 'vagas', phaseOrder: 2, numericKind: 'int' },
  candidatos2F: { column: 'candidatos', phaseOrder: 2, numericKind: 'int' },
  colocados2F: { column: 'colocados', phaseOrder: 2, numericKind: 'int' },
  classificacaoUltimo2F: { column: 'classificacao_ultimo', phaseOrder: 2, numericKind: 'decimal' },
  vagas3F: { column: 'vagas', phaseOrder: 3, numericKind: 'int' },
  candidatos3F: { column: 'candidatos', phaseOrder: 3, numericKind: 'int' },
  colocados3F: { column: 'colocados', phaseOrder: 3, numericKind: 'int' },
  classificacaoUltimo3F: { column: 'classificacao_ultimo', phaseOrder: 3, numericKind: 'decimal' }
};

export function isAllowedDgesFieldKey(key: string): boolean {
  return key in DGES_FIELD_DB_MAP;
}

/** matriculados espelham colocados importados (campo_origem) */
export const DGES_COLOCADOS_TO_MATRICULADOS: Record<string, string> = {
  colocados1F: 'matriculados1F',
  colocados2F: 'matriculados2F',
  colocados3F: 'matriculados3F'
};

export function derivedMatriculadosFieldKey(colocadosFieldKey: string): string | undefined {
  return DGES_COLOCADOS_TO_MATRICULADOS[colocadosFieldKey];
}

export type DgesPhaseColumnValues = Partial<Record<DgesDbColumn, number>>;

/** Agrupa campos de importação por fase (1/2/3) para UPDATE parcial */
export function groupDgesFieldsByPhase(
  fields: Record<string, number>
): Map<1 | 2 | 3, DgesPhaseColumnValues> {
  const byPhase = new Map<1 | 2 | 3, DgesPhaseColumnValues>();

  for (const [fieldKey, rawValue] of Object.entries(fields)) {
    const target = DGES_FIELD_DB_MAP[fieldKey];
    if (!target) {
      throw new Error(`Campo DGES não suportado: ${fieldKey}`);
    }
    const value =
      target.numericKind === 'int' ? Math.trunc(Number(rawValue)) : Number(rawValue);
    if (!Number.isFinite(value)) {
      throw new Error(`Valor inválido para ${fieldKey}`);
    }

    const phaseValues = byPhase.get(target.phaseOrder) ?? {};
    phaseValues[target.column] = value;
    byPhase.set(target.phaseOrder, phaseValues);
  }

  return byPhase;
}
