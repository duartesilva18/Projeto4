import {
	DASHBOARD_CHART_PALETTE,
	CHART_COLOR_BLUE,
	CHART_COLOR_GREEN,
	hexWithAlpha
} from './dashboardChartColors.js';

/** @param {Record<string, unknown>} row */
function sumMatriculadosRow(row) {
	return (
		(Number(row.totalMatriculadosCna) || 0) +
		(Number(row.totalMatriculados) || 0) +
		(Number(row.reingressoAno1) || 0) +
		(Number(row.reingressoAno2) || 0) +
		(Number(row.reingressoAno3) || 0) +
		(Number(row.reingressoAno4) || 0) +
		(Number(row.mudancaColocadosMatriculados) || 0)
	);
}

/** @param {Record<string, unknown>} row */
function sumColocadosRow(row) {
	return (Number(row.totalColocadosCna) || 0) + (Number(row.totalColocados) || 0);
}

/**
 * Linhas para gráficos respeitando escola/curso (ignora filtro de ano).
 * @param {Record<string, unknown>[]} linhas
 * @param {string} escola
 * @param {string} curso
 */
export function filterRowsForCharts(linhas, escola, curso) {
	return linhas.filter((row) => {
		const matchEscola = escola === 'all' || row.schoolName === escola;
		const matchCurso = curso === 'all' || row.courseName === curso;
		return matchEscola && matchCurso;
	});
}

/** @param {Record<string, unknown>[]} rows */
function computeYearEvolution(rows) {
	/** @type {Map<string, { mat: number, col: number }>} */
	const byYear = new Map();

	for (const row of rows) {
		if (row.anoLetivoInicio == null || row.anoLetivoFim == null) continue;
		const key = `${row.anoLetivoInicio}/${row.anoLetivoFim}`;
		const cur = byYear.get(key) ?? { mat: 0, col: 0 };
		cur.mat += sumMatriculadosRow(row);
		cur.col += sumColocadosRow(row);
		byYear.set(key, cur);
	}

	const sorted = [...byYear.entries()].sort((a, b) => {
		const ai = parseInt(String(a[0]).split('/')[0] || '0', 10);
		const bi = parseInt(String(b[0]).split('/')[0] || '0', 10);
		return ai - bi;
	});

	return {
		categories: sorted.map(([k]) => k),
		matriculados: sorted.map(([, v]) => v.mat),
		colocados: sorted.map(([, v]) => v.col)
	};
}

/**
 * Comparação entre anos letivos (ignora filtro de ano; respeita escola/curso).
 * @param {Record<string, unknown>[]} chartRows
 * @param {string} [highlightedYear] Ano letivo selecionado nos filtros
 */
export function computeEvolutionChartData(chartRows, highlightedYear = '') {
	const yearData = computeYearEvolution(chartRows);
	const yearCount = yearData.categories.length;

	return {
		title: 'Comparação por ano letivo',
		subtitle:
			yearCount > 1
				? 'Evolução de matriculados e colocados entre anos letivos'
				: 'Apenas um ano letivo disponível para os filtros selecionados',
		highlightedYear,
		...yearData
	};
}

/** @param {{ name: string, value: number }[]} slices */
function sumSliceValues(slices) {
	return slices.reduce((acc, item) => acc + item.value, 0);
}

/** @param {Record<string, unknown>[]} rows @param {'matriculados' | 'candidatos'} metric */
function buildViaSlices(rows, metric) {
	let cna = 0;
	let concursos = 0;
	let regimesEsp = 0;
	let internacional = 0;
	let reingresso = 0;

	for (const row of rows) {
		if (metric === 'matriculados') {
			cna += Number(row.totalMatriculadosCna) || 0;
			concursos +=
				(Number(row.over23Matriculados) || 0) +
				(Number(row.cetMatriculados) || 0) +
				(Number(row.ctespMatriculados) || 0) +
				(Number(row.otherHigherMatriculados) || 0) +
				(Number(row.dualCertMatriculados) || 0);
			regimesEsp += Number(row.regimesEspMatriculados) || 0;
			internacional += Number(row.internationalMatriculados) || 0;
			reingresso +=
				(Number(row.reingressoAno1) || 0) +
				(Number(row.reingressoAno2) || 0) +
				(Number(row.reingressoAno3) || 0) +
				(Number(row.reingressoAno4) || 0) +
				(Number(row.mudancaColocadosMatriculados) || 0);
		} else {
			cna += Number(row.totalCandidatosCna) || 0;
			concursos +=
				(Number(row.over23Candidatos) || 0) +
				(Number(row.cetCandidatos) || 0) +
				(Number(row.ctespCandidatos) || 0) +
				(Number(row.otherHigherCandidatos) || 0) +
				(Number(row.dualCertCandidatos) || 0);
			regimesEsp += Number(row.regimesEspCandidatos) || 0;
			internacional += Number(row.internationalCandidatos) || 0;
			reingresso += (Number(row.reingressoCandidatos) || 0) + (Number(row.mudancaCandidatos) || 0);
		}
	}

	return [
		{ name: 'Regime nacional', value: cna },
		{ name: 'Concursos esp.', value: concursos },
		{ name: 'Regimes especiais', value: regimesEsp },
		{ name: 'Internacional', value: internacional },
		{ name: 'Reingresso / mudança', value: reingresso }
	];
}

/**
 * Donut por via — usa matriculados; se ano novo/sem matriculados, mostra candidatos.
 * @param {Record<string, unknown>[]} rows
 */
export function computeViaAcessoDistribution(rows) {
	const matriculadosSlices = buildViaSlices(rows, 'matriculados').filter((item) => item.value > 0);

	if (sumSliceValues(matriculadosSlices) > 0) {
		return {
			slices: matriculadosSlices,
			title: 'Matriculados por via',
			subtitleHint: 'Distribuição de matriculados'
		};
	}

	const candidatosSlices = buildViaSlices(rows, 'candidatos').filter((item) => item.value > 0);

	if (sumSliceValues(candidatosSlices) > 0) {
		return {
			slices: candidatosSlices,
			title: 'Candidatos por via',
			subtitleHint: 'Sem matriculados — a mostrar candidatos'
		};
	}

	return {
		slices: [],
		title: 'Matriculados por via',
		subtitleHint: 'Sem matriculados nem candidatos registados'
	};
}

/**
 * @param {{ categories: string[], matriculados: number[], colocados: number[], highlightedYear?: string, title?: string, subtitle?: string }} data
 */
export function buildLineChartOption(data) {
	const highlightedYear = data.highlightedYear ?? '';
	const sparseAxis = data.categories.length <= 2;
	const hasData =
		data.matriculados.some((v) => v > 0) || data.colocados.some((v) => v > 0);

	return {
		color: [CHART_COLOR_BLUE, CHART_COLOR_GREEN],
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
			data: ['Matriculados', 'Colocados'],
			top: 4,
			textStyle: { color: '#495057', fontSize: 12 }
		},
		xAxis: {
			type: 'category',
			data: data.categories,
			boundaryGap: sparseAxis,
			axisLine: { lineStyle: { color: '#dee2e6' } },
			axisLabel: {
				fontSize: 11,
				formatter: (/** @type {string} */ value) =>
					value === highlightedYear ? `{hl|${value}}` : value,
				rich: {
					hl: { color: CHART_COLOR_BLUE, fontWeight: 'bold' }
				},
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
		graphic: hasData
			? []
			: [
					{
						type: 'text',
						left: 'center',
						top: 'middle',
						style: {
							text: 'Sem dados\npara este ano letivo',
							fill: '#868e96',
							fontSize: 13,
							lineHeight: 20,
							textAlign: 'center'
						}
					}
				],
		series: hasData
			? [
					{
						name: 'Matriculados',
						type: 'line',
						smooth: true,
						symbol: 'circle',
						symbolSize: 7,
						lineStyle: { width: 2.5, color: CHART_COLOR_BLUE },
						itemStyle: { color: CHART_COLOR_BLUE },
						areaStyle: { color: hexWithAlpha(CHART_COLOR_BLUE, 0.12) },
						data: data.matriculados
					},
					{
						name: 'Colocados',
						type: 'line',
						smooth: true,
						symbol: 'circle',
						symbolSize: 7,
						lineStyle: { width: 2.5, color: CHART_COLOR_GREEN },
						itemStyle: { color: CHART_COLOR_GREEN },
						areaStyle: { color: hexWithAlpha(CHART_COLOR_GREEN, 0.12) },
						data: data.colocados
					}
				]
			: []
	};
}

/** @param {{ name: string, value: number }[]} slices */
export function buildDonutChartOption(slices) {
	const hasData = slices.length > 0 && sumSliceValues(slices) > 0;
	const manySlices = slices.length > 4;

	return {
		color: DASHBOARD_CHART_PALETTE,
		tooltip: hasData
			? {
					trigger: 'item',
					formatter: '{b}: {c} ({d}%)',
					backgroundColor: '#fff',
					borderColor: '#cfe2ff',
					textStyle: { color: '#212529', fontSize: 12 }
				}
			: { show: false },
		legend: {
			show: hasData,
			type: 'scroll',
			orient: manySlices ? 'horizontal' : 'vertical',
			...(manySlices
				? { bottom: 0, left: 'center', width: '92%' }
				: { right: 0, top: 'middle' }),
			textStyle: { color: '#495057', fontSize: manySlices ? 10 : 11 }
		},
		graphic: hasData
			? []
			: [
					{
						type: 'text',
						left: 'center',
						top: 'middle',
						style: {
							text: 'Sem dados\npara este ano letivo',
							fill: '#868e96',
							fontSize: 13,
							lineHeight: 20,
							textAlign: 'center'
						}
					}
				],
		series: hasData
			? [
					{
						name: 'Distribuição',
						type: 'pie',
						radius: manySlices ? ['36%', '54%'] : ['42%', '68%'],
						center: manySlices ? ['50%', '44%'] : ['38%', '50%'],
						avoidLabelOverlap: true,
						itemStyle: { borderColor: '#fff', borderWidth: 2 },
						label: { show: false },
						emphasis: {
							label: { show: true, fontSize: 12, fontWeight: 'bold' }
						},
						data: slices
					}
				]
			: []
	};
}
