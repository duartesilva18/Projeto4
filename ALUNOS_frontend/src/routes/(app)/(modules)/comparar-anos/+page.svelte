<script>
	// @ts-nocheck — Chart.js via CDN em window.Chart
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { pageTitle } from '$lib/runes/pageTitle.rune.svelte';
	import Breadcrum from '$lib/components/Breadcrum.svelte';
	import { TABLE_TYPES, METRIC_PRINCIPAIS } from './compareTableConfig.js';

	/** Tipos clássicos apenas: linhas e barras verticais (alternados pelos 8 indicadores). */
	const PANEL_CHART_TYPES = /** @type {const} */ ([
		'line',
		'bar',
		'line',
		'bar',
		'line',
		'bar',
		'line',
		'bar'
	]);

	const CHART_PALETTE = {
		fill: ['rgba(13, 110, 253, 0.75)', 'rgba(25, 135, 84, 0.75)', 'rgba(111, 66, 193, 0.75)'],
		stroke: ['rgb(13, 110, 253)', 'rgb(25, 135, 84)', 'rgb(111, 66, 193)']
	};
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	/** @typedef {Record<string, unknown> & { schoolName?: string, courseName?: string, courseCode?: string, anoLetivoInicio?: number, anoLetivoFim?: number }} Linha */

	let linhas = $derived(
		Array.isArray(/** @type {any} */ (data).linhas) ? /** @type {Linha[]} */ (/** @type {any} */ (data).linhas) : []
	);
	let escolasBd = $derived(
		Array.isArray(/** @type {any} */ (data).escolas) ? /** @type {any[]} */ (/** @type {any} */ (data).escolas) : []
	);
	let cursosBd = $derived(
		Array.isArray(/** @type {any} */ (data).cursos) ? /** @type {any[]} */ (/** @type {any} */ (data).cursos) : []
	);

	/** Escola selecionada nos filtros opcionais (tem de existir antes de cursosDisponiveis) */
	let optEscola = $state('all');
	let optCurso = $state('all');

	let anosDisponiveis = $derived.by(() => {
		const anoSet = new Set();
		for (const l of linhas) {
			const ini = l.anoLetivoInicio;
			const fim = l.anoLetivoFim;
			if (ini != null && fim != null) anoSet.add(`${ini}/${fim}`);
		}
		return [...anoSet].sort((a, b) => {
			const ai = parseInt(String(a).split('/')[0] || '0', 10);
			const bi = parseInt(String(b).split('/')[0] || '0', 10);
			return bi - ai;
		});
	});

	let escolasDisponiveis = $derived.by(() => {
		if (escolasBd.length > 0) return escolasBd.map((e) => e.nome).sort();
		const s = new Set();
		for (const l of linhas) {
			if (l.schoolName) s.add(l.schoolName);
		}
		return [...s].sort();
	});

	let cursosDisponiveis = $derived.by(() => {
		if (cursosBd.length > 0) {
			const list =
				optEscola === 'all' ? cursosBd : cursosBd.filter((c) => c.escola === optEscola);
			return list.map((c) => c.nome).sort();
		}
		const s = new Set();
		for (const l of linhas) {
			if (!l.courseName) continue;
			if (optEscola !== 'all' && l.schoolName !== optEscola) continue;
			s.add(l.courseName);
		}
		return [...s].sort();
	});

	/** Sincronizado com `?vista=graficos` na URL (F5 mantém a vista). */
	let viewMode = $derived(
		$page.url.searchParams.get('vista') === 'graficos' ? 'graficos' : 'dados'
	);

	function setCompararView(/** @type {'dados' | 'graficos'} */ mode) {
		const p = get(page);
		const u = new URL(p.url.href);
		if (mode === 'graficos') {
			u.searchParams.set('vista', 'graficos');
		} else {
			u.searchParams.delete('vista');
		}
		const target = `${u.pathname}${u.search}${u.hash}`;
		void goto(target, { replaceState: true, noScroll: true, keepFocus: true });
	}

	/** Chave do campo a comparar (uma métrica — A, B, C + Δ₁ = B−A + Δ₂ = C−B) */
	let metricKey = $state('totalCandidatosCna');

	/** @type {'abs_desc' | 'abs_asc' | 'nome'} */
	let sortMode = $state('abs_desc');

	/** Anos a comparar — atualizam a vista logo que mudas */
	let anoA = $state('');
	let anoB = $state('');
	let anoC = $state('');
	let aplicadoEscola = $state('all');
	let aplicadoCurso = $state('all');

	let pesquisaTexto = $state('');
	let pageSize = $state(50);
	let pageIndex = $state(0);

	let inicializado = $state(false);

	let metricMeta = $derived.by(() => {
		const p = METRIC_PRINCIPAIS.find((m) => m.key === metricKey);
		if (p) return { label: p.label, key: p.key };
		for (const t of TABLE_TYPES) {
			const f = t.fields.find((x) => x.key === metricKey);
			if (f) return { label: f.label, key: f.key };
		}
		const fb = METRIC_PRINCIPAIS[0];
		return { label: fb?.label ?? '—', key: fb?.key ?? metricKey };
	});

	$effect(() => {
		if (anosDisponiveis.length >= 3 && !inicializado) {
			anoA = anosDisponiveis[2];
			anoB = anosDisponiveis[1];
			anoC = anosDisponiveis[0];
			inicializado = true;
		} else if (anosDisponiveis.length === 2 && !inicializado) {
			anoA = anosDisponiveis[1];
			anoB = anosDisponiveis[0];
			anoC = anosDisponiveis[0];
			inicializado = true;
		} else if (anosDisponiveis.length === 1 && !inicializado) {
			anoA = anosDisponiveis[0];
			anoB = anosDisponiveis[0];
			anoC = anosDisponiveis[0];
			inicializado = true;
		}
	});

	$effect(() => {
		sidebarOptions.currentModule = 'Proposta de Vagas';
		sidebarOptions.currentModuleId = 1;
		sidebarOptions.currentObject = 'Comparar anos';
		sidebarOptions.currentObjectId = 51;
		pageTitle.title = 'Comparar anos';
	});

	$effect(() => {
		void metricKey;
		pageIndex = 0;
	});

	function aplicarOpcionais() {
		aplicadoEscola = optEscola;
		aplicadoCurso = optCurso;
		pageIndex = 0;
	}

	/** @param {Linha} r */
	function anoLabel(r) {
		if (r.anoLetivoInicio == null || r.anoLetivoFim == null) return '';
		return `${r.anoLetivoInicio}/${r.anoLetivoFim}`;
	}

	/** @param {Linha} r */
	function keyRow(r) {
		const sc = (r.schoolName || '').trim().toLowerCase();
		const code = (r.courseCode || '').toString().trim();
		const name = (r.courseName || '').trim().toLowerCase();
		return code ? `${sc}|||${code}` : `${sc}|||${name}`;
	}

	/**
	 * @param {Linha[]} rows
	 * @param {string} anoL
	 * @param {string} escola
	 * @param {string} curso
	 */
	function filterRows(rows, anoL, escola, curso) {
		return rows.filter((r) => {
			if (anoLabel(r) !== anoL) return false;
			if (escola !== 'all' && r.schoolName !== escola) return false;
			if (curso !== 'all' && r.courseName !== curso) return false;
			return true;
		});
	}

	/** @param {Linha | undefined} row @param {string} key */
	function num(row, key) {
		if (!row) return null;
		const v = /** @type {Record<string, unknown>} */ (row)[key];
		if (v == null || v === '') return 0;
		const n = Number(v);
		return Number.isFinite(n) ? n : 0;
	}

	/**
	 * Totais agregados A/B/C para uma métrica (soma ou média em % ocupação).
	 * @param {Array<{ rowA?: Linha, rowB?: Linha, rowC?: Linha }>} pairs
	 * @param {string} key
	 */
	function aggregateTotalsABC(pairs, key) {
		if (key === 'percOcupacaoCna') {
			let sA = 0,
				cA = 0,
				sB = 0,
				cB = 0,
				sC = 0,
				cC = 0;
			for (const p of pairs) {
				if (p.rowA) {
					const v = num(p.rowA, key);
					if (v != null) {
						sA += v;
						cA++;
					}
				}
				if (p.rowB) {
					const v = num(p.rowB, key);
					if (v != null) {
						sB += v;
						cB++;
					}
				}
				if (p.rowC) {
					const v = num(p.rowC, key);
					if (v != null) {
						sC += v;
						cC++;
					}
				}
			}
			return {
				vA: cA ? Math.round((sA / cA) * 10) / 10 : 0,
				vB: cB ? Math.round((sB / cB) * 10) / 10 : 0,
				vC: cC ? Math.round((sC / cC) * 10) / 10 : 0
			};
		}
		return {
			vA: pairs.reduce((s, p) => s + (num(p.rowA, key) ?? 0), 0),
			vB: pairs.reduce((s, p) => s + (num(p.rowB, key) ?? 0), 0),
			vC: pairs.reduce((s, p) => s + (num(p.rowC, key) ?? 0), 0)
		};
	}

	/** @param {number | null} v @param {string} key */
	function formatCell(v, key) {
		if (v === null) return '—';
		if (key === 'percOcupacaoCna') return v.toLocaleString('pt-PT', { maximumFractionDigits: 1 });
		if (Number.isInteger(v)) return String(v);
		return v.toLocaleString('pt-PT', { maximumFractionDigits: 2 });
	}

	/** Δ₁ = (B) − (A) @param {{ rowA: Linha | undefined, rowB: Linha | undefined }} pair */
	function deltaBA(pair, key) {
		if (!pair.rowA || !pair.rowB) return null;
		const va = num(pair.rowA, key);
		const vb = num(pair.rowB, key);
		if (va === null || vb === null) return null;
		return vb - va;
	}

	/** Δ₂ = (C) − (B) @param {{ rowB: Linha | undefined, rowC: Linha | undefined }} pair */
	function deltaCB(pair, key) {
		if (!pair.rowB || !pair.rowC) return null;
		const vb = num(pair.rowB, key);
		const vc = num(pair.rowC, key);
		if (vb === null || vc === null) return null;
		return vc - vb;
	}

	/** Ordenação por maior/menor alteração em qualquer um dos saltos A→B ou B→C. */
	function absSortScore(pair, key) {
		const d1 = deltaBA(pair, key);
		const d2 = deltaCB(pair, key);
		if (d1 === null && d2 === null) return -1;
		const a1 = d1 === null ? 0 : Math.abs(d1);
		const a2 = d2 === null ? 0 : Math.abs(d2);
		return Math.max(a1, a2);
	}

	/** @param {string} code */
	function displayCode(code) {
		if (code == null || code === '') return '—';
		return String(code);
	}

	let joined = $derived.by(() => {
		const yA = anoA;
		const yB = anoB;
		const yC = anoC;
		if (!yA || !yB || !yC) {
			return /** @type {{ key: string, rowA: Linha | undefined, rowB: Linha | undefined, rowC: Linha | undefined, displaySchool: string, displayCourse: string, displayCode: string }[]} */ ([]);
		}

		const a = filterRows(linhas, yA, aplicadoEscola, aplicadoCurso);
		const b = filterRows(linhas, yB, aplicadoEscola, aplicadoCurso);
		const c = filterRows(linhas, yC, aplicadoEscola, aplicadoCurso);
		const mapA = new Map();
		const mapB = new Map();
		const mapC = new Map();
		for (const r of a) mapA.set(keyRow(r), r);
		for (const r of b) mapB.set(keyRow(r), r);
		for (const r of c) mapC.set(keyRow(r), r);
		const keys = [...new Set([...mapA.keys(), ...mapB.keys(), ...mapC.keys()])].sort();
		return keys.map((k) => {
			const rowA = mapA.get(k);
			const rowB = mapB.get(k);
			const rowC = mapC.get(k);
			const code = rowA?.courseCode || rowB?.courseCode || rowC?.courseCode;
			return {
				key: k,
				rowA,
				rowB,
				rowC,
				displaySchool: rowA?.schoolName || rowB?.schoolName || rowC?.schoolName || '',
				displayCourse: rowA?.courseName || rowB?.courseName || rowC?.courseName || '',
				displayCode: code != null ? String(code) : ''
			};
		});
	});

	let joinedFiltered = $derived.by(() => {
		const q = pesquisaTexto.trim().toLowerCase();
		if (!q) return joined;
		return joined.filter((p) => {
			const esc = (p.displaySchool || '').toLowerCase();
			const cur = (p.displayCourse || '').toLowerCase();
			const cod = (p.displayCode || '').toLowerCase();
			return esc.includes(q) || cur.includes(q) || cod.includes(q);
		});
	});

	let joinedSorted = $derived.by(() => {
		const arr = [...joinedFiltered];
		const key = metricKey;
		if (sortMode === 'nome') {
			arr.sort(
				(a, b) =>
					(a.displaySchool || '').localeCompare(b.displaySchool || '', 'pt') ||
					(a.displayCourse || '').localeCompare(b.displayCourse || '', 'pt')
			);
			return arr;
		}
		const absFor = (p) => absSortScore(p, key);
		if (sortMode === 'abs_desc') {
			arr.sort((a, b) => absFor(b) - absFor(a));
			return arr;
		}
		arr.sort((a, b) => {
			const va = absFor(a);
			const vb = absFor(b);
			if (va < 0 && vb >= 0) return 1;
			if (vb < 0 && va >= 0) return -1;
			return va - vb;
		});
		return arr;
	});

	let effectivePageSize = $derived(pageSize === 0 ? Math.max(joinedSorted.length, 1) : pageSize);

	let totalPages = $derived(Math.max(1, Math.ceil(joinedSorted.length / effectivePageSize)));

	let joinedPage = $derived.by(() => {
		if (pageSize === 0) return joinedSorted;
		const start = pageIndex * effectivePageSize;
		return joinedSorted.slice(start, start + effectivePageSize);
	});

	$effect(() => {
		const maxIdx = Math.max(0, totalPages - 1);
		if (pageIndex > maxIdx) pageIndex = maxIdx;
	});

	function prevPage() {
		pageIndex = Math.max(0, pageIndex - 1);
	}

	function nextPage() {
		pageIndex = Math.min(totalPages - 1, pageIndex + 1);
	}

	let rangeStart = $derived.by(() => {
		if (joinedSorted.length === 0) return 0;
		return pageIndex * effectivePageSize + 1;
	});

	let rangeEnd = $derived.by(() => {
		if (joinedSorted.length === 0) return 0;
		return Math.min((pageIndex + 1) * effectivePageSize, joinedSorted.length);
	});

	let chartYearLabels = $derived([anoA || 'Ano A', anoB || 'Ano B', anoC || 'Ano C']);

	/** Um conjunto vA/vB/vC por indicador principal (para grelha de gráficos). */
	let totalsByMetric = $derived.by(() => {
		const labels = chartYearLabels;
		return METRIC_PRINCIPAIS.map((m, i) => {
			const t = aggregateTotalsABC(joinedFiltered, m.key);
			const chartType = PANEL_CHART_TYPES[i] ?? 'line';
			return {
				key: m.key,
				label: m.label,
				vA: t.vA,
				vB: t.vB,
				vC: t.vC,
				labels,
				data: [t.vA, t.vB, t.vC],
				chartType
			};
		});
	});

	/**
	 * Painel de gráfico (vários tipos Chart.js 2).
	 * @param {HTMLCanvasElement} node
	 * @param {{ labels: string[], data: number[], datasetLabel: string, chartType?: 'line' | 'bar' } | null} payload
	 */
	function cmpPanelChart(node, payload) {
		let chart = null;

		function tooltipLabel(tooltipItem, data) {
			const ds = data.datasets[tooltipItem.datasetIndex];
			const v = ds.data[tooltipItem.index];
			return `${ds.label}: ${v}`;
		}

		function render(p) {
			if (chart) {
				chart.destroy();
				chart = null;
			}
			if (!p || typeof window === 'undefined' || !window.Chart) return;
			const ctx = node.getContext('2d');
			if (!ctx) return;

			const kind = p.chartType === 'bar' ? 'bar' : 'line';
			const baseTooltip = {
				callbacks: {
					label: tooltipLabel
				}
			};

			/** @type {any} */
			let config;

			if (kind === 'bar') {
				config = {
					type: 'bar',
					data: {
						labels: p.labels,
						datasets: [
							{
								label: p.datasetLabel,
								data: p.data,
								backgroundColor: CHART_PALETTE.fill,
								borderColor: CHART_PALETTE.stroke,
								borderWidth: 1
							}
						]
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						legend: { display: false },
						scales: {
							yAxes: [
								{
									ticks: { beginAtZero: true, fontSize: 11 },
									gridLines: { color: 'rgba(0,0,0,0.07)' }
								}
							],
							xAxes: [{ ticks: { fontSize: 11 }, gridLines: { display: false } }]
						},
						tooltips: baseTooltip
					}
				};
			} else {
				config = {
					type: 'line',
					data: {
						labels: p.labels,
						datasets: [
							{
								label: p.datasetLabel,
								data: p.data,
								borderColor: CHART_PALETTE.stroke[0],
								backgroundColor: 'rgba(13, 110, 253, 0.1)',
								pointBackgroundColor: '#fff',
								pointBorderColor: CHART_PALETTE.stroke[0],
								pointBorderWidth: 2,
								pointRadius: 6,
								fill: true,
								lineTension: 0.25
							}
						]
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						legend: { display: false },
						scales: {
							yAxes: [
								{
									ticks: { beginAtZero: true, fontSize: 11 },
									gridLines: { color: 'rgba(0,0,0,0.07)' }
								}
							],
							xAxes: [
								{
									ticks: { fontSize: 11, maxRotation: 40, minRotation: 0 },
									gridLines: { display: false }
								}
							]
						},
						tooltips: baseTooltip
					}
				};
			}

			chart = new window.Chart(ctx, config);
		}
		render(payload);
		return {
			update(p) {
				render(p);
			},
			destroy() {
				if (chart) {
					chart.destroy();
					chart = null;
				}
			}
		};
	}
</script>

<Breadcrum modulo="Proposta de Vagas" objeto="Comparar anos" />

<div class="container-fluid comparar-anos-wrap">
	<p class="text-muted small mb-3">
		Comparação entre <strong>três anos letivos</strong> (A, B e C), com <strong>indicadores principais</strong>.
		<strong>Δ₁ = (B) − (A)</strong> e <strong>Δ₂ = (C) − (B)</strong>.
	</p>

	<div class="row g-2 align-items-end mb-3 filter-row filter-controls">
		<div class="col-6 col-md-2">
			<label class="form-label" for="cmp-ano-a">Ano A</label>
			<select id="cmp-ano-a" class="form-control form-control-sm" bind:value={anoA}>
				{#if anosDisponiveis.length === 0}
					<option value="">—</option>
				{:else}
					{#each anosDisponiveis as ano}
						<option value={ano}>{ano}</option>
					{/each}
				{/if}
			</select>
		</div>
		<div class="col-6 col-md-2">
			<label class="form-label" for="cmp-ano-b">Ano B</label>
			<select id="cmp-ano-b" class="form-control form-control-sm" bind:value={anoB}>
				{#if anosDisponiveis.length === 0}
					<option value="">—</option>
				{:else}
					{#each anosDisponiveis as ano}
						<option value={ano}>{ano}</option>
					{/each}
				{/if}
			</select>
		</div>
		<div class="col-6 col-md-2">
			<label class="form-label" for="cmp-ano-c">Ano C</label>
			<select id="cmp-ano-c" class="form-control form-control-sm" bind:value={anoC}>
				{#if anosDisponiveis.length === 0}
					<option value="">—</option>
				{:else}
					{#each anosDisponiveis as ano}
						<option value={ano}>{ano}</option>
					{/each}
				{/if}
			</select>
		</div>
		<div class="col-12 col-md-3">
			<label class="form-label mb-1" for="cmp-pesquisa">Filtrar linhas (texto)</label>
			<div class="d-flex align-items-end">
				<input
					id="cmp-pesquisa"
					type="search"
					class="form-control form-control-sm cmp-search-input"
					placeholder="Escola, curso ou código DGES…"
					bind:value={pesquisaTexto}
					autocomplete="off"
				/>
				<button
					type="button"
					class="btn btn-primary btn-sm filter-apply-icon"
					aria-label="Aplicar filtros"
					onclick={() => {
						pageIndex = 0;
						document.getElementById('cmp-pesquisa')?.focus();
					}}
				>
					<i class="fa fa-search" aria-hidden="true"></i>
				</button>
			</div>
		</div>
		<div class="col-12 col-md-3 d-flex align-items-end justify-content-md-end">
			<div class="btn-group" role="group" aria-label="Modo">
				<button
					type="button"
					class="btn btn-sm {viewMode === 'dados' ? 'btn-primary' : 'btn-outline-primary'}"
					onclick={() => setCompararView('dados')}
				>
					Tabela
				</button>
				<button
					type="button"
					class="btn btn-sm {viewMode === 'graficos' ? 'btn-primary' : 'btn-outline-primary'}"
					onclick={() => setCompararView('graficos')}
				>
					Gráfico
				</button>
			</div>
		</div>
	</div>

	<div class="card mb-3 metric-card">
		<div class="card-body py-3">
			<span class="form-label d-block mb-2">Indicador principal</span>
			<div class="d-flex flex-wrap gap-1">
				{#each METRIC_PRINCIPAIS as q}
					<button
						type="button"
						class="btn btn-sm cmp-metric-chip {metricKey === q.key ? 'btn-primary' : 'btn-outline-secondary'}"
						onclick={() => (metricKey = q.key)}
					>
						{q.label}
					</button>
				{/each}
			</div>
			<p class="small text-muted mt-2 mb-0">
				<strong>A comparar:</strong> {metricMeta.label}
			</p>
		</div>
	</div>

	<details class="cmp-details mb-3">
		<summary class="cmp-details-summary">
			Filtros opcionais <span class="cmp-details-summary-sub">(escola, curso, ordenação)</span>
		</summary>
		<div class="cmp-details-panel">
			<div class="row g-3 cmp-details-grid align-items-end">
				<div class="col-12 col-md-4 col-lg-3">
					<label class="form-label cmp-details-label" for="cmp-opt-escola">Escola</label>
					<select id="cmp-opt-escola" class="form-control form-control-sm cmp-details-select" bind:value={optEscola}>
						<option value="all">Todas</option>
						{#each escolasDisponiveis as escola}
							<option value={escola}>{escola}</option>
						{/each}
					</select>
				</div>
				<div class="col-12 col-md-4 col-lg-4">
					<label class="form-label cmp-details-label" for="cmp-opt-curso">Curso</label>
					<select id="cmp-opt-curso" class="form-control form-control-sm cmp-details-select" bind:value={optCurso}>
						<option value="all">Todos</option>
						{#each cursosDisponiveis as curso}
							<option value={curso}>{curso}</option>
						{/each}
					</select>
				</div>
				<div class="col-12 col-md-4 col-lg-3">
					<label class="form-label cmp-details-label" for="cmp-sort">Ordenação</label>
					<select id="cmp-sort" class="form-control form-control-sm cmp-details-select" bind:value={sortMode}>
						<option value="abs_desc">Maior |Δ₁| ou |Δ₂| primeiro</option>
						<option value="abs_asc">Menor |Δ₁| ou |Δ₂| primeiro</option>
						<option value="nome">Nome (escola, curso)</option>
					</select>
				</div>
				<div class="col-12 col-lg-auto d-flex align-items-end">
					<button
						type="button"
						class="btn btn-primary btn-sm cmp-details-apply filter-apply-icon"
						title="Aplicar filtros"
						aria-label="Aplicar filtros escola e curso"
						onclick={aplicarOpcionais}
					>
						<i class="fa fa-search" aria-hidden="true"></i>
					</button>
				</div>
			</div>
			<p class="cmp-details-hint">
				Por defeito comparam-se <strong>todos os cursos</strong>. A ordenação na tabela aplica-se logo; escola e curso só após
				<strong>Aplicar filtros</strong>.
			</p>
		</div>
	</details>

	{#if anosDisponiveis.length === 0}
		<div class="text-center text-muted py-5">
			<i class="fa fa-info-circle fa-2x mb-2"></i>
			<p class="mb-0">Não há dados na tabela de vagas para comparar.</p>
		</div>
	{:else if !anoA || !anoB || !anoC}
		<div class="alert alert-info">Escolhe os três anos letivos (A, B e C).</div>
	{:else}
		<div class="card mb-3 cmp-toolbar-card">
			<div class="card-body py-3 cmp-toolbar-inner">
				{#if viewMode === 'dados'}
					<div class="cmp-toolbar-flex">
						<div class="cmp-page-size-block">
							<label class="form-label cmp-toolbar-label mb-1" for="cmp-page-size">Por página</label>
							<select
								id="cmp-page-size"
								class="form-control form-control-sm cmp-toolbar-select cmp-page-size-select"
								value={String(pageSize)}
								onchange={(e) => {
									pageSize = Number(e.currentTarget.value);
									pageIndex = 0;
								}}
							>
								<option value="25">25</option>
								<option value="50">50</option>
								<option value="100">100</option>
								<option value="200">200</option>
								<option value="0">Todos</option>
							</select>
						</div>
						<div class="cmp-pager-block">
							<span class="cmp-pager-meta">
								<strong>{joinedSorted.length}</strong> curso(s)
								{#if joinedSorted.length > 0 && pageSize !== 0}
									<span class="cmp-pager-sep">·</span>
									<span class="cmp-pager-range">{rangeStart}–{rangeEnd}</span>
									<span class="cmp-pager-sep">·</span>
									pág. <strong>{pageIndex + 1}</strong>/<strong>{totalPages}</strong>
								{/if}
							</span>
							{#if pageSize !== 0 && joinedSorted.length > 0}
								<div class="btn-group btn-group-sm cmp-pager-btns">
									<button type="button" class="btn btn-outline-primary" disabled={pageIndex <= 0} onclick={prevPage}>Anterior</button>
									<button
										type="button"
										class="btn btn-outline-primary"
										disabled={pageIndex >= totalPages - 1}
										onclick={nextPage}
									>
										Seguinte
									</button>
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<p class="small text-muted mb-0 cmp-toolbar-grafico-msg">
						Oito gráficos de linha <strong>lado a lado</strong> (grelha responsiva). Totais: soma ou média (% ocupação) sobre
						<strong>{joinedFiltered.length}</strong> curso(s) do filtro. Clica no título de um painel para sincronizar com os chips.
					</p>
				{/if}
			</div>
		</div>

		{#if viewMode === 'dados'}
			{#if joinedFiltered.length === 0}
				<p class="text-muted">Nenhum curso com estes critérios.</p>
			{:else}
				<div class="table-wrapper">
					<div class="cmp-scroll-wrap">
						<table class="gestao-table cmp-simple-table">
							<thead>
								<tr>
									<th class="header-main" colspan="8">
										{metricMeta.label} · Δ₁ = ({anoB}) − ({anoA}) · Δ₂ = ({anoC}) − ({anoB})
									</th>
								</tr>
								<tr>
									<th class="header-col text-left">Escola</th>
									<th class="header-col text-left">Curso</th>
									<th class="header-col">Cód.</th>
									<th class="header-col">{anoA}</th>
									<th class="header-col">{anoB}</th>
									<th class="header-col">{anoC}</th>
									<th class="header-col">Δ₁</th>
									<th class="header-col">Δ₂</th>
								</tr>
							</thead>
							<tbody>
								{#if joinedPage.length === 0}
									<tr>
										<td colspan="8" class="text-muted">Nada nesta página.</td>
									</tr>
								{:else}
									{#each joinedPage as pair, idx (pair.key)}
										{@const va = num(pair.rowA, metricKey)}
										{@const vb = num(pair.rowB, metricKey)}
										{@const vc = num(pair.rowC, metricKey)}
										{@const d1 = deltaBA(pair, metricKey)}
										{@const d2 = deltaCB(pair, metricKey)}
										<tr class={idx % 2 === 0 ? 'row-even' : 'row-odd'}>
											<td class="text-left td-wrap">{pair.displaySchool}</td>
											<td class="text-left td-wrap">{pair.displayCourse}</td>
											<td class="text-muted small">{displayCode(pair.displayCode)}</td>
											<td>{va === null ? '—' : formatCell(va, metricKey)}</td>
											<td>{vb === null ? '—' : formatCell(vb, metricKey)}</td>
											<td>{vc === null ? '—' : formatCell(vc, metricKey)}</td>
											<td
												class="td-delta"
												class:delta-pos={d1 != null && d1 > 0}
												class:delta-neg={d1 != null && d1 < 0}
											>
												{d1 === null ? '—' : formatCell(d1, metricKey)}
											</td>
											<td
												class="td-delta"
												class:delta-pos={d2 != null && d2 > 0}
												class:delta-neg={d2 != null && d2 < 0}
											>
												{d2 === null ? '—' : formatCell(d2, metricKey)}
											</td>
										</tr>
									{/each}
								{/if}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		{:else}
			<div class="cmp-charts-dashboard">
				<div class="cmp-charts-sidebyside">
					{#each totalsByMetric as tm (tm.key)}
						<div class="cmp-chart-panel" class:cmp-chart-panel--active={tm.key === metricKey}>
							<button
								type="button"
								class="cmp-chart-panel-head"
								onclick={() => (metricKey = tm.key)}
								aria-pressed={tm.key === metricKey}
							>
								{tm.label}
							</button>
							<div class="cmp-chart-panel-canvas">
								<canvas
									use:cmpPanelChart={{
										labels: tm.labels,
										data: tm.data,
										datasetLabel: tm.label,
										chartType: tm.chartType
									}}
									aria-label={`${tm.label}: gráfico ${tm.chartType}, anos ${tm.labels.join(', ')}`}
								></canvas>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.comparar-anos-wrap {
		padding: 24px;
	}
	.filter-row .form-label,
	.metric-card .form-label {
		font-size: 12px;
		font-weight: 600;
		margin-bottom: 4px;
	}
	.metric-card {
		border: 1px solid #dde3f0;
		box-shadow: 0 2px 4px rgba(15, 23, 42, 0.05);
	}
	.cmp-details {
		border: 1px solid #dde3f0;
		border-radius: 4px;
		background: #fff;
		overflow: hidden;
	}
	.cmp-details-summary {
		cursor: pointer;
		font-weight: 600;
		color: #0b5ed7;
		list-style: none;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.25rem 0.5rem;
		padding: 10px 14px;
		background: #fff;
		border-bottom: 1px solid transparent;
	}
	.cmp-details-summary::-webkit-details-marker {
		display: none;
	}
	.cmp-details-summary::before {
		content: '';
		display: inline-block;
		width: 0;
		height: 0;
		border-style: solid;
		border-width: 5px 0 5px 7px;
		border-color: transparent transparent transparent #0b5ed7;
		margin-right: 4px;
		flex-shrink: 0;
	}
	details[open].cmp-details > .cmp-details-summary::before {
		transform: rotate(90deg);
	}
	details[open].cmp-details > .cmp-details-summary {
		border-bottom-color: #dde3f0;
	}
	.cmp-details-summary-sub {
		font-weight: 500;
		color: #6c757d;
		font-size: 0.92em;
	}
	.cmp-details-panel {
		padding: 14px 14px 12px;
		background: #fff;
	}
	.cmp-details-label {
		font-size: 12px;
		color: #6c757d;
		font-weight: 600;
		margin-bottom: 4px;
	}
	.cmp-details-select.form-control-sm {
		border-radius: 4px;
		min-height: 36px;
		height: auto;
	}
	/* Igual ao botão da lupa na linha de filtros (altura e padding) */
	.cmp-details-panel .btn.filter-apply-icon.cmp-details-apply {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 36px;
		padding-left: 70px;
		padding-right: 70px;
		line-height: 36px;
		margin-left: 0;
		border-radius: 4px;
	}
	.cmp-details-panel .btn.filter-apply-icon.cmp-details-apply i {
		font-size: 16px;
		line-height: 1;
	}
	.cmp-details-hint {
		font-size: 12px;
		color: #6c757d;
		margin: 12px 0 0;
		line-height: 1.45;
	}
	.cmp-metric-chip {
		line-height: 1.25;
		text-align: left;
		white-space: normal;
		max-width: 100%;
	}
	.cmp-toolbar-card {
		border: 1px solid #dde3f0;
		box-shadow: 0 2px 4px rgba(15, 23, 42, 0.05);
	}
	/* Linha Ano A / Ano B / pesquisa + lupa (igual proposta de vagas) */
	.filter-row.filter-controls .form-label {
		font-size: 12px;
		color: #6c757d;
		margin-bottom: 2px;
		font-weight: 600;
	}
	.filter-row.filter-controls select.form-control-sm {
		border-radius: 4px;
		min-height: 36px;
		height: 36px;
	}
	.filter-row.filter-controls input.form-control-sm.cmp-search-input {
		border-radius: 4px;
		min-height: 36px;
		height: 36px;
	}
	.filter-row.filter-controls .btn {
		border-radius: 4px;
	}
	.filter-row.filter-controls .btn.filter-apply-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 36px;
		padding-left: 70px;
		padding-right: 70px;
		line-height: 36px;
		margin-left: 30px;
	}
	.filter-row.filter-controls .btn.filter-apply-icon i {
		font-size: 16px;
		line-height: 1;
	}
	.cmp-toolbar-flex {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem 1.25rem;
	}
	.cmp-page-size-block {
		flex: 0 0 auto;
	}
	.cmp-toolbar-label {
		font-size: 12px;
		color: #6c757d;
		margin-bottom: 2px;
		font-weight: 600;
	}
	.cmp-page-size-select {
		width: auto;
		min-width: 4.25rem;
		max-width: 5.5rem;
	}
	.cmp-pager-block {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.65rem 1rem;
		justify-content: flex-end;
		flex: 1 1 auto;
		min-width: 0;
	}
	.cmp-pager-meta {
		font-size: 13px;
		color: #5c6570;
		line-height: 1.4;
	}
	.cmp-pager-sep {
		color: #adb5bd;
		margin: 0 0.15em;
	}
	.cmp-pager-range {
		font-weight: 600;
		color: #343a40;
	}
	.cmp-pager-btns .btn {
		border-radius: 4px;
		font-weight: 600;
	}
	.cmp-toolbar-grafico-msg {
		line-height: 1.45;
	}
	.cmp-toolbar-card select.cmp-toolbar-select.form-control-sm {
		border-radius: 4px;
		min-height: 36px;
		height: 36px;
	}
	.cmp-search-input {
		flex: 1 1 auto;
		min-width: 0;
	}
	.table-wrapper {
		border-radius: 4px;
		overflow: hidden;
		box-shadow: 0 2px 4px rgba(15, 23, 42, 0.05);
		background: #fff;
	}
	.cmp-scroll-wrap {
		max-height: min(75vh, 820px);
		overflow: auto;
	}
	.gestao-table {
		border-collapse: collapse;
		width: 100%;
		font-size: 13px;
		background: #fff;
	}
	.gestao-table th,
	.gestao-table td {
		border: 1px solid #dde3f0;
		padding: 10px 12px;
		vertical-align: middle;
	}
	.gestao-table .text-left {
		text-align: left;
	}
	.cmp-simple-table .header-col:nth-child(n + 4),
	.cmp-simple-table td:nth-child(n + 4) {
		text-align: center;
		white-space: nowrap;
	}
	.header-main {
		background: linear-gradient(to right, #0d6efd, #0b5ed7);
		color: #fff;
		font-weight: 700;
		font-size: 14px;
		padding: 12px 14px;
		text-align: left;
	}
	.header-col {
		background-color: #e7f1ff;
		color: #0b5ed7;
		font-weight: 600;
		font-size: 12px;
	}
	.row-even {
		background-color: #ffffff;
	}
	.row-odd {
		background-color: #f8f9ff;
	}
	.gestao-table tbody tr:hover {
		background-color: #eef2ff;
	}
	.td-wrap {
		max-width: 280px;
		line-height: 1.35;
	}
	.td-delta {
		font-weight: 600;
	}
	.delta-pos {
		color: #198754;
	}
	.delta-neg {
		color: #c0392b;
	}
	.cmp-charts-dashboard {
		width: 100%;
	}
	.cmp-charts-sidebyside {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 16px;
		align-items: stretch;
	}
	@media (max-width: 1199.98px) {
		.cmp-charts-sidebyside {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 575.98px) {
		.cmp-charts-sidebyside {
			grid-template-columns: 1fr;
		}
	}
	.cmp-chart-panel {
		border: 1px solid #dde3f0;
		border-radius: 6px;
		background: #fff;
		box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
		display: flex;
		flex-direction: column;
		min-width: 0;
		overflow: hidden;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}
	.cmp-chart-panel--active {
		border-color: #0d6efd;
		box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.22);
	}
	.cmp-chart-panel-head {
		display: block;
		width: 100%;
		text-align: left;
		border: none;
		border-bottom: 1px solid #e8ecf4;
		background: #f8f9ff;
		font-size: 12px;
		font-weight: 600;
		line-height: 1.35;
		padding: 10px 12px;
		cursor: pointer;
		color: #1e3a5f;
	}
	.cmp-chart-panel-head:hover {
		background: #eef2ff;
	}
	.cmp-chart-panel-head:focus {
		outline: none;
		box-shadow: inset 0 0 0 2px rgba(13, 110, 253, 0.35);
	}
	.cmp-chart-panel-canvas {
		position: relative;
		flex: 1;
		min-height: 280px;
		height: 280px;
		padding: 10px 12px 14px;
	}
</style>
