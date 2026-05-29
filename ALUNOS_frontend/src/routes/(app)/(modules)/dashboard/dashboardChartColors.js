/** Paleta diversificada — azul, verde, vermelho, laranja, roxo, ciano, âmbar, rosa */
export const DASHBOARD_CHART_PALETTE = [
	'#2563eb',
	'#16a34a',
	'#dc2626',
	'#ea580c',
	'#9333ea',
	'#0891b2',
	'#ca8a04',
	'#db2777'
];

export const CHART_COLOR_BLUE = '#2563eb';
export const CHART_COLOR_GREEN = '#16a34a';
export const CHART_COLOR_RED = '#dc2626';
export const CHART_COLOR_ORANGE = '#ea580c';
export const CHART_COLOR_PURPLE = '#9333ea';
export const CHART_COLOR_CYAN = '#0891b2';

/** @param {number} index */
export function paletteColor(index) {
	return DASHBOARD_CHART_PALETTE[index % DASHBOARD_CHART_PALETTE.length];
}

/**
 * @param {string} hex
 * @param {number} alpha 0–1
 */
export function hexWithAlpha(hex, alpha) {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * @param {string} hex
 * @param {number} alphaHex e.g. '33' for ~20% opacity
 */
export function hexWithAlphaHex(hex, alphaHex) {
	return `${hex}${alphaHex}`;
}
