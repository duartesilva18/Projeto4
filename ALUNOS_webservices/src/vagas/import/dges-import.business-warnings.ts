import type { DgesFilePreview, DgesImportPreview } from './dges-statcol.types';

const PHASE_FIELDS = [
  { phase: '1.ª fase', vagas: 'vagas1F', candidatos: 'candidatos1F', colocados: 'colocados1F' },
  { phase: '2.ª fase', vagas: 'vagas2F', candidatos: 'candidatos2F', colocados: 'colocados2F' },
  { phase: '3.ª fase', vagas: 'vagas3F', candidatos: 'candidatos3F', colocados: 'colocados3F' }
] as const;

/** Avisos de negócio (não bloqueiam apply) */
export function collectBusinessWarnings(preview: DgesImportPreview): string[] {
  const warnings = new Set<string>();
  for (const file of preview.files) {
    for (const w of collectFileBusinessWarnings(file)) {
      warnings.add(w);
    }
  }
  return [...warnings];
}

export function collectFileBusinessWarnings(file: DgesFilePreview): string[] {
  const warnings: string[] = [];
  for (const match of file.matched) {
    const label = `${match.courseName} (${match.courseCode})`;
    const byKey = new Map(
      match.fields.filter((f) => !f.skipped).map((f) => [f.fieldKey, f])
    );

    for (const phase of PHASE_FIELDS) {
      const vagas = byKey.get(phase.vagas);
      const candidatos = byKey.get(phase.candidatos);
      const colocados = byKey.get(phase.colocados);

      if (vagas && colocados && colocados.newValue > vagas.newValue) {
        warnings.push(
          `${label}: colocados (${colocados.newValue}) > vagas (${vagas.newValue}) na ${phase.phase}.`
        );
      }
      if (candidatos && colocados && candidatos.newValue < colocados.newValue) {
        warnings.push(
          `${label}: candidatos (${candidatos.newValue}) < colocados (${colocados.newValue}) na ${phase.phase}.`
        );
      }
    }

    for (const field of match.fields) {
      if (field.skipped) continue;
      if (field.newValue === 0 && field.currentValue > 0) {
        warnings.push(
          `${label}: ${field.fieldKey} passa de ${field.currentValue} para 0 (verifique se é intencional).`
        );
      }
    }
  }
  return warnings;
}
