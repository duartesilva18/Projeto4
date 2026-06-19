import {
	CHART_COLOR_BLUE,
	CHART_COLOR_ORANGE,
	hexWithAlpha
} from '../dashboard/dashboardChartColors.js';
import { metricLabel } from './iaMetricsConfig.js';

/**
 * Opção ECharts para o gráfico de previsão de uma métrica:
 * série sólida com o histórico + ponto/tracejado para o valor previsto.
 *
 * @param {string} metricId
 * @param {{ historico: number[], previsto: number | null }} metrica
 * @param {string[]} anosHistorico
 * @param {string} anoPrevisto
 */
export function buildForecastChartOption(metricId, metrica, anosHistorico, anoPrevisto) {
	const historico = Array.isArray(metrica?.historico) ? metrica.historico : [];
	const temPrevisao = metrica?.previsto != null;

	const categories = temPrevisao
		? [...anosHistorico, `${anoPrevisto} (prev.)`]
		: [...anosHistorico];

	const hasData = historico.some((v) => v > 0) || temPrevisao;

	// Série histórica: valores reais + null na posição da previsão.
	const serieHistorico = temPrevisao ? [...historico, null] : [...historico];

	// Série de previsão: liga o último ponto histórico ao valor previsto (tracejado).
	const ultimoHistorico = historico.length ? historico[historico.length - 1] : null;
	const seriePrevisao = temPrevisao
		? [...historico.map(() => null).slice(0, -1), ultimoHistorico, metrica.previsto]
		: [];

	return {
		color: [CHART_COLOR_BLUE, CHART_COLOR_ORANGE],
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
			data: ['Histórico', 'Previsão'],
			top: 4,
			textStyle: { color: '#495057', fontSize: 12 }
		},
		xAxis: {
			type: 'category',
			data: categories,
			boundaryGap: categories.length <= 2,
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
		graphic: hasData
			? []
			: [
					{
						type: 'text',
						left: 'center',
						top: 'middle',
						style: {
							text: 'Sem dados suficientes\npara previsão',
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
						name: 'Histórico',
						type: 'line',
						smooth: false,
						symbol: 'circle',
						symbolSize: 7,
						connectNulls: false,
						lineStyle: { width: 2.5, color: CHART_COLOR_BLUE },
						itemStyle: { color: CHART_COLOR_BLUE },
						areaStyle: { color: hexWithAlpha(CHART_COLOR_BLUE, 0.1) },
						data: serieHistorico
					},
					{
						name: 'Previsão',
						type: 'line',
						smooth: false,
						symbol: 'diamond',
						symbolSize: 9,
						connectNulls: true,
						lineStyle: { width: 2.5, type: 'dashed', color: CHART_COLOR_ORANGE },
						itemStyle: { color: CHART_COLOR_ORANGE },
						data: seriePrevisao
					}
				]
			: [],
		title: { show: false, text: metricLabel(metricId) }
	};
}
