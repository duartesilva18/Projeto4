import { TABLE_TYPES } from '../comparar-anos/compareTableConfig.js';

/** @typedef {{ id: string, label: string }} ViewOption */
/** @typedef {{ groupLabel: string, options: ViewOption[] }} ViewGroup */

/** @type {ViewGroup[]} */
export const DASHBOARD_VIEW_GROUPS = [
	{
		groupLabel: 'Métrica global',
		options: [
			{ id: 'totais', label: 'Totais' },
			{ id: 'vagas', label: 'Vagas' },
			{ id: 'candidatos', label: 'Candidatos' },
			{ id: 'colocados', label: 'Colocados' },
			{ id: 'matriculados', label: 'Matriculados' }
		]
	},
	{
		groupLabel: 'CNA por fase',
		options: [
			{ id: 'cna-1f', label: 'Regime 1.ª fase' },
			{ id: 'cna-2f', label: 'Regime 2.ª fase' },
			{ id: 'cna-3f', label: 'Regime 3.ª fase' }
		]
	},
	{
		groupLabel: 'Outras vias',
		options: [
			{ id: 'concursos', label: 'Concursos especiais' },
			{ id: 'reingresso', label: 'Reingresso + Mudança' },
			{ id: 'regimes-esp-internacionais', label: 'Regimes esp. + Internacionais' }
		]
	}
];

const CNA = TABLE_TYPES.find((t) => t.id === 'regime-nacional')?.fields ?? [];
const CONCURSOS = TABLE_TYPES.find((t) => t.id === 'concursos')?.fields ?? [];
const REINGRESSO = TABLE_TYPES.find((t) => t.id === 'reingresso-mudanca')?.fields ?? [];
const REGIMES = TABLE_TYPES.find((t) => t.id === 'regimes-esp-internacionais')?.fields ?? [];
const TOTAIS = TABLE_TYPES.find((t) => t.id === 'totais')?.fields ?? [];

const ALL_FIELD_KEYS = [
	...CNA.map((f) => f.key),
	...CONCURSOS.map((f) => f.key),
	...REINGRESSO.map((f) => f.key),
	...REGIMES.map((f) => f.key),
	...TOTAIS.map((f) => f.key)
];

/** @param {RegExp} re */
function keysMatching(re) {
	return ALL_FIELD_KEYS.filter((k) => re.test(k));
}

/** @param {string} phaseSuffix e.g. '1F' */
function cnaPhaseKeys(phaseSuffix) {
	return CNA.filter((f) => f.key.endsWith(phaseSuffix)).map((f) => f.key);
}

const VIEW_FIELD_MAP = {
	totais: TOTAIS.map((f) => f.key),
	vagas: keysMatching(/vagas/i),
	candidatos: keysMatching(/candidatos/i),
	colocados: keysMatching(/colocados/i),
	matriculados: keysMatching(/matriculados/i),
	'cna-1f': cnaPhaseKeys('1F'),
	'cna-2f': cnaPhaseKeys('2F'),
	'cna-3f': cnaPhaseKeys('3F'),
	concursos: CONCURSOS.map((f) => f.key),
	reingresso: REINGRESSO.map((f) => f.key),
	'regimes-esp-internacionais': REGIMES.map((f) => f.key)
};

/** @type {Record<string, string>} */
const VIEW_LABELS = Object.fromEntries(
	DASHBOARD_VIEW_GROUPS.flatMap((g) => g.options.map((o) => [o.id, o.label]))
);

/** @param {string} viewId */
export function resolveViewFields(viewId) {
	return VIEW_FIELD_MAP[viewId] ?? TOTAIS.map((f) => f.key);
}

/** @param {string} viewId */
export function getViewLabel(viewId) {
	return VIEW_LABELS[viewId] ?? viewId;
}

/** @param {string} viewId @param {Record<string, unknown>[]} rows */
export function aggregateViewTotal(viewId, rows) {
	const fields = resolveViewFields(viewId);
	let sum = 0;
	for (const row of rows) {
		for (const key of fields) {
			const v = Number(row[key]);
			if (Number.isFinite(v)) sum += v;
		}
	}
	return sum;
}

/** @param {Record<string, unknown>[]} rows */
export function computeDashboardKpis(rows) {
	let totalColocados = 0;
	let totalMatriculados = 0;
	let pedidosAnulacao = 0;
	let totalCandidatosCna = 0;
	let totalAvailableVacancies = 0;
	let totalMatriculadosCna = 0;

	for (const row of rows) {
		totalColocados += Number(row.totalColocados) || 0;
		totalMatriculados += Number(row.totalMatriculados) || 0;
		pedidosAnulacao += Number(row.pedidosAnulacao) || 0;
		totalCandidatosCna += Number(row.totalCandidatosCna) || 0;
		totalAvailableVacancies += Number(row.totalAvailableVacancies) || 0;
		totalMatriculadosCna += Number(row.totalMatriculadosCna) || 0;
	}

	const percOcupacaoCna =
		totalAvailableVacancies > 0
			? (totalMatriculadosCna / totalAvailableVacancies) * 100
			: 0;

	const percMatriculaCna =
		totalCandidatosCna > 0 ? (totalMatriculadosCna / totalCandidatosCna) * 100 : 0;

	return {
		totalColocados,
		totalMatriculados,
		pedidosAnulacao,
		totalCandidatosCna,
		totalAvailableVacancies,
		totalMatriculadosCna,
		percOcupacaoCna,
		percMatriculaCna
	};
}

/** Cards principais da dashboard (ordem de exibição). */
export const DASHBOARD_KPI_CARDS = [
	{
		key: 'totalCandidatosCna',
		label: 'Total candidatos',
		hint: 'Regime nacional (CNA)'
	},
	{
		key: 'percMatriculaCna',
		label: 'Taxa de matrícula CNA',
		hint: 'Matriculados / candidatos CNA',
		format: 'percent'
	},
	{
		key: 'totalColocados',
		label: 'Total colocados',
		hint: 'Concursos especiais'
	},
	{
		key: 'totalMatriculados',
		label: 'Total matriculados',
		hint: 'Conc.+ esp.+ int.'
	},
	{
		key: 'pedidosAnulacao',
		label: 'Pedidos de anulação',
		hint: 'Matrículas anuladas'
	},
	{
		key: 'totalAvailableVacancies',
		label: 'Vagas disponíveis',
		hint: 'Soma fases CNA'
	},
	{
		key: 'percOcupacaoCna',
		label: 'Ocupação CNA',
		hint: 'Matriculados / vagas',
		format: 'percent'
	}
];
