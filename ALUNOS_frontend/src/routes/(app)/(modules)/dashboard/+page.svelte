<script>
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { pageTitle } from '$lib/runes/pageTitle.rune.svelte';
	import Breadcrum from '$lib/components/Breadcrum.svelte';
	import EChart from './EChart.svelte';
	import {
		DASHBOARD_VIEW_GROUPS,
		DASHBOARD_KPI_CARDS,
		computeDashboardKpis,
		getViewLabel
	} from './dashboardViewConfig.js';
	import {
		filterRowsForCharts,
		computeEvolutionChartData,
		computeViaAcessoDistribution,
		buildLineChartOption,
		buildDonutChartOption
	} from './dashboardChartConfig.js';
	import { computeViewChartPanels } from './dashboardViewCharts.js';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { tick } from 'svelte';

	/** @param {string} msg @param {string} [title] */
	async function toastError(msg, title = 'ERRO') {
		if (!browser) return;
		const mod = await import('toastr');
		mod.default?.error(msg, title, { timeOut: 8000, progressBar: true });
	}

	const DASHBOARD_FILTROS_STORAGE_KEY = 'dashboard-filtros-aplicados';
	const MAX_ANOS_DASHBOARD = 4;

	const DASHBOARD_VIEW_IDS = new Set(
		DASHBOARD_VIEW_GROUPS.flatMap((g) => g.options.map((o) => o.id))
	);

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
	/** @typedef {Record<string, unknown> & { anoLetivoInicio?: number, anoLetivoFim?: number, schoolName?: string, courseName?: string }} Linha */
	let linhas = $derived(Array.isArray(data.linhas) ? /** @type {Linha[]} */ (data.linhas) : []);
	let escolasBd = $derived(
		Array.isArray(/** @type {any} */ (data).escolas) ? /** @type {any[]} */ (/** @type {any} */ (data).escolas) : []
	);
	let cursosBd = $derived(
		Array.isArray(/** @type {any} */ (data).cursos) ? /** @type {any[]} */ (/** @type {any} */ (data).cursos) : []
	);

	let filtroAno = $state('');
	let filtroEscola = $state('all');
	let filtroCurso = $state('all');
	let filtroVisualizacao = $state('totais');

	let filtroAnoAplicado = $state('');
	let filtroEscolaAplicada = $state('all');
	let filtroCursoAplicado = $state('all');
	let filtroVisualizacaoAplicado = $state('totais');

	let filtrosInicializados = $state(false);

	/** @param {Linha} l */
	function anoLabelOf(l) {
		return l.anoLetivoInicio != null && l.anoLetivoFim != null
			? `${l.anoLetivoInicio}/${l.anoLetivoFim}`
			: '';
	}

	/**
	 * @param {Linha[]} rows
	 * @param {{ ano?: string, escola?: string, curso?: string }} f
	 */
	function filterLinhas(rows, f) {
		return rows.filter((l) => {
			const anoLabel = anoLabelOf(l);
			const matchAno = Boolean(f.ano) && anoLabel === f.ano;
			const matchEscola = !f.escola || f.escola === 'all' || l.schoolName === f.escola;
			const matchCurso = !f.curso || f.curso === 'all' || l.courseName === f.curso;
			return matchAno && matchEscola && matchCurso;
		});
	}

	function defaultAnoLetivo() {
		const currentYear = new Date().getFullYear();
		return (
			anosDisponiveis.find((a) => a.startsWith(`${currentYear}/`)) ?? anosDisponiveis[0] ?? ''
		);
	}

	/** @param {string} escola */
	function cursosParaEscola(escola) {
		const cursoSet = new Set();
		for (const l of linhas) {
			if (!l.courseName) continue;
			if (escola !== 'all' && l.schoolName !== escola) continue;
			cursoSet.add(l.courseName);
		}
		return Array.from(cursoSet).sort();
	}

	/** @param {{ ano?: string, escola?: string, curso?: string, viz?: string }} f */
	function normalizeFiltrosAplicados(f) {
		const ano = f.ano && anosDisponiveis.includes(f.ano) ? f.ano : defaultAnoLetivo();
		const escola =
			f.escola && f.escola !== 'all' && escolasDisponiveis.includes(f.escola) ? f.escola : 'all';
		const cursosEscola = cursosParaEscola(escola);
		const curso =
			f.curso && f.curso !== 'all' && cursosEscola.includes(f.curso) ? f.curso : 'all';
		const viz = f.viz && DASHBOARD_VIEW_IDS.has(f.viz) ? f.viz : 'totais';
		return { ano, escola, curso, viz };
	}

	function readFiltrosFromUrl() {
		const params = page.url.searchParams;
		return {
			ano: params.get('ano') ?? '',
			escola: params.get('escola') ?? 'all',
			curso: params.get('curso') ?? 'all',
			viz: params.get('viz') ?? 'totais'
		};
	}

	function readFiltrosFromStorage() {
		if (!browser) return null;
		try {
			const raw = sessionStorage.getItem(DASHBOARD_FILTROS_STORAGE_KEY);
			if (!raw) return null;
			const parsed = JSON.parse(raw);
			if (!parsed || typeof parsed !== 'object') return null;
			return /** @type {{ ano?: string, escola?: string, curso?: string, viz?: string }} */ (parsed);
		} catch {
			return null;
		}
	}

	/** @param {{ ano: string, escola: string, curso: string, viz: string }} filtros */
	function applyFiltrosState(filtros) {
		filtroAno = filtros.ano;
		filtroAnoAplicado = filtros.ano;
		filtroEscola = filtros.escola;
		filtroEscolaAplicada = filtros.escola;
		filtroCurso = filtros.curso;
		filtroCursoAplicado = filtros.curso;
		filtroVisualizacao = filtros.viz;
		filtroVisualizacaoAplicado = filtros.viz;
	}

	function persistFiltrosAplicados() {
		if (!browser) return;

		const payload = {
			ano: filtroAnoAplicado,
			escola: filtroEscolaAplicada,
			curso: filtroCursoAplicado,
			viz: filtroVisualizacaoAplicado
		};
		sessionStorage.setItem(DASHBOARD_FILTROS_STORAGE_KEY, JSON.stringify(payload));

		const params = new URLSearchParams();
		if (filtroAnoAplicado) params.set('ano', filtroAnoAplicado);
		if (filtroEscolaAplicada !== 'all') params.set('escola', filtroEscolaAplicada);
		if (filtroCursoAplicado !== 'all') params.set('curso', filtroCursoAplicado);
		if (filtroVisualizacaoAplicado !== 'totais') params.set('viz', filtroVisualizacaoAplicado);

		const qs = params.toString();
		const target = qs ? `${page.url.pathname}?${qs}` : page.url.pathname;
		const current = `${page.url.pathname}${page.url.search}`;

		if (target !== current) {
			goto(target, { replaceState: true, keepFocus: true, noScroll: true, invalidateAll: false });
		}
	}

	let anosDisponiveis = $derived.by(() => {
		const anoSet = new Set();
		for (const l of linhas) {
			const label = anoLabelOf(l);
			if (label) anoSet.add(label);
		}
		return Array.from(anoSet)
			.sort((a, b) => {
				const aIni = parseInt(a.split('/')[0] || '0', 10);
				const bIni = parseInt(b.split('/')[0] || '0', 10);
				return bIni - aIni;
			})
			.slice(0, MAX_ANOS_DASHBOARD);
	});

	/** Linhas restritas aos anos do filtro (evita gráficos com demasiados anos) */
	let linhasUltimosAnos = $derived(
		linhas.filter((l) => {
			const label = anoLabelOf(l);
			return label && anosDisponiveis.includes(label);
		})
	);

	let escolasDisponiveis = $derived.by(() => {
		if (escolasBd.length > 0) return escolasBd.map((e) => e.nome).sort();
		const escSet = new Set();
		for (const l of linhas) {
			if (l.schoolName) escSet.add(l.schoolName);
		}
		return Array.from(escSet).sort();
	});

	let cursosDisponiveis = $derived.by(() => {
		const cursoSet = new Set();
		for (const l of linhas) {
			if (!l.courseName) continue;
			if (filtroEscola !== 'all' && l.schoolName !== filtroEscola) continue;
			cursoSet.add(l.courseName);
		}
		return Array.from(cursoSet).sort();
	});

	/** KPIs: apenas ano letivo aplicado */
	let linhasPorAno = $derived(
		filterLinhas(linhas, { ano: filtroAnoAplicado, escola: 'all', curso: 'all' })
	);

	/** Gráficos: ano + escola + curso aplicados */
	let linhasFiltradas = $derived(
		filterLinhas(linhas, {
			ano: filtroAnoAplicado,
			escola: filtroEscolaAplicada,
			curso: filtroCursoAplicado
		})
	);

	$effect(() => {
		sidebarOptions.currentModule = 'Proposta de Vagas';
		sidebarOptions.currentModuleId = 1;
		sidebarOptions.currentObject = 'Dashboard';
		sidebarOptions.currentObjectId = 50;
		pageTitle.title = 'Dashboard';
	});

	$effect(() => {
		if (filtrosInicializados) return;
		// Sem anos disponíveis não há filtros para inicializar, mas é preciso
		// sair do estado "A carregar filtros…" para mostrar o estado vazio.
		if (anosDisponiveis.length === 0) {
			filtrosInicializados = true;
			return;
		}

		const fromUrl = readFiltrosFromUrl();
		const hasUrlFiltros =
			fromUrl.ano || fromUrl.escola !== 'all' || fromUrl.curso !== 'all' || fromUrl.viz !== 'totais';
		const stored = hasUrlFiltros ? null : readFiltrosFromStorage();
		const source = hasUrlFiltros ? fromUrl : (stored ?? fromUrl);
		const filtros = normalizeFiltrosAplicados(source);

		applyFiltrosState(filtros);
		filtrosInicializados = true;
		persistFiltrosAplicados();
	});

	$effect(() => {
		if (!filtrosInicializados) return;
		if (filtroCurso !== 'all' && !cursosDisponiveis.includes(filtroCurso)) {
			filtroCurso = 'all';
		}
		if (filtroCursoAplicado !== 'all' && !cursosParaEscola(filtroEscolaAplicada).includes(filtroCursoAplicado)) {
			filtroCursoAplicado = 'all';
			filtroCurso = 'all';
		}
	});

	function aplicarFiltros() {
		filtroAnoAplicado = filtroAno;
		filtroEscolaAplicada = filtroEscola;
		if (filtroCurso !== 'all' && !cursosDisponiveis.includes(filtroCurso)) {
			filtroCurso = 'all';
		}
		filtroCursoAplicado = filtroCurso;
		filtroVisualizacaoAplicado = filtroVisualizacao;
		persistFiltrosAplicados();
	}

	let kpis = $derived(computeDashboardKpis(linhasPorAno));

	let kpiCards = $derived(
		DASHBOARD_KPI_CARDS.map((card) => ({
			...card,
			value: Number(kpis[/** @type {keyof typeof kpis} */ (card.key)]) || 0
		}))
	);

	let chartRows = $derived(
		filterRowsForCharts(linhasUltimosAnos, filtroEscolaAplicada, filtroCursoAplicado)
	);

	let evolutionChartData = $derived(
		computeEvolutionChartData(chartRows, filtroAnoAplicado)
	);

	let lineChartOption = $derived(buildLineChartOption(evolutionChartData));

	let viaDistribution = $derived(computeViaAcessoDistribution(linhasFiltradas));

	let donutChartOption = $derived(buildDonutChartOption(viaDistribution.slices));

	let viewChartPanels = $derived(
		computeViewChartPanels(
			chartRows,
			linhasFiltradas,
			filtroVisualizacaoAplicado,
			filtroAnoAplicado,
			filtroEscolaAplicada
		)
	);

	/** @param {string} value @param {string} fallback */
	function resumoOpcional(value, fallback = 'Todas') {
		return value === 'all' || !value ? fallback : value;
	}

	/** @param {number} value @param {'number' | 'percent' | undefined} format */
	function formatKpiValue(value, format) {
		if (format === 'percent') {
			return `${value.toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
		}
		return value.toLocaleString('pt-PT');
	}

	let exportandoPdf = $state(false);
	let mostrarCabecalhoPdf = $state(false);
	let dataAtualPdf = $state('');

	/** Aguarda o DOM e os gráficos ECharts estabilizarem após mudança de layout */
	async function aguardarLayoutGraficos() {
		await tick();
		await new Promise((resolve) => {
			// requestAnimationFrame não dispara com o separador em segundo plano;
			// o setTimeout serve de fallback para a exportação não ficar pendurada.
			let done = false;
			const finish = () => {
				if (!done) {
					done = true;
					resolve(undefined);
				}
			};
			requestAnimationFrame(() => requestAnimationFrame(finish));
			setTimeout(finish, 400);
		});
		await new Promise((resolve) => setTimeout(resolve, 200));
	}

	/** Repõe tamanho dos gráficos após html2canvas (evita canvas vazios na página) */
	async function restaurarGraficos() {
		if (!browser) return;
		await tick();
		const { getInstanceByDom } = await import('echarts');
		document.querySelectorAll('#dashboard-pdf-content .echart-host').forEach((host) => {
			getInstanceByDom(/** @type {HTMLElement} */ (host))?.resize();
		});
		window.dispatchEvent(new Event('resize'));
	}

	async function exportarPDF() {
		if (!browser || exportandoPdf) return;

		const el = document.getElementById('dashboard-pdf-content');
		if (!el) return;

		const scrollX = window.scrollX;
		const scrollY = window.scrollY;

		exportandoPdf = true;
		dataAtualPdf = new Date().toLocaleDateString('pt-PT', {
			day: '2-digit',
			month: 'long',
			year: 'numeric'
		});
		mostrarCabecalhoPdf = true;

		try {
			await aguardarLayoutGraficos();

			const { default: html2canvas } = await import('html2canvas');
			const { jsPDF } = await import('jspdf');
			const { getInstanceByDom } = await import('echarts');

			// Captura cada gráfico ECharts como imagem PNG. O html2canvas não
			// consegue ler o conteúdo dos canvas (cloneNode dá canvas vazios),
			// por isso substituímos cada canvas por um <img> no clone.
			const hostsOriginais = /** @type {HTMLElement[]} */ (
				Array.from(el.querySelectorAll('.echart-host'))
			);
			const imagensGraficos = hostsOriginais.map((host) => {
				const inst = getInstanceByDom(host);
				return inst
					? inst.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' })
					: null;
			});

			const canvas = await html2canvas(el, {
				scale: 2,
				useCORS: true,
				allowTaint: true,
				scrollX: -window.scrollX,
				scrollY: -window.scrollY,
				width: el.scrollWidth,
				height: el.scrollHeight,
				onclone: (doc) => {
					const pdfRoot = doc.getElementById('dashboard-pdf-content') ?? doc;
					const hostsClone = pdfRoot.querySelectorAll('.echart-host');
					hostsClone.forEach((host, i) => {
						const dataUrl = imagensGraficos[i];
						if (!dataUrl) return;
						const img = doc.createElement('img');
						img.src = dataUrl;
						img.style.width = '100%';
						img.style.height = '100%';
						img.style.objectFit = 'contain';
						host.innerHTML = '';
						host.appendChild(img);
					});
				}
			});

			const pdf = new jsPDF('l', 'mm', 'a4');
			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = pdf.internal.pageSize.getHeight();

			const imgWidth = pdfWidth;
			const imgHeight = (canvas.height * pdfWidth) / canvas.width;
			const imgData = canvas.toDataURL('image/png');

			if (imgHeight <= pdfHeight) {
				pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
			} else {
				let y = 0;
				while (y < imgHeight) {
					pdf.addImage(imgData, 'PNG', 0, -y, imgWidth, imgHeight);
					y += pdfHeight;
					if (y < imgHeight) pdf.addPage();
				}
			}

			pdf.save(`dashboard-ipvc-${filtroAnoAplicado || 'sem-ano'}.pdf`);
		} catch (err) {
			console.error('Erro ao exportar PDF do dashboard', err);
			await toastError('Não foi possível exportar o PDF. Tenta novamente.');
		} finally {
			mostrarCabecalhoPdf = false;
			exportandoPdf = false;
			window.scrollTo(scrollX, scrollY);
			await aguardarLayoutGraficos();
			await restaurarGraficos();
		}
	}
</script>

<Breadcrum modulo="Proposta de Vagas" objeto="Dashboard">
	<svelte:fragment slot="actions">
		<button
			type="button"
			class="btn botao-breadcrumb-on btn-sm fw-bold btn-search-hover pdf-export-btn"
			onclick={exportarPDF}
			disabled={exportandoPdf}
			aria-busy={exportandoPdf}
		>
			{#if exportandoPdf}
				<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
				A exportar…
			{:else}
				<i class="fa fa-file-pdf-o me-1" aria-hidden="true"></i>
				Exportar PDF
			{/if}
		</button>
	</svelte:fragment>
</Breadcrum>

<div id="dashboard-pdf-content" class="container-fluid dashboard-page">
	{#if mostrarCabecalhoPdf}
	<div class="pdf-capture-header">
		<strong>Dashboard — IPVC</strong>
		<span>{dataAtualPdf}</span>
	</div>
	{/if}

	<div class="row filter-controls g-2 align-items-end mb-3">
		<div class="col-12 col-sm-6 col-lg-2">
			<label class="form-label" for="dash-filtro-ano">Ano letivo</label>
			<select id="dash-filtro-ano" class="form-control form-control-sm" bind:value={filtroAno}>
				{#if anosDisponiveis.length === 0}
					<option value="" disabled>Sem anos disponíveis</option>
				{:else}
					{#each anosDisponiveis as ano}
						<option value={ano}>{ano}</option>
					{/each}
				{/if}
			</select>
		</div>

		<div class="col-12 col-sm-6 col-lg-2">
			<label class="form-label" for="dash-filtro-escola">Escola</label>
			<select id="dash-filtro-escola" class="form-control form-control-sm" bind:value={filtroEscola}>
				<option value="all">Todas</option>
				{#each escolasDisponiveis as escola}
					<option value={escola}>{escola}</option>
				{/each}
			</select>
		</div>

		<div class="col-12 col-sm-6 col-lg-3">
			<label class="form-label" for="dash-filtro-viz">Tipo de visualização</label>
			<select
				id="dash-filtro-viz"
				class="form-control form-control-sm"
				bind:value={filtroVisualizacao}
			>
				{#each DASHBOARD_VIEW_GROUPS as group}
					<optgroup label={group.groupLabel}>
						{#each group.options as opt}
							<option value={opt.id}>{opt.label}</option>
						{/each}
					</optgroup>
				{/each}
			</select>
		</div>

		<div class="col-12 col-sm-6 col-lg-5">
			<label class="form-label" for="dash-filtro-curso">Curso</label>
			<div class="filter-curso-row">
				<select
					id="dash-filtro-curso"
					class="form-control form-control-sm"
					bind:value={filtroCurso}
				>
					<option value="all">Todos</option>
					{#each cursosDisponiveis as curso}
						<option value={curso}>{curso}</option>
					{/each}
				</select>

				<button
					type="button"
					class="btn btn-primary btn-sm filter-apply-icon d-none d-md-inline-flex"
					aria-label="Aplicar filtros"
					onclick={aplicarFiltros}
				>
					<i class="fa fa-search" aria-hidden="true"></i>
				</button>
			</div>
		</div>

		<div class="col-12 d-md-none">
			<button type="button" class="btn btn-primary btn-sm w-100 filter-apply-full" onclick={aplicarFiltros}>
				<i class="fa fa-search me-1" aria-hidden="true"></i>
				Aplicar filtros
			</button>
		</div>
	</div>

	{#if !filtrosInicializados}
		<p class="text-muted mb-0 dashboard-context">A carregar filtros…</p>
	{:else if anosDisponiveis.length === 0}
		<p class="text-muted mb-0 dashboard-context">
			Ainda não há anos letivos com dados. Importe ou crie dados para ver o dashboard.
		</p>
	{:else if linhasPorAno.length === 0}
		<p class="text-muted mb-0 dashboard-context">
			Sem dados para o ano letivo {filtroAnoAplicado || 'selecionado'}.
		</p>
	{:else}
		<p class="text-muted mb-0 dashboard-context dashboard-context--kpi">
			<span class="context-item">{filtroAnoAplicado || '—'}</span>
			<span class="context-sep" aria-hidden="true">·</span>
			<span class="context-item">
				{linhasPorAno.length} {linhasPorAno.length === 1 ? 'curso' : 'cursos'} (totais do ano)
			</span>
		</p>

		<div class="kpi-cards">
			{#each kpiCards as card}
				<article class="kpi-card">
					<p class="kpi-card-label">{card.label}</p>
					<p class="kpi-card-value">{formatKpiValue(card.value, /** @type {'number' | 'percent' | undefined} */ (card.format))}</p>
					<p class="kpi-card-hint">{card.hint}</p>
				</article>
			{/each}
		</div>

		{#if linhasFiltradas.length === 0}
			<p class="text-muted dashboard-context dashboard-context--charts">
				Sem dados para escola/curso selecionados. Ajusta os filtros e clica na lupa.
			</p>
		{:else}
			<p class="text-muted mb-0 dashboard-context dashboard-context--charts">
				<span class="context-item">{filtroAnoAplicado || '—'}</span>
				<span class="context-sep" aria-hidden="true">·</span>
				<span class="context-item">{resumoOpcional(filtroEscolaAplicada)}</span>
				<span class="context-sep" aria-hidden="true">·</span>
				<span class="context-item">{resumoOpcional(filtroCursoAplicado, 'Todos')}</span>
				<span class="context-sep" aria-hidden="true">·</span>
				<span class="context-item">
					{linhasFiltradas.length} {linhasFiltradas.length === 1 ? 'curso' : 'cursos'}
				</span>
			</p>

		<div class="row dashboard-charts g-3">
			<div class="col-12">
				<h2 class="charts-layer-heading">Visão geral</h2>
			</div>
			<div class="col-12 col-lg-8">
				<section class="chart-panel">
					<header class="chart-panel-header">
						<h2 class="chart-panel-title">{evolutionChartData.title}</h2>
						<p class="chart-panel-subtitle">{evolutionChartData.subtitle}</p>
					</header>
					<div class="chart-panel-body chart-panel-body--line">
						<EChart option={lineChartOption} />
					</div>
				</section>
			</div>

			<div class="col-12 col-lg-4">
				<section class="chart-panel">
					<header class="chart-panel-header">
						<h2 class="chart-panel-title">{viaDistribution.title}</h2>
						<p class="chart-panel-subtitle">
							{filtroAnoAplicado || '—'} · {resumoOpcional(filtroEscolaAplicada)} · {resumoOpcional(filtroCursoAplicado, 'Todos')}
							{#if viaDistribution.subtitleHint}
								<br />
								<span class="chart-panel-note">{viaDistribution.subtitleHint}</span>
							{/if}
						</p>
					</header>
					<div class="chart-panel-body chart-panel-body--donut">
						<EChart option={donutChartOption} />
					</div>
				</section>
			</div>
		</div>

		<div class="row dashboard-charts dashboard-charts--contextual g-3">
			<div class="col-12">
				<h2 class="charts-layer-heading">{viewChartPanels.title}</h2>
				<p class="charts-layer-context">
					{filtroAnoAplicado || '—'} · {resumoOpcional(filtroEscolaAplicada)} · {resumoOpcional(filtroCursoAplicado, 'Todos')} · {getViewLabel(filtroVisualizacaoAplicado)}
				</p>
			</div>
			{#each viewChartPanels.panels as chartPanel (chartPanel.id)}
				<div class={chartPanel.colClass}>
					<section class="chart-panel">
						<header class="chart-panel-header">
							<h2 class="chart-panel-title">{chartPanel.title}</h2>
							<p class="chart-panel-subtitle">
								{chartPanel.subtitle}
								{#if chartPanel.hint}
									<br />
									<span class="chart-panel-note">{chartPanel.hint}</span>
								{/if}
							</p>
						</header>
						<div class="chart-panel-body {chartPanel.bodyClass}">
							<EChart option={chartPanel.option} />
						</div>
					</section>
				</div>
			{/each}
		</div>
		{/if}
	{/if}
</div>

<style>
	.dashboard-page {
		min-height: calc(100vh - 120px);
		padding: 24px;
		background-color: #fff;
	}

	.filter-curso-row {
		display: flex;
		align-items: flex-end;
		gap: 0;
		width: 100%;
		min-width: 0;
	}

	.filter-curso-row select {
		flex: 1 1 auto;
		min-width: 0;
		width: auto;
	}

	.filter-controls select.form-control {
		width: 100%;
		border-radius: 4px;
		min-height: 36px;
		height: 36px;
		border-color: #cfe2ff;
	}

	.filter-controls .form-label {
		font-size: 12px;
		font-weight: 600;
		color: #0b5ed7;
		margin-bottom: 2px;
	}

	.filter-controls select.form-control:focus {
		border-color: #0b5ed7;
		box-shadow: 0 0 0 0.15rem rgba(11, 94, 215, 0.15);
	}

	.filter-controls .btn {
		border-radius: 4px;
	}

	.filter-controls .btn.filter-apply-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 36px;
		padding-left: 70px;
		padding-right: 70px;
		line-height: 36px;
		margin-left: 30px;
		flex-shrink: 0;
	}

	.filter-controls .btn.filter-apply-icon i {
		font-size: 16px;
		line-height: 1;
	}

	.filter-controls .btn.filter-apply-full {
		min-height: 40px;
		margin-top: 2px;
	}

	:global(.pdf-export-btn.btn-search-hover) {
		min-width: 130px;
		height: 36px;
		border-radius: 4px;
		font-size: 14px;
		font-weight: 700;
		white-space: nowrap;
		transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
		background-color: #20a8d8 !important;
		border-color: #20a8d8 !important;
		background-image: none !important;
		color: #fff !important;
	}
	:global(.pdf-export-btn.btn-search-hover:hover:not(:disabled)) {
		background-color: #1a93cc !important;
		border-color: #1a93cc !important;
		color: #fff !important;
	}
	:global(.pdf-export-btn.btn-search-hover:disabled) {
		opacity: 0.65;
		cursor: not-allowed;
	}

	.pdf-capture-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: 4px 0 10px;
		margin-bottom: 8px;
		border-bottom: 1px solid #dee2e6;
		font-size: 14px;
	}

	.dashboard-context {
		font-size: 12px;
		padding: 4px 0 16px;
		color: #868e96;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 8px;
	}

	.dashboard-context--charts {
		padding-top: 12px;
		margin-top: 4px;
		border-top: 1px solid #f1f3f5;
	}

	.context-item {
		min-width: 0;
		word-break: break-word;
	}

	.context-sep {
		opacity: 0.55;
		user-select: none;
	}

	.kpi-cards {
		display: flex;
		flex-wrap: nowrap;
		align-items: stretch;
		gap: 8px;
		margin-bottom: 8px;
		overflow-x: auto;
		padding-bottom: 2px;
		scrollbar-width: thin;
	}

	.kpi-cards::-webkit-scrollbar {
		height: 4px;
	}

	.kpi-cards::-webkit-scrollbar-thumb {
		background: #cfe2ff;
		border-radius: 4px;
	}

	.kpi-card {
		flex: 1 1 0;
		min-width: 118px;
		background: #fff;
		border: 1px solid #cfe2ff;
		border-radius: 10px;
		padding: 14px 10px;
		min-height: 110px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.kpi-card:hover {
		border-color: #9ec5fe;
		box-shadow: 0 6px 18px rgba(11, 94, 215, 0.08);
	}

	.kpi-card-label {
		margin: 0 0 6px;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.02em;
		color: #0b5ed7;
		text-transform: uppercase;
		line-height: 1.25;
	}

	.kpi-card-value {
		margin: 0;
		font-size: 1.35rem;
		font-weight: 700;
		line-height: 1.1;
		color: #1a1d21;
		font-variant-numeric: tabular-nums;
		word-break: break-word;
	}

	.kpi-card-hint {
		margin: 6px 0 0;
		font-size: 10px;
		color: #6c757d;
		line-height: 1.25;
	}

	@media (min-width: 1400px) {
		.kpi-card {
			padding: 16px 12px;
		}

		.kpi-card-label {
			font-size: 11px;
		}

		.kpi-card-value {
			font-size: 1.55rem;
		}

		.kpi-card-hint {
			font-size: 11px;
		}
	}

	@media (max-width: 991.98px) {
		.dashboard-page {
			padding: 16px;
		}

		.kpi-card {
			min-height: 100px;
			padding: 14px 12px;
		}

		.kpi-card-value {
			font-size: 1.45rem;
		}
	}

	@media (max-width: 575.98px) {
		.dashboard-page {
			padding: 12px;
		}

		.filter-controls .form-label {
			font-size: 11px;
		}

		.dashboard-context {
			flex-direction: column;
			align-items: flex-start;
			gap: 2px;
			padding-bottom: 12px;
		}

		.context-sep {
			display: none;
		}

		.kpi-cards {
			gap: 6px;
		}

		.kpi-card {
			min-width: 108px;
			min-height: 96px;
			padding: 12px 8px;
			border-radius: 8px;
		}

		.kpi-card-label {
			font-size: 9px;
			margin-bottom: 4px;
		}

		.kpi-card-value {
			font-size: 1.15rem;
		}

		.kpi-card-hint {
			font-size: 9px;
			margin-top: 4px;
		}
	}

	@media (max-width: 359.98px) {
		.kpi-card {
			min-width: 100px;
		}

		.kpi-card-value {
			font-size: 1.1rem;
		}
	}

	.dashboard-charts {
		margin-top: 4px;
	}

	.dashboard-charts--contextual {
		margin-top: 12px;
		padding-top: 8px;
		border-top: 1px solid #e9ecef;
	}

	.charts-layer-heading {
		margin: 0 0 4px;
		font-size: 13px;
		font-weight: 700;
		color: #495057;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.charts-layer-context {
		margin: 0 0 8px;
		font-size: 11px;
		color: #868e96;
	}

	.chart-panel {
		background: #fff;
		border: 1px solid #cfe2ff;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.chart-panel-header {
		padding: 16px 18px 0;
		flex: 0 0 auto;
	}

	.chart-panel-title {
		margin: 0;
		font-size: 14px;
		font-weight: 700;
		color: #0b5ed7;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.chart-panel-subtitle {
		margin: 4px 0 0;
		font-size: 11px;
		color: #868e96;
	}

	.chart-panel-note {
		color: #adb5bd;
		font-size: 10px;
	}

	.chart-panel-body {
		flex: 0 0 320px;
		height: 320px;
		padding: 8px 12px 12px;
		overflow: hidden;
	}

	.chart-panel-body--line,
	.chart-panel-body--donut,
	.chart-panel-body--bar {
		flex: 0 0 320px;
		height: 320px;
	}

	@media (max-width: 991.98px) {
		.chart-panel-body,
		.chart-panel-body--line,
		.chart-panel-body--donut,
		.chart-panel-body--bar {
			flex: 0 0 280px;
			height: 280px;
		}
	}

	@media (max-width: 575.98px) {
		.chart-panel-header {
			padding: 14px 14px 0;
		}

		.chart-panel-body,
		.chart-panel-body--line,
		.chart-panel-body--donut,
		.chart-panel-body--bar {
			flex: 0 0 260px;
			height: 260px;
			padding: 4px 8px 10px;
		}
	}
</style>
