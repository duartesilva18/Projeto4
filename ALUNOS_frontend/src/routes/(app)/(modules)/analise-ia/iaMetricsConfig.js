/** Métricas previstas pela IA — ids alinhados com o backend (ia-metrics.config.ts). */
export const IA_METRICS = [
	{ id: 'colocados', label: 'Colocados', hint: 'CNA + concursos especiais' },
	{ id: 'matriculados', label: 'Matriculados', hint: 'Todas as vias de acesso' },
	{ id: 'candidatos', label: 'Candidatos', hint: 'Candidatos CNA' },
	{ id: 'vagas', label: 'Vagas', hint: 'Vagas disponíveis' }
];

export const IA_METRIC_IDS = IA_METRICS.map((m) => m.id);

/** @param {string} id */
export function metricLabel(id) {
	return IA_METRICS.find((m) => m.id === id)?.label ?? id;
}
