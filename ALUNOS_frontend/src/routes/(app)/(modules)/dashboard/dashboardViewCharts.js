import { getViewLabel } from './dashboardViewConfig.js';
import { buildDonutChartOption } from './dashboardChartConfig.js';
import {
	DASHBOARD_CHART_PALETTE,
	CHART_COLOR_BLUE,
	CHART_COLOR_GREEN,
	CHART_COLOR_RED,
	CHART_COLOR_ORANGE,
	CHART_COLOR_PURPLE,
	hexWithAlphaHex,
	paletteColor
} from './dashboardChartColors.js';

/** Campos calculados — nunca somar em séries lineares */
const FORMULA_FIELDS = new Set([
	'percOcupacaoCna',
	'diffVacanciesEnrolled',
	'diffVagasMatAntes3F',
	'sobrasPos3F'
]);

/** @typedef {{ id: string, label: string, fieldKeys: string[] }} SeriesDef */
/** @typedef {{ id: string, label: string, fieldKeys: string[] }} SliceDef */
/** @typedef {{ id: string, title: string, subtitle: string, hint?: string, colClass: string, bodyClass: string, option: Record<string, unknown> }} ChartPanel */

/** @type {Record<string, Record<string, string[]>>} */
const DOMAIN_METRIC_FIELDS = {
	cna: {
		vagas: ['vagas1F', 'vagas2F', 'vagas3F'],
		candidatos: ['totalCandidatosCna'],
		colocados: ['totalColocadosCna'],
		matriculados: ['totalMatriculadosCna']
	},
	concursos: {
		vagas: ['over23Vagas', 'cetVagas', 'ctespVagas', 'otherHigherVagas', 'dualCertVagas'],
		candidatos: [
			'over23Candidatos',
			'cetCandidatos',
			'ctespCandidatos',
			'otherHigherCandidatos',
			'dualCertCandidatos'
		],
		colocados: [
			'over23Colocados',
			'cetColocados',
			'ctespColocados',
			'otherHigherColocados',
			'dualCertColocados'
		],
		matriculados: [
			'over23Matriculados',
			'cetMatriculados',
			'ctespMatriculados',
			'otherHigherMatriculados',
			'dualCertMatriculados'
		]
	},
	reingresso: {
		vagas: ['reingressoVagas', 'mudancaVagas'],
		candidatos: ['reingressoCandidatos', 'mudancaCandidatos'],
		colocados: [],
		matriculados: [
			'reingressoAno1',
			'reingressoAno2',
			'reingressoAno3',
			'reingressoAno4',
			'mudancaColocadosMatriculados'
		]
	},
	regimesEsp: {
		vagas: ['regimesEspVagas'],
		candidatos: ['regimesEspCandidatos'],
		colocados: [],
		matriculados: ['regimesEspMatriculados']
	},
	internacional: {
		vagas: ['internationalVagas'],
		candidatos: ['internationalCandidatos'],
		colocados: [],
		matriculados: ['internationalMatriculados']
	}
};

/** @type {{ id: string, label: string }[]} */
const DOMAIN_LABELS = [
	{ id: 'cna', label: 'Regime nacional' },
	{ id: 'concursos', label: 'Concursos esp.' },
	{ id: 'reingresso', label: 'Reingresso / mudança' },
	{ id: 'regimesEsp', label: 'Regimes especiais' },
	{ id: 'internacional', label: 'Internacional' }
];

const CNA_PHASES = [
	{ suffix: '1F', label: '1.ª fase' },
	{ suffix: '2F', label: '2.ª fase' },
	{ suffix: '3F', label: '3.ª fase' }
];

/** @param {Record<string, unknown>} row @param {string[]} fieldKeys */
function sumFields(row, fieldKeys) {
	let total = 0;
	for (const key of fieldKeys) {
		const v = Number(row[key]);
		if (Number.isFinite(v)) total += v;
	}
	return total;
}

/** @param {Record<string, unknown>[]} rows @param {string[]} fieldKeys */
function aggregateFieldKeys(rows, fieldKeys) {
	let total = 0;
	for (const row of rows) {
		total += sumFields(row, fieldKeys);
	}
	return total;
}

/** @param {{ name: string, value: number }[]} slices */
function sumSliceValues(slices) {
	return slices.reduce((acc, s) => acc + s.value, 0);
}

/**
 * @param {Record<string, unknown>[]} rows
 * @param {SeriesDef[]} seriesDefs
 */
export function aggregateByYear(rows, seriesDefs) {
	/** @type {Map<string, number[]>} */
	const byYear = new Map();

	for (const row of rows) {
		if (row.anoLetivoInicio == null || row.anoLetivoFim == null) continue;
		const yearKey = `${row.anoLetivoInicio}/${row.anoLetivoFim}`;
		if (!byYear.has(yearKey)) {
			byYear.set(yearKey, seriesDefs.map(() => 0));
		}
		const acc = byYear.get(yearKey);
		if (!acc) continue;
		for (let i = 0; i < seriesDefs.length; i++) {
			acc[i] += sumFields(row, seriesDefs[i].fieldKeys);
		}
	}

	const sorted = [...byYear.entries()].sort((a, b) => {
		const ai = parseInt(String(a[0]).split('/')[0] || '0', 10);
		const bi = parseInt(String(b[0]).split('/')[0] || '0', 10);
		return ai - bi;
	});

	return {
		categories: sorted.map(([k]) => k),
		series: seriesDefs.map((def, idx) => ({
			name: def.label,
			data: sorted.map(([, values]) => values[idx] ?? 0)
		}))
	};
}

/**
 * @param {Record<string, unknown>[]} rows
 * @param {SliceDef[]} sliceDefs
 */
export function aggregateSlices(rows, sliceDefs) {
	return sliceDefs
		.map((def) => ({
			name: def.label,
			value: aggregateFieldKeys(rows, def.fieldKeys)
		}))
		.filter((item) => item.value > 0);
}

/** @param {'vagas' | 'candidatos' | 'colocados' | 'matriculados'} metric */
function domainSlicesForMetric(metric) {
	return DOMAIN_LABELS.map(({ id, label }) => ({
		id,
		label,
		fieldKeys: DOMAIN_METRIC_FIELDS[id]?.[metric] ?? []
	})).filter((s) => s.fieldKeys.length > 0);
}

/** @param {string} phaseSuffix */
function cnaPhaseSpecs(phaseSuffix) {
	const phaseLabel =
		phaseSuffix === '1F' ? '1.ª fase' : phaseSuffix === '2F' ? '2.ª fase' : '3.ª fase';

	return {
		family: 'cna-phase',
		title: `Regime ${phaseLabel}`,
		lineSubtitle: `Colocados e matriculados (${phaseLabel}) por ano letivo`,
		donutSubtitle: `Composição ${phaseLabel} no ano selecionado`,
		lineSeries: [
			{ id: 'colocados', label: 'Colocados', fieldKeys: [`colocados${phaseSuffix}`] },
			{ id: 'matriculados', label: 'Matriculados', fieldKeys: [`matriculados${phaseSuffix}`] }
		],
		donutSlices: [
			{ id: 'vagas', label: 'Vagas', fieldKeys: [`vagas${phaseSuffix}`] },
			{ id: 'candidatos', label: 'Candidatos', fieldKeys: [`candidatos${phaseSuffix}`] },
			{ id: 'colocados', label: 'Colocados', fieldKeys: [`colocados${phaseSuffix}`] },
			{ id: 'matriculados', label: 'Matriculados', fieldKeys: [`matriculados${phaseSuffix}`] }
		]
	};
}

/** @param {string} viewId */
export function resolveViewChartSpec(viewId) {
	switch (viewId) {
		case 'totais':
			return {
				family: 'global',
				title: getViewLabel(viewId),
				lineSubtitle: 'Candidatos, colocados e matriculados por ano letivo',
				donutSubtitle: 'Matriculados por via no ano selecionado',
				lineSeries: [
					{ id: 'candidatos', label: 'Candidatos (CNA)', fieldKeys: ['totalCandidatosCna'] },
					{
						id: 'colocados',
						label: 'Colocados',
						fieldKeys: ['totalColocadosCna', 'totalColocados']
					},
					{
						id: 'matriculados',
						label: 'Matriculados',
						fieldKeys: [
							'totalMatriculadosCna',
							'totalMatriculados',
							'regimesEspMatriculados',
							'internationalMatriculados',
							'reingressoAno1',
							'reingressoAno2',
							'reingressoAno3',
							'reingressoAno4',
							'mudancaColocadosMatriculados'
						]
					}
				],
				donutSlices: [
					{ id: 'cna', label: 'Regime nacional', fieldKeys: ['totalMatriculadosCna'] },
					{ id: 'conc', label: 'Concursos esp.', fieldKeys: ['totalMatriculados'] },
					{ id: 'reg', label: 'Regimes especiais', fieldKeys: ['regimesEspMatriculados'] },
					{ id: 'int', label: 'Internacional', fieldKeys: ['internationalMatriculados'] },
					{
						id: 'reing',
						label: 'Reingresso / mudança',
						fieldKeys: [
							'reingressoAno1',
							'reingressoAno2',
							'reingressoAno3',
							'reingressoAno4',
							'mudancaColocadosMatriculados'
						]
					}
				]
			};

		case 'vagas':
		case 'candidatos':
		case 'colocados':
		case 'matriculados':
			return {
				family: 'global-metric',
				title: getViewLabel(viewId),
				lineSubtitle: `Total de ${viewId} por ano letivo`,
				donutSubtitle: `${viewId.charAt(0).toUpperCase()}${viewId.slice(1)} por via no ano selecionado`,
				metric: viewId,
				lineSeries: [
					{
						id: viewId,
						label: viewId.charAt(0).toUpperCase() + viewId.slice(1),
						fieldKeys: 'dynamic'
					}
				],
				donutSlices: domainSlicesForMetric(viewId)
			};

		case 'cna-1f':
			return cnaPhaseSpecs('1F');
		case 'cna-2f':
			return cnaPhaseSpecs('2F');
		case 'cna-3f':
			return cnaPhaseSpecs('3F');

		case 'concursos':
			return {
				family: 'domain',
				title: getViewLabel(viewId),
				lineSubtitle: 'Matriculados e colocados (concursos esp.) por ano letivo',
				donutSubtitle: 'Detalhe por concurso no ano selecionado',
				lineSeries: [
					{
						id: 'matriculados',
						label: 'Matriculados',
						fieldKeys: DOMAIN_METRIC_FIELDS.concursos.matriculados
					},
					{
						id: 'colocados',
						label: 'Colocados',
						fieldKeys: DOMAIN_METRIC_FIELDS.concursos.colocados
					}
				],
				donutSlices: [
					{ id: 'over23', label: '>23', fieldKeys: ['over23Matriculados'] },
					{ id: 'cet', label: 'CET', fieldKeys: ['cetMatriculados'] },
					{ id: 'ctesp', label: 'CTeSP', fieldKeys: ['ctespMatriculados'] },
					{ id: 'other', label: 'Outros ens. sup.', fieldKeys: ['otherHigherMatriculados'] },
					{ id: 'dual', label: 'Dupla cert.', fieldKeys: ['dualCertMatriculados'] }
				],
				donutFallbackSlices: [
					{ id: 'over23', label: '>23', fieldKeys: ['over23Candidatos'] },
					{ id: 'cet', label: 'CET', fieldKeys: ['cetCandidatos'] },
					{ id: 'ctesp', label: 'CTeSP', fieldKeys: ['ctespCandidatos'] },
					{ id: 'other', label: 'Outros ens. sup.', fieldKeys: ['otherHigherCandidatos'] },
					{ id: 'dual', label: 'Dupla cert.', fieldKeys: ['dualCertCandidatos'] }
				]
			};

		case 'reingresso':
			return {
				family: 'domain',
				title: getViewLabel(viewId),
				lineSubtitle: 'Reingresso e mudança por ano letivo',
				donutSubtitle: 'Detalhe no ano selecionado',
				lineSeries: [
					{
						id: 'reingresso',
						label: 'Reingresso',
						fieldKeys: ['reingressoAno1', 'reingressoAno2', 'reingressoAno3', 'reingressoAno4']
					},
					{ id: 'mudanca', label: 'Mudança', fieldKeys: ['mudancaColocadosMatriculados'] }
				],
				donutSlices: [
					{ id: 'y1', label: 'Reing. 1.º ano', fieldKeys: ['reingressoAno1'] },
					{ id: 'y2', label: 'Reing. 2.º ano', fieldKeys: ['reingressoAno2'] },
					{ id: 'y3', label: 'Reing. 3.º ano', fieldKeys: ['reingressoAno3'] },
					{ id: 'y4', label: 'Reing. 4.º ano', fieldKeys: ['reingressoAno4'] },
					{ id: 'mud', label: 'Mudança', fieldKeys: ['mudancaColocadosMatriculados'] }
				],
				donutFallbackSlices: [
					{ id: 'y1', label: 'Reing. 1.º ano', fieldKeys: ['reingressoCandidatos'] },
					{ id: 'mud', label: 'Mudança', fieldKeys: ['mudancaCandidatos'] }
				]
			};

		case 'regimes-esp-internacionais':
			return {
				family: 'domain',
				title: getViewLabel(viewId),
				lineSubtitle: 'Matriculados por via por ano letivo',
				donutSubtitle: 'Regimes esp. vs internacional no ano selecionado',
				lineSeries: [
					{ id: 'regimesEsp', label: 'Regimes especiais', fieldKeys: ['regimesEspMatriculados'] },
					{ id: 'internacional', label: 'Internacional', fieldKeys: ['internationalMatriculados'] }
				],
				donutSlices: [
					{ id: 'reg', label: 'Regimes especiais', fieldKeys: ['regimesEspMatriculados'] },
					{ id: 'int', label: 'Internacional', fieldKeys: ['internationalMatriculados'] }
				],
				donutFallbackSlices: [
					{ id: 'reg', label: 'Regimes especiais', fieldKeys: ['regimesEspCandidatos'] },
					{ id: 'int', label: 'Internacional', fieldKeys: ['internationalCandidatos'] }
				]
			};

		default:
			return resolveViewChartSpec('totais');
	}
}

/** @param {'vagas' | 'candidatos' | 'colocados' | 'matriculados'} metric */
function resolveGlobalMetricFieldKeys(metric) {
	/** @type {string[]} */
	const keys = [];
	for (const domain of Object.values(DOMAIN_METRIC_FIELDS)) {
		const fields = domain[metric] ?? [];
		for (const f of fields) {
			if (!FORMULA_FIELDS.has(f) && !keys.includes(f)) keys.push(f);
		}
	}
	return keys;
}

/** @param {ReturnType<typeof resolveViewChartSpec>} spec */
function resolveSpecLineSeries(spec) {
	if (spec.family === 'global-metric' && spec.lineSeries[0]?.fieldKeys === 'dynamic') {
		const metric = spec.metric ?? 'vagas';
		return [
			{
				id: metric,
				label: metric.charAt(0).toUpperCase() + metric.slice(1),
				fieldKeys: resolveGlobalMetricFieldKeys(metric)
			}
		];
	}
	return spec.lineSeries;
}

/**
 * @param {ReturnType<typeof resolveViewChartSpec>} spec
 * @param {Record<string, unknown>[]} yearRows
 */
function resolveDonutSlices(spec, yearRows) {
	let donutSlices = aggregateSlices(yearRows, spec.donutSlices);
	let hint = spec.donutSubtitle;

	if (sumSliceValues(donutSlices) === 0 && spec.donutFallbackSlices) {
		const fallback = aggregateSlices(yearRows, spec.donutFallbackSlices);
		if (sumSliceValues(fallback) > 0) {
			donutSlices = fallback;
			hint = 'Sem matriculados — a mostrar candidatos';
		}
	}

	if (sumSliceValues(donutSlices) === 0 && spec.family === 'cna-phase') {
		const phaseOnly = spec.donutSlices.filter((s) => s.id === 'vagas' || s.id === 'candidatos');
		const phaseFallback = aggregateSlices(yearRows, phaseOnly);
		if (sumSliceValues(phaseFallback) > 0) {
			donutSlices = phaseFallback;
			hint = 'Sem colocados/matriculados — vagas e candidatos';
		}
	}

	if (sumSliceValues(donutSlices) === 0 && spec.family === 'global-metric' && spec.metric) {
		const metric = spec.metric;
		const fallbackDefs = domainSlicesForMetric(
			metric === 'vagas' ? 'candidatos' : metric === 'candidatos' ? 'candidatos' : metric
		);
		const alt = aggregateSlices(yearRows, fallbackDefs);
		if (sumSliceValues(alt) > 0 && metric !== 'candidatos') {
			donutSlices = alt;
			hint = `Sem ${metric} — a mostrar candidatos`;
		}
	}

	return { slices: donutSlices, hint };
}

/**
 * @param {Record<string, unknown>[]} rows
 * @param {'schoolName' | 'courseName'} groupKey
 * @param {string[]} fieldKeys
 * @param {number} [limit]
 */
function aggregateTopEntities(rows, groupKey, fieldKeys, limit = 8) {
	/** @type {Map<string, number>} */
	const totals = new Map();

	for (const row of rows) {
		const label = String(row[groupKey] ?? '').trim();
		if (!label) continue;
		totals.set(label, (totals.get(label) ?? 0) + sumFields(row, fieldKeys));
	}

	return [...totals.entries()]
		.map(([name, value]) => ({ name, value }))
		.filter((item) => item.value > 0)
		.sort((a, b) => b.value - a.value)
		.slice(0, limit);
}

/** @param {Record<string, unknown>[]} rows @param {'matriculados' | 'candidatos' | 'colocados' | 'vagas'} metric */
function cnaPhaseSeriesDefs(metric) {
	return CNA_PHASES.map(({ suffix, label }) => ({
		id: `${metric}${suffix}`,
		label,
		fieldKeys: [`${metric}${suffix}`]
	}));
}

/** Ordem fixa do funil CNA (topo → base) */
const FUNNEL_STEP_ORDER = ['Vagas', 'Candidatos', 'Colocados', 'Matriculados'];

/** @param {{ name: string, value: number }[]} steps */
function orderFunnelSteps(steps) {
	const byName = new Map(steps.map((s) => [s.name, s]));
	return FUNNEL_STEP_ORDER.map((name) => ({
		name,
		value: byName.get(name)?.value ?? 0
	}));
}

/** @param {Record<string, unknown>[]} rows @param {string} phaseSuffix */
function cnaPhaseFunnelSteps(rows, phaseSuffix) {
	return [
		{ name: 'Vagas', value: aggregateFieldKeys(rows, [`vagas${phaseSuffix}`]) },
		{ name: 'Candidatos', value: aggregateFieldKeys(rows, [`candidatos${phaseSuffix}`]) },
		{ name: 'Colocados', value: aggregateFieldKeys(rows, [`colocados${phaseSuffix}`]) },
		{ name: 'Matriculados', value: aggregateFieldKeys(rows, [`matriculados${phaseSuffix}`]) }
	];
}

/** Funil CNA agregado (3 fases) no ano selecionado */
function cnaTotalFunnelSteps(rows) {
	return [
		{
			name: 'Vagas',
			value: aggregateFieldKeys(rows, ['vagas1F', 'vagas2F', 'vagas3F'])
		},
		{
			name: 'Candidatos',
			value: aggregateFieldKeys(rows, ['candidatos1F', 'candidatos2F', 'candidatos3F'])
		},
		{
			name: 'Colocados',
			value: aggregateFieldKeys(rows, ['colocados1F', 'colocados2F', 'colocados3F'])
		},
		{
			name: 'Matriculados',
			value: aggregateFieldKeys(rows, ['matriculados1F', 'matriculados2F', 'matriculados3F'])
		}
	];
}

/** Comparativo das 3 fases CNA no ano selecionado (barras agrupadas) */
function cnaPhasesGroupedMetrics(rows) {
	const metrics = [
		{ name: 'Vagas', prefix: 'vagas' },
		{ name: 'Candidatos', prefix: 'candidatos' },
		{ name: 'Colocados', prefix: 'colocados' },
		{ name: 'Matriculados', prefix: 'matriculados' }
	];

	return {
		categories: CNA_PHASES.map((p) => p.label),
		series: metrics.map(({ name, prefix }) => ({
			name,
			data: CNA_PHASES.map(({ suffix }) =>
				aggregateFieldKeys(rows, [`${prefix}${suffix}`])
			)
		}))
	};
}

/** @param {Record<string, unknown>[]} rows */
function cnaAllPhasesMatriculados(rows) {
	return CNA_PHASES.map(({ suffix, label }) => ({
		name: label,
		value: aggregateFieldKeys(rows, [`matriculados${suffix}`])
	})).filter((s) => s.value > 0);
}

/**
 * @param {{ categories: string[], series: { name: string, data: number[] }[] }} data
 * @param {string} highlightedYear
 */
function computeYoYDelta(data, highlightedYear) {
	const idx = data.categories.indexOf(highlightedYear);
	if (idx <= 0) return null;

	const prevIdx = idx - 1;
	const prevYear = data.categories[prevIdx];
	const series = data.series[0];
	if (!series) return null;

	const current = series.data[idx] ?? 0;
	const previous = series.data[prevIdx] ?? 0;
	const delta = current - previous;
	const pct = previous > 0 ? ((delta / previous) * 100) : null;

	return {
		label: series.name,
		prevYear,
		currentYear: highlightedYear,
		current,
		previous,
		delta,
		pct
	};
}

/** @param {string} [message] */
function emptyGraphic(message = 'Sem dados\npara este ano letivo') {
	return [
		{
			type: 'text',
			left: 'center',
			top: 'middle',
			style: {
				text: message,
				fill: '#868e96',
				fontSize: 13,
				lineHeight: 20,
				textAlign: 'center'
			}
		}
	];
}

/**
 * @param {{ categories: string[], series: { name: string, data: number[] }[], highlightedYear?: string, chartType?: 'line' | 'area' | 'bar', stacked?: boolean }} data
 */
export function buildViewLineOption(data) {
	const highlightedYear = data.highlightedYear ?? '';
	const sparseAxis = data.categories.length <= 2;
	const chartType = data.chartType ?? 'line';
	const stacked = data.stacked ?? false;
	const isBar = chartType === 'bar';
	const isArea = chartType === 'area';
	const isLine = chartType === 'line' || isArea;
	const echartsType = isBar ? 'bar' : 'line';
	const hasData = data.series.some((s) => s.data.some((v) => v > 0));

	return {
		color: DASHBOARD_CHART_PALETTE,
		grid: { left: 48, right: 24, top: 48, bottom: 36, containLabel: true },
		tooltip: hasData
			? {
					trigger: 'axis',
					backgroundColor: '#fff',
					borderColor: '#cfe2ff',
					textStyle: { color: '#212529', fontSize: 12 }
				}
			: { show: false },
		legend: {
			show: hasData,
			data: data.series.map((s) => s.name),
			type: data.series.length > 3 ? 'scroll' : 'plain',
			top: 4,
			textStyle: { color: '#495057', fontSize: 12 }
		},
		xAxis: {
			type: 'category',
			data: data.categories,
			boundaryGap: isBar || sparseAxis,
			axisLine: { lineStyle: { color: '#dee2e6' } },
			axisLabel: {
				fontSize: 11,
				formatter: (/** @type {string} */ value) =>
					value === highlightedYear ? `{hl|${value}}` : value,
				rich: { hl: { color: CHART_COLOR_BLUE, fontWeight: 'bold' } },
				color: '#6c757d'
			}
		},
		yAxis: {
			type: 'value',
			minInterval: 1,
			axisLine: { show: false },
			splitLine: { lineStyle: { color: '#f1f3f5' } },
			axisLabel: { color: '#6c757d', fontSize: 11 }
		},
		graphic: hasData ? [] : emptyGraphic(),
		series: hasData
			? data.series.map((s, idx) => ({
					name: s.name,
					type: echartsType,
					stack: stacked ? 'total' : undefined,
					smooth: isLine,
					symbol: isLine ? 'circle' : undefined,
					symbolSize: isLine ? 7 : undefined,
					lineStyle: isLine ? { width: 2.5 } : undefined,
					areaStyle: isArea
						? { color: hexWithAlphaHex(paletteColor(idx), '33') }
						: undefined,
					itemStyle: isBar ? { borderRadius: [4, 4, 0, 0] } : undefined,
					barMaxWidth: isBar ? 36 : undefined,
					data: s.data
				}))
			: []
	};
}

/** @param {{ name: string, value: number }[]} slices */
export function buildViewDonutOption(slices) {
	return buildDonutChartOption(slices);
}

/**
 * @param {{ items: { name: string, value: number }[], horizontal?: boolean, title?: string }} data
 */
function buildHorizontalBarOption(data) {
	const items = [...data.items].reverse();
	const hasData = items.length > 0 && sumSliceValues(items) > 0;

	return {
		color: DASHBOARD_CHART_PALETTE,
		grid: { left: 8, right: 24, top: 12, bottom: 12, containLabel: true },
		tooltip: hasData
			? {
					trigger: 'axis',
					axisPointer: { type: 'shadow' },
					backgroundColor: '#fff',
					borderColor: '#cfe2ff',
					textStyle: { color: '#212529', fontSize: 12 }
				}
			: { show: false },
		xAxis: {
			type: 'value',
			minInterval: 1,
			axisLine: { show: false },
			splitLine: { lineStyle: { color: '#f1f3f5' } },
			axisLabel: { color: '#6c757d', fontSize: 11 }
		},
		yAxis: {
			type: 'category',
			data: items.map((i) => i.name),
			axisLine: { lineStyle: { color: '#dee2e6' } },
			axisLabel: {
				color: '#495057',
				fontSize: 10,
				width: 120,
				overflow: 'truncate'
			}
		},
		graphic: hasData ? [] : emptyGraphic(),
		series: hasData
			? [
					{
						type: 'bar',
						data: items.map((item, idx) => ({
							value: item.value,
							itemStyle: {
								color: paletteColor(idx),
								borderRadius: [0, 4, 4, 0]
							}
						})),
						barMaxWidth: 22
					}
				]
			: []
	};
}

/**
 * @param {{ categories: string[], series: { name: string, data: number[] }[] }} data
 */
function buildGroupedBarOption(data) {
	const hasData =
		data.categories.length > 0 &&
		data.series.some((s) => s.data.some((v) => v > 0));

	return {
		color: DASHBOARD_CHART_PALETTE,
		grid: { left: 48, right: 24, top: 48, bottom: 36, containLabel: true },
		tooltip: hasData
			? {
					trigger: 'axis',
					axisPointer: { type: 'shadow' },
					backgroundColor: '#fff',
					borderColor: '#cfe2ff',
					textStyle: { color: '#212529', fontSize: 12 }
				}
			: { show: false },
		legend: {
			data: data.series.map((s) => s.name),
			top: 4,
			textStyle: { color: '#495057', fontSize: 12 }
		},
		xAxis: {
			type: 'category',
			data: data.categories,
			axisLine: { lineStyle: { color: '#dee2e6' } },
			axisLabel: { color: '#6c757d', fontSize: 11 }
		},
		yAxis: {
			type: 'value',
			minInterval: 1,
			axisLine: { show: false },
			splitLine: { lineStyle: { color: '#f1f3f5' } },
			axisLabel: { color: '#6c757d', fontSize: 11 }
		},
		graphic: hasData ? [] : emptyGraphic(),
		series: data.series.map((s, idx) => ({
			name: s.name,
			type: 'bar',
			barMaxWidth: 28,
			itemStyle: {
				color: cnaMetricColor(s.name, idx),
				borderRadius: [4, 4, 0, 0]
			},
			data: s.data
		}))
	};
}

/** Cores semânticas CNA — alinhadas com o funil */
function cnaMetricColor(name, fallbackIdx = 0) {
	if (name === 'Vagas') return CHART_COLOR_BLUE;
	if (name === 'Candidatos') return CHART_COLOR_GREEN;
	if (name === 'Colocados') return CHART_COLOR_ORANGE;
	if (name === 'Matriculados') return CHART_COLOR_PURPLE;
	return paletteColor(fallbackIdx);
}

/** @param {string} stepName @param {number} fallbackIdx */
function funnelStepColor(stepName, fallbackIdx) {
	return cnaMetricColor(stepName, fallbackIdx);
}

/** @param {{ name: string, value: number }[]} steps */
function buildFunnelBarOption(steps) {
	const ordered = orderFunnelSteps(steps);
	const hasData = ordered.some((s) => s.value > 0);

	return {
		color: DASHBOARD_CHART_PALETTE,
		grid: { left: 48, right: 48, top: 16, bottom: 24, containLabel: true },
		tooltip: hasData
			? {
					trigger: 'axis',
					axisPointer: { type: 'shadow' },
					backgroundColor: '#fff',
					borderColor: '#cfe2ff',
					textStyle: { color: '#212529', fontSize: 12 }
				}
			: { show: false },
		xAxis: {
			type: 'value',
			minInterval: 1,
			axisLine: { show: false },
			splitLine: { lineStyle: { color: '#f1f3f5' } },
			axisLabel: { color: '#6c757d', fontSize: 11 }
		},
		yAxis: {
			type: 'category',
			data: ordered.map((s) => s.name),
			inverse: true,
			axisLine: { lineStyle: { color: '#dee2e6' } },
			axisLabel: { color: '#495057', fontSize: 11 }
		},
		graphic: hasData ? [] : emptyGraphic('Sem dados\npara construir o funil'),
		series: hasData
			? [
					{
						type: 'bar',
						data: ordered.map((s, idx) => ({
							value: s.value,
							itemStyle: {
								color: funnelStepColor(s.name, idx),
								borderRadius: [0, 4, 4, 0]
							}
						})),
						barMaxWidth: 32,
						label: {
							show: true,
							position: 'right',
							color: '#495057',
							fontSize: 11
						}
					}
				]
			: []
	};
}

/** @param {{ label: string, prevYear: string, currentYear: string, delta: number, pct: number | null }} yoy */
function buildYoYBarOption(yoy) {
	const sign = yoy.delta >= 0 ? '+' : '';
	const pctLabel =
		yoy.pct != null ? `${sign}${yoy.pct.toFixed(1)}%` : `${sign}${yoy.delta.toLocaleString('pt-PT')}`;

	return {
		color: [yoy.delta >= 0 ? CHART_COLOR_GREEN : CHART_COLOR_RED],
		grid: { left: 48, right: 24, top: 36, bottom: 36, containLabel: true },
		tooltip: {
			trigger: 'axis',
			backgroundColor: '#fff',
			borderColor: '#cfe2ff',
			textStyle: { color: '#212529', fontSize: 12 }
		},
		xAxis: {
			type: 'category',
			data: [yoy.prevYear, yoy.currentYear],
			axisLine: { lineStyle: { color: '#dee2e6' } },
			axisLabel: { color: '#6c757d', fontSize: 11 }
		},
		yAxis: {
			type: 'value',
			minInterval: 1,
			axisLine: { show: false },
			splitLine: { lineStyle: { color: '#f1f3f5' } },
			axisLabel: { color: '#6c757d', fontSize: 11 }
		},
		graphic: [
			{
				type: 'text',
				left: 'center',
				top: 6,
				style: {
					text: `Variação: ${pctLabel}`,
					fill: yoy.delta >= 0 ? CHART_COLOR_GREEN : CHART_COLOR_RED,
					fontSize: 12,
					fontWeight: 'bold',
					textAlign: 'center'
				}
			}
		],
		series: [
			{
				name: yoy.label,
				type: 'bar',
				barMaxWidth: 48,
				itemStyle: { borderRadius: [4, 4, 0, 0] },
				data: [yoy.previous, yoy.current]
			}
		]
	};
}

/**
 * @param {ChartPanel} panel
 * @returns {ChartPanel}
 */
function panel(panel) {
	return panel;
}

/**
 * @param {Record<string, unknown>[]} chartRows
 * @param {Record<string, unknown>[]} yearRows
 * @param {string} viewId
 * @param {string} highlightedYear
 * @param {string} escolaFilter
 */
export function computeViewChartPanels(chartRows, yearRows, viewId, highlightedYear = '', escolaFilter = 'all') {
	const spec = resolveViewChartSpec(viewId);
	const lineSeries = resolveSpecLineSeries(spec);
	const lineData = aggregateByYear(chartRows, lineSeries);
	const { slices: donutSlices, hint: donutHint } = resolveDonutSlices(spec, yearRows);

	const topGroupKey = escolaFilter === 'all' ? 'schoolName' : 'courseName';
	const topLabel = escolaFilter === 'all' ? 'Top escolas' : 'Top cursos';
	const matriculadosKeys = resolveGlobalMetricFieldKeys('matriculados');
	const topEntities = aggregateTopEntities(yearRows, topGroupKey, matriculadosKeys);

	/** @type {ChartPanel[]} */
	const panels = [];

	switch (viewId) {
		case 'totais': {
			panels.push(
				panel({
					id: 'cna-funnel',
					title: 'Funil CNA',
					subtitle: `Vagas → candidatos → colocados → matriculados (${highlightedYear || 'ano selecionado'})`,
					colClass: 'col-12 col-lg-7',
					bodyClass: 'chart-panel-body--bar',
					option: buildFunnelBarOption(cnaTotalFunnelSteps(yearRows))
				}),
				panel({
					id: 'cna-phases-compare',
					title: 'Comparativo por fase CNA',
					subtitle: `Métricas por fase no ano ${highlightedYear || 'selecionado'}`,
					colClass: 'col-12 col-lg-5',
					bodyClass: 'chart-panel-body--bar',
					option: buildGroupedBarOption(cnaPhasesGroupedMetrics(yearRows))
				}),
				panel({
					id: 'top-entities',
					title: topLabel,
					subtitle: `Matriculados no ano ${highlightedYear || 'selecionado'}`,
					colClass: 'col-12 col-lg-5',
					bodyClass: 'chart-panel-body--bar',
					option: buildHorizontalBarOption({ items: topEntities })
				}),
				panel({
					id: 'cna-phases-evolution',
					title: 'Evolução CNA por fase',
					subtitle: 'Matriculados por fase ao longo dos anos letivos',
					colClass: 'col-12 col-lg-7',
					bodyClass: 'chart-panel-body--bar',
					option: buildViewLineOption({
						...aggregateByYear(chartRows, cnaPhaseSeriesDefs('matriculados')),
						highlightedYear,
						chartType: 'bar',
						stacked: true
					})
				})
			);
			break;
		}

		case 'vagas':
		case 'candidatos':
		case 'colocados':
		case 'matriculados': {
			const metric = /** @type {'vagas' | 'candidatos' | 'colocados' | 'matriculados'} */ (viewId);
			const metricKeys = resolveGlobalMetricFieldKeys(metric);
			const domainSeries = domainSlicesForMetric(metric).map((d) => ({
				id: d.id,
				label: d.label,
				fieldKeys: d.fieldKeys
			}));
			const domainByYear = aggregateByYear(chartRows, domainSeries);
			const metricTop = aggregateTopEntities(yearRows, topGroupKey, metricKeys);
			const yoy = computeYoYDelta(lineData, highlightedYear);

			if (viewId === 'vagas') {
				panels.push(
					panel({
						id: 'evolution-area',
						title: spec.title,
						subtitle: 'Evolução total de vagas (todas as vias)',
						colClass: 'col-12',
						bodyClass: 'chart-panel-body--line',
						option: buildViewLineOption({ ...lineData, highlightedYear, chartType: 'area' })
					}),
					panel({
						id: 'distribution',
						title: 'Vagas por via',
						subtitle: spec.donutSubtitle,
						hint: donutHint,
						colClass: 'col-12 col-lg-4',
						bodyClass: 'chart-panel-body--donut',
						option: buildViewDonutOption(donutSlices)
					}),
					panel({
						id: 'top-entities',
						title: `${topLabel} — vagas`,
						subtitle: `Ano ${highlightedYear || 'selecionado'}`,
						colClass: 'col-12 col-lg-8',
						bodyClass: 'chart-panel-body--bar',
						option: buildHorizontalBarOption({ items: metricTop })
					}),
					panel({
						id: 'domain-stack',
						title: 'Vagas por domínio',
						subtitle: 'Composição anual por via de acesso',
						colClass: 'col-12',
						bodyClass: 'chart-panel-body--line',
						option: buildViewLineOption({
							...domainByYear,
							highlightedYear,
							chartType: 'bar',
							stacked: true
						})
					})
				);
			} else if (viewId === 'candidatos') {
				panels.push(
					panel({
						id: 'domain-stack',
						title: spec.title,
						subtitle: 'Candidatos por domínio ao longo dos anos',
						colClass: 'col-12 col-lg-7',
						bodyClass: 'chart-panel-body--line',
						option: buildViewLineOption({
							...domainByYear,
							highlightedYear,
							chartType: 'bar',
							stacked: true
						})
					}),
					panel({
						id: 'distribution',
						title: 'Candidatos por via',
						subtitle: spec.donutSubtitle,
						hint: donutHint,
						colClass: 'col-12 col-lg-5',
						bodyClass: 'chart-panel-body--donut',
						option: buildViewDonutOption(donutSlices)
					}),
					panel({
						id: 'cna-funnel',
						title: 'Funil CNA',
						subtitle: `Vagas → candidatos → colocados → matriculados (${highlightedYear || 'ano'})`,
						colClass: 'col-12 col-lg-6',
						bodyClass: 'chart-panel-body--bar',
						option: buildFunnelBarOption(cnaPhaseFunnelSteps(yearRows, '1F'))
					}),
					panel({
						id: 'top-entities',
						title: `${topLabel} — candidatos`,
						subtitle: `Ano ${highlightedYear || 'selecionado'}`,
						colClass: 'col-12 col-lg-6',
						bodyClass: 'chart-panel-body--bar',
						option: buildHorizontalBarOption({ items: metricTop })
					})
				);
			} else if (viewId === 'colocados') {
				panels.push(
					panel({
						id: 'distribution',
						title: 'Colocados por via',
						subtitle: spec.donutSubtitle,
						hint: donutHint,
						colClass: 'col-12 col-lg-4',
						bodyClass: 'chart-panel-body--donut',
						option: buildViewDonutOption(donutSlices)
					}),
					panel({
						id: 'evolution',
						title: spec.title,
						subtitle: spec.lineSubtitle,
						colClass: 'col-12 col-lg-8',
						bodyClass: 'chart-panel-body--line',
						option: buildViewLineOption({ ...lineData, highlightedYear, chartType: 'bar' })
					}),
					panel({
						id: 'top-entities',
						title: `${topLabel} — colocados`,
						subtitle: `Ano ${highlightedYear || 'selecionado'}`,
						colClass: 'col-12 col-lg-6',
						bodyClass: 'chart-panel-body--bar',
						option: buildHorizontalBarOption({ items: metricTop })
					}),
					panel({
						id: 'yoy-or-phases',
						title: yoy ? 'Variação ano a ano' : 'Colocados CNA por fase',
						subtitle: yoy
							? `Comparação ${yoy.prevYear} → ${yoy.currentYear}`
							: `Comparação das 3 fases (${highlightedYear || 'ano'})`,
						colClass: 'col-12 col-lg-6',
						bodyClass: 'chart-panel-body--bar',
						option: yoy
							? buildYoYBarOption(yoy)
							: buildGroupedBarOption({
									categories: ['Colocados'],
									series: cnaPhaseSeriesDefs('colocados').map((def) => ({
										name: def.label,
										data: [aggregateFieldKeys(yearRows, def.fieldKeys)]
									}))
								})
					})
				);
			} else {
				panels.push(
					panel({
						id: 'evolution',
						title: spec.title,
						subtitle: spec.lineSubtitle,
						colClass: 'col-12 col-lg-6',
						bodyClass: 'chart-panel-body--line',
						option: buildViewLineOption({ ...lineData, highlightedYear })
					}),
					panel({
						id: 'distribution',
						title: 'Matriculados por via',
						subtitle: spec.donutSubtitle,
						hint: donutHint,
						colClass: 'col-12 col-lg-6',
						bodyClass: 'chart-panel-body--donut',
						option: buildViewDonutOption(donutSlices)
					}),
					panel({
						id: 'top-entities',
						title: `${topLabel} — matriculados`,
						subtitle: `Ano ${highlightedYear || 'selecionado'}`,
						colClass: 'col-12',
						bodyClass: 'chart-panel-body--bar',
						option: buildHorizontalBarOption({ items: metricTop })
					}),
					panel({
						id: 'domain-stack',
						title: 'Matriculados por domínio',
						subtitle: 'Evolução anual por via de acesso',
						colClass: 'col-12',
						bodyClass: 'chart-panel-body--line',
						option: buildViewLineOption({
							...domainByYear,
							highlightedYear,
							chartType: 'area',
							stacked: true
						})
					})
				);
			}
			break;
		}

		case 'cna-1f':
		case 'cna-2f':
		case 'cna-3f': {
			const phaseSuffix = viewId === 'cna-1f' ? '1F' : viewId === 'cna-2f' ? '2F' : '3F';
			const phaseMatKeys = [`matriculados${phaseSuffix}`];

			panels.push(
				panel({
					id: 'evolution-bar',
					title: spec.title,
					subtitle: spec.lineSubtitle,
					colClass: 'col-12 col-lg-7',
					bodyClass: 'chart-panel-body--bar',
					option: buildViewLineOption({ ...lineData, highlightedYear, chartType: 'bar' })
				}),
				panel({
					id: 'distribution',
					title: `Detalhe — ${spec.title}`,
					subtitle: spec.donutSubtitle,
					hint: donutHint,
					colClass: 'col-12 col-lg-5',
					bodyClass: 'chart-panel-body--donut',
					option: buildViewDonutOption(donutSlices)
				}),
				panel({
					id: 'funnel',
					title: 'Funil da fase',
					subtitle: `Conversão no ano ${highlightedYear || 'selecionado'}`,
					colClass: 'col-12 col-lg-6',
					bodyClass: 'chart-panel-body--bar',
					option: buildFunnelBarOption(cnaPhaseFunnelSteps(yearRows, phaseSuffix))
				}),
				panel({
					id: 'phase-compare',
					title: 'Comparar fases CNA',
					subtitle: 'Matriculados por fase no ano selecionado',
					colClass: 'col-12 col-lg-6',
					bodyClass: 'chart-panel-body--bar',
					option: buildHorizontalBarOption({ items: cnaAllPhasesMatriculados(yearRows) })
				})
			);

			if (escolaFilter !== 'all') {
				const topCourses = aggregateTopEntities(yearRows, 'courseName', phaseMatKeys);
				panels[3] = panel({
					id: 'top-courses',
					title: 'Top cursos na fase',
					subtitle: `Matriculados ${phaseSuffix} — ${highlightedYear || 'ano'}`,
					colClass: 'col-12 col-lg-6',
					bodyClass: 'chart-panel-body--bar',
					option: buildHorizontalBarOption({ items: topCourses })
				});
			}
			break;
		}

		case 'concursos': {
			const concMatSeries = DOMAIN_METRIC_FIELDS.concursos.matriculados.map((key, i) => ({
				id: key,
				label: spec.donutSlices[i]?.label ?? key,
				fieldKeys: [key]
			}));
			const stackedEvolution = aggregateByYear(chartRows, concMatSeries);
			const compareYear = {
				categories: spec.donutSlices.map((s) => s.label),
				series: [
					{
						name: 'Candidatos',
						data: (spec.donutFallbackSlices ?? spec.donutSlices).map((s) =>
							aggregateFieldKeys(yearRows, s.fieldKeys)
						)
					},
					{
						name: 'Matriculados',
						data: spec.donutSlices.map((s) => aggregateFieldKeys(yearRows, s.fieldKeys))
					}
				]
			};

			panels.push(
				panel({
					id: 'stacked-evolution',
					title: spec.title,
					subtitle: 'Matriculados por tipo de concurso ao longo dos anos',
					colClass: 'col-12 col-lg-8',
					bodyClass: 'chart-panel-body--line',
					option: buildViewLineOption({
						...stackedEvolution,
						highlightedYear,
						chartType: 'bar',
						stacked: true
					})
				}),
				panel({
					id: 'distribution',
					title: 'Detalhe por concurso',
					subtitle: spec.donutSubtitle,
					hint: donutHint,
					colClass: 'col-12 col-lg-4',
					bodyClass: 'chart-panel-body--donut',
					option: buildViewDonutOption(donutSlices)
				}),
				panel({
					id: 'cand-vs-mat',
					title: 'Candidatos vs matriculados',
					subtitle: `Por tipo de concurso (${highlightedYear || 'ano'})`,
					colClass: 'col-12 col-lg-6',
					bodyClass: 'chart-panel-body--bar',
					option: buildGroupedBarOption(compareYear)
				}),
				panel({
					id: 'top-entities',
					title: `${topLabel} — concursos`,
					subtitle: `Matriculados no ano ${highlightedYear || 'selecionado'}`,
					colClass: 'col-12 col-lg-6',
					bodyClass: 'chart-panel-body--bar',
					option: buildHorizontalBarOption({
						items: aggregateTopEntities(yearRows, topGroupKey, DOMAIN_METRIC_FIELDS.concursos.matriculados)
					})
				})
			);
			break;
		}

		case 'reingresso': {
			panels.push(
				panel({
					id: 'evolution',
					title: spec.title,
					subtitle: spec.lineSubtitle,
					colClass: 'col-12 col-lg-6',
					bodyClass: 'chart-panel-body--line',
					option: buildViewLineOption({ ...lineData, highlightedYear, chartType: 'area' })
				}),
				panel({
					id: 'distribution',
					title: 'Detalhe reingresso / mudança',
					subtitle: spec.donutSubtitle,
					hint: donutHint,
					colClass: 'col-12 col-lg-6',
					bodyClass: 'chart-panel-body--donut',
					option: buildViewDonutOption(donutSlices)
				}),
				panel({
					id: 'reingresso-anos',
					title: 'Reingresso por ano curricular',
					subtitle: `Distribuição no ano ${highlightedYear || 'selecionado'}`,
					colClass: 'col-12 col-lg-8',
					bodyClass: 'chart-panel-body--bar',
					option: buildHorizontalBarOption({
						items: spec.donutSlices
							.filter((s) => s.id.startsWith('y'))
							.map((s) => ({
								name: s.label,
								value: aggregateFieldKeys(yearRows, s.fieldKeys)
							}))
							.filter((i) => i.value > 0)
					})
				}),
				panel({
					id: 'reingresso-vs-mudanca',
					title: 'Reingresso vs mudança',
					subtitle: 'Evolução anual comparativa',
					colClass: 'col-12 col-lg-4',
					bodyClass: 'chart-panel-body--bar',
					option: buildViewLineOption({ ...lineData, highlightedYear, chartType: 'bar' })
				})
			);
			break;
		}

		case 'regimes-esp-internacionais': {
			panels.push(
				panel({
					id: 'distribution',
					title: 'Regimes esp. vs internacional',
					subtitle: spec.donutSubtitle,
					hint: donutHint,
					colClass: 'col-12 col-lg-5',
					bodyClass: 'chart-panel-body--donut',
					option: buildViewDonutOption(donutSlices)
				}),
				panel({
					id: 'evolution-bar',
					title: spec.title,
					subtitle: spec.lineSubtitle,
					colClass: 'col-12 col-lg-7',
					bodyClass: 'chart-panel-body--bar',
					option: buildViewLineOption({ ...lineData, highlightedYear, chartType: 'bar' })
				}),
				panel({
					id: 'top-entities',
					title: `${topLabel} — matriculados`,
					subtitle: `Ano ${highlightedYear || 'selecionado'}`,
					colClass: 'col-12 col-lg-6',
					bodyClass: 'chart-panel-body--bar',
					option: buildHorizontalBarOption({
						items: aggregateTopEntities(yearRows, topGroupKey, [
							'regimesEspMatriculados',
							'internationalMatriculados'
						])
					})
				}),
				panel({
					id: 'cand-vs-mat',
					title: 'Candidatos vs matriculados',
					subtitle: `Comparação no ano ${highlightedYear || 'selecionado'}`,
					colClass: 'col-12 col-lg-6',
					bodyClass: 'chart-panel-body--bar',
					option: buildGroupedBarOption({
						categories: ['Regimes esp.', 'Internacional'],
						series: [
							{
								name: 'Candidatos',
								data: [
									aggregateFieldKeys(yearRows, ['regimesEspCandidatos']),
									aggregateFieldKeys(yearRows, ['internationalCandidatos'])
								]
							},
							{
								name: 'Matriculados',
								data: [
									aggregateFieldKeys(yearRows, ['regimesEspMatriculados']),
									aggregateFieldKeys(yearRows, ['internationalMatriculados'])
								]
							}
						]
					})
				})
			);
			break;
		}

		default: {
			return computeViewChartPanels(chartRows, yearRows, 'totais', highlightedYear, escolaFilter);
		}
	}

	return {
		title: getViewLabel(viewId),
		panels
	};
}

/** @deprecated Use computeViewChartPanels */
export function computeViewLayerCharts(chartRows, yearRows, viewId, highlightedYear = '') {
	const result = computeViewChartPanels(chartRows, yearRows, viewId, highlightedYear, 'all');
	const spec = resolveViewChartSpec(viewId);
	const lineSeries = resolveSpecLineSeries(spec);
	const lineData = aggregateByYear(chartRows, lineSeries);
	const { slices: donutSlices, hint: donutHint } = resolveDonutSlices(spec, yearRows);

	return {
		title: spec.title,
		lineSubtitle: spec.lineSubtitle,
		donutTitle: `Detalhe — ${spec.title}`,
		donutHint,
		highlightedYear,
		lineData,
		donutSlices,
		panels: result.panels
	};
}
