<script>
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { pageTitle } from '$lib/runes/pageTitle.rune.svelte';
	import Breadcrum from '$lib/components/Breadcrum.svelte';
	import EChart from '../dashboard/EChart.svelte';
	import { IA_METRICS, IA_METRIC_IDS, metricLabel } from './iaMetricsConfig.js';
	import { buildForecastChartOption } from './iaForecastCharts.js';

	const MAX_ANOS_IA = 4;

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
	/** @typedef {Record<string, unknown> & { anoLetivoInicio?: number, anoLetivoFim?: number, schoolName?: string, courseName?: string }} Linha */
	let linhas = $derived(Array.isArray(data.linhas) ? /** @type {Linha[]} */ (data.linhas) : []);
	let escolasBd = $derived(
		Array.isArray(/** @type {any} */ (data).escolas) ? /** @type {any[]} */ (/** @type {any} */ (data).escolas) : []
	);

	let filtroAno = $state('');
	let filtroEscola = $state('all');
	let filtroCurso = $state('all');

	let filtrosInicializados = $state(false);

	/** @param {Linha} l */
	function anoLabelOf(l) {
		return l.anoLetivoInicio != null && l.anoLetivoFim != null
			? `${l.anoLetivoInicio}/${l.anoLetivoFim}`
			: '';
	}

	let anosDisponiveis = $derived.by(() => {
		const anoSet = new Set();
		for (const l of linhas) {
			const label = anoLabelOf(l);
			if (label) anoSet.add(label);
		}
		return Array.from(anoSet)
			.sort((a, b) => {
				const aIni = parseInt(String(a).split('/')[0] || '0', 10);
				const bIni = parseInt(String(b).split('/')[0] || '0', 10);
				return bIni - aIni;
			})
			.slice(0, MAX_ANOS_IA);
	});

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

	$effect(() => {
		sidebarOptions.currentModule = 'Proposta de Vagas';
		sidebarOptions.currentModuleId = 1;
		sidebarOptions.currentObject = 'Previsões IA';
		sidebarOptions.currentObjectId = 52;
		pageTitle.title = 'Previsões IA';
	});

	$effect(() => {
		if (filtrosInicializados || anosDisponiveis.length === 0) return;
		filtroAno = anosDisponiveis[0] ?? '';
		filtrosInicializados = true;
	});

	$effect(() => {
		if (!filtrosInicializados) return;
		if (filtroCurso !== 'all' && !cursosDisponiveis.includes(filtroCurso)) {
			filtroCurso = 'all';
		}
	});

	// ---- Estado das previsões / análise ----
	/** @type {any} */
	let forecast = $state(null);
	/** @type {any} */
	let analise = $state(null);
	let carregandoForecast = $state(false);
	let carregandoAnalise = $state(false);
	let erro = $state('');
	let modoDemo = $state(false);
	let metricaSelecionada = $state('matriculados');

	let filtrosAplicados = $state({ ano: '', escola: 'all', curso: 'all' });

	/** @param {string} value @param {string} fallback */
	function resumoOpcional(value, fallback = 'Todas') {
		return value === 'all' || !value ? fallback : value;
	}

	/** @param {number} value */
	function formatNumero(value) {
		return Number(value || 0).toLocaleString('pt-PT');
	}

	async function atualizarPrevisoes() {
		if (carregandoForecast || !filtroAno) return;

		erro = '';
		modoDemo = false;
		carregandoForecast = true;
		carregandoAnalise = true;
		analise = null;
		filtrosAplicados = { ano: filtroAno, escola: filtroEscola, curso: filtroCurso };

		const payload = {
			anoReferencia: filtroAno,
			escola: filtroEscola,
			curso: filtroCurso,
			metricas: IA_METRIC_IDS
		};

		try {
			const res = await fetch('/ep/api/ia/forecast', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (!res.ok) throw new Error('Falha ao calcular previsões');
			forecast = await res.json();
		} catch (e) {
			console.error(e);
			erro = 'Não foi possível calcular as previsões. Tenta novamente.';
			forecast = null;
		} finally {
			carregandoForecast = false;
		}

		if (forecast) {
			await gerarAnalise(payload);
		} else {
			carregandoAnalise = false;
		}
	}

	/** @param {Record<string, unknown>} payload */
	async function gerarAnalise(payload) {
		carregandoAnalise = true;
		try {
			const res = await fetch('/ep/api/ia/analyze', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...payload, forecast })
			});
			if (!res.ok) throw new Error('Falha ao gerar relatório');
			analise = await res.json();
		} catch (e) {
			console.error(e);
			analise = null;
		} finally {
			carregandoAnalise = false;
		}
	}

	/** Carrega dados fictícios realistas para pré-visualizar a página sem dados na BD. */
	function carregarDemonstracao() {
		const ini = parseInt(String(filtroAno).split('/')[0], 10);
		const baseInicio = Number.isFinite(ini) ? ini : new Date().getFullYear();
		const anos = [baseInicio - 3, baseInicio - 2, baseInicio - 1, baseInicio].map(
			(a) => `${a}/${a + 1}`
		);
		const anoPrevisto = `${baseInicio + 1}/${baseInicio + 2}`;

		/** @param {number[]} historico @param {number} previsto */
		const mk = (historico, previsto) => ({
			historico,
			previsto,
			metodo: 'linear_regression',
			anosUsados: historico.length
		});

		forecast = {
			anoReferencia: anos[anos.length - 1],
			anoPrevisto,
			anosHistorico: anos,
			metricas: {
				colocados: mk([1180, 1210, 1245, 1300], 1342),
				matriculados: mk([1120, 1150, 1190, 1240], 1287),
				candidatos: mk([2850, 2910, 3020, 3180], 3296),
				vagas: mk([1350, 1360, 1380, 1400], 1417)
			},
			avisos: []
		};

		analise = {
			resumo:
				'No conjunto dos últimos quatro anos letivos verifica-se um crescimento sustentado da procura e da ocupação. ' +
				'Os candidatos subiram de forma consistente e os matriculados acompanham essa tendência, o que sugere uma ' +
				'previsão ligeiramente positiva para o próximo ano, mantendo as condições atuais.',
			tendencias: [
				{
					metrica: 'matriculados',
					direcao: 'subida',
					texto: 'Crescimento médio de cerca de 3% ao ano, com previsão de ~1287 matriculados.'
				},
				{
					metrica: 'candidatos',
					direcao: 'subida',
					texto: 'Procura em alta (+11% no período), reforçando a margem de seleção.'
				},
				{
					metrica: 'vagas',
					direcao: 'estavel',
					texto: 'Oferta de vagas praticamente estável, com ligeiro ajuste em alta.'
				}
			],
			padroes: [
				{
					via: 'CNA',
					texto: 'O Concurso Nacional de Acesso continua a ser a principal via de entrada.'
				},
				{
					via: 'Concursos especiais',
					texto: 'Contribuição estável, sem variações abruptas entre anos.'
				}
			],
			alertas: [
				{
					nivel: 'warning',
					texto: 'A taxa de ocupação aproxima-se do limite das vagas — monitorizar para evitar saturação.'
				},
				{
					nivel: 'info',
					texto: 'Previsão sensível a alterações no número de vagas aprovadas.'
				}
			],
			limitacoes:
				'Valores de demonstração gerados localmente. As previsões reais usam regressão linear sobre o histórico ' +
				'disponível e devem ser interpretadas como indicativas.',
			generatedAt: new Date().toISOString()
		};

		filtrosAplicados = { ano: forecast.anoReferencia, escola: filtroEscola, curso: filtroCurso };
		metricaSelecionada = 'matriculados';
		chatMensagens = [];
		erro = '';
		carregandoForecast = false;
		carregandoAnalise = false;
		modoDemo = true;
	}

	let kpiCards = $derived(
		IA_METRICS.map((m) => {
			const dados = forecast?.metricas?.[m.id];
			const historico = Array.isArray(dados?.historico) ? dados.historico : [];
			const atual = historico.length ? Number(historico[historico.length - 1]) || 0 : 0;
			const previsto = dados?.previsto;
			const temPrevisao = previsto != null;
			const delta = temPrevisao && atual > 0 ? ((previsto - atual) / atual) * 100 : null;
			return { ...m, atual, previsto, temPrevisao, delta };
		})
	);

	let chartOption = $derived(
		forecast
			? buildForecastChartOption(
					metricaSelecionada,
					forecast.metricas?.[metricaSelecionada] ?? { historico: [], previsto: null },
					forecast.anosHistorico ?? [],
					forecast.anoPrevisto ?? ''
				)
			: null
	);

	/** Método/anos usados da métrica atualmente selecionada (para badge no gráfico) */
	let metricaInfo = $derived(forecast?.metricas?.[metricaSelecionada] ?? null);

	/** Data do relatório formatada */
	let analiseGeradaEm = $derived.by(() => {
		if (!analise?.generatedAt) return '';
		try {
			return new Date(analise.generatedAt).toLocaleString('pt-PT', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return '';
		}
	});

	// ---- Chat ----
	/** @type {{ role: 'user' | 'assistant', content: string }[]} */
	let chatMensagens = $state([]);
	let chatInput = $state('');
	let chatCarregando = $state(false);
	let chatMessagesEl = $state(/** @type {HTMLDivElement | null} */ (null));

	const SUGESTOES_CHAT = [
		'Qual a métrica com maior crescimento previsto?',
		'Resume a evolução dos últimos anos.',
		'Há algum alerta a ter em conta?'
	];

	/** Auto-scroll para a última mensagem */
	$effect(() => {
		// dependências: nova mensagem ou estado de escrita
		chatMensagens.length;
		chatCarregando;
		if (chatMessagesEl) {
			chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
		}
	});

	function limparChat() {
		chatMensagens = [];
	}

	/** @param {string} texto */
	function enviarSugestao(texto) {
		if (chatCarregando) return;
		chatInput = texto;
		enviarChat();
	}

	async function enviarChat() {
		const mensagem = chatInput.trim();
		if (!mensagem || chatCarregando) return;

		// Histórico sem a mensagem atual: o backend acrescenta-a como última mensagem.
		const historicoParaEnvio = chatMensagens.slice(-8);
		chatMensagens = [...chatMensagens, { role: 'user', content: mensagem }];
		chatInput = '';
		chatCarregando = true;

		if (modoDemo) {
			await new Promise((r) => setTimeout(r, 600));
			chatMensagens = [
				...chatMensagens,
				{
					role: 'assistant',
					content:
						'(Modo demonstração) Com base nos dados de exemplo, a tendência é de crescimento ligeiro: ' +
						'matriculados ~1287 e candidatos ~3296 previstos para o próximo ano. Estes valores são fictícios, ' +
						'apenas para pré-visualizar a interface. Com dados reais na base de dados, esta resposta será gerada pela IA.'
				}
			];
			chatCarregando = false;
			return;
		}

		try {
			const res = await fetch('/ep/api/ia/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					mensagem,
					historico: historicoParaEnvio,
					filtros: {
						anoReferencia: filtrosAplicados.ano || filtroAno,
						escola: filtrosAplicados.escola,
						curso: filtrosAplicados.curso
					}
				})
			});
			if (!res.ok) throw new Error('Falha no chat');
			const data = await res.json();
			chatMensagens = [...chatMensagens, { role: 'assistant', content: data.resposta ?? '' }];
		} catch (e) {
			console.error(e);
			chatMensagens = [
				...chatMensagens,
				{ role: 'assistant', content: 'Ocorreu um erro a responder. Tenta novamente.' }
			];
		} finally {
			chatCarregando = false;
		}
	}

	/** @param {KeyboardEvent} e */
	function onChatKeydown(e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			enviarChat();
		}
	}
</script>

<Breadcrum modulo="Proposta de Vagas" objeto="Previsões IA">
	<svelte:fragment slot="actions">
		<button
			type="button"
			class="btn botao-breadcrumb-on btn-sm fw-bold btn-search-hover ia-update-btn"
			onclick={atualizarPrevisoes}
			disabled={carregandoForecast || !filtroAno}
		>
			{#if carregandoForecast}
				<span class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
				A calcular…
			{:else}
				<i class="fa fa-magic mr-1" aria-hidden="true"></i>
				Atualizar previsões
			{/if}
		</button>
	</svelte:fragment>
</Breadcrum>

<div class="container-fluid analise-ia-wrap">
	<p class="ia-lead">
		Previsões indicativas de colocados, matriculados, candidatos e vagas para o próximo ano letivo,
		com base no histórico disponível e num relatório interpretativo assistido por IA.
	</p>

	<div class="row filter-controls g-2 align-items-end mb-3">
		<div class="col-12 col-sm-6 col-lg-3">
			<label class="form-label" for="ia-filtro-ano">Ano de referência</label>
			<select id="ia-filtro-ano" class="form-control form-control-sm" bind:value={filtroAno}>
				{#if anosDisponiveis.length === 0}
					<option value="" disabled selected>Carregando...</option>
				{:else}
					{#each anosDisponiveis as ano}
						<option value={ano}>{ano}</option>
					{/each}
				{/if}
			</select>
		</div>

		<div class="col-12 col-sm-6 col-lg-3">
			<label class="form-label" for="ia-filtro-escola">Escola</label>
			<select id="ia-filtro-escola" class="form-control form-control-sm" bind:value={filtroEscola}>
				<option value="all">Todas</option>
				{#each escolasDisponiveis as escola}
					<option value={escola}>{escola}</option>
				{/each}
			</select>
		</div>

		<div class="col-12 col-sm-6 col-lg-6">
			<label class="form-label" for="ia-filtro-curso">Curso</label>
			<div class="filter-curso-row">
				<select id="ia-filtro-curso" class="form-control form-control-sm" bind:value={filtroCurso}>
					<option value="all">Todos</option>
					{#each cursosDisponiveis as curso}
						<option value={curso}>{curso}</option>
					{/each}
				</select>

				<button
					type="button"
					class="btn btn-primary btn-sm filter-apply-icon d-none d-md-inline-flex"
					aria-label="Atualizar previsões"
					onclick={atualizarPrevisoes}
				>
					<i class="fa fa-search" aria-hidden="true"></i>
				</button>
			</div>
		</div>

		<div class="col-12 d-md-none">
			<button
				type="button"
				class="btn btn-primary btn-sm w-100 filter-apply-full"
				onclick={atualizarPrevisoes}
			>
				<i class="fa fa-search me-1" aria-hidden="true"></i>
				Atualizar previsões
			</button>
		</div>
	</div>

	{#if erro}
		<div class="alert alert-danger" role="alert">{erro}</div>
	{/if}

	<div class="ia-layout">
		<div class="ia-main">
	{#if !forecast && !carregandoForecast}
		<div class="ia-empty">
			<div class="ia-empty-icon"><i class="fa fa-magic" aria-hidden="true"></i></div>
			<h3 class="ia-empty-title">Pronto para prever</h3>
			<p class="ia-empty-text">
				Escolhe o ano de referência, a escola e o curso e clica em
				<strong>«Atualizar previsões»</strong> para gerar estimativas e o relatório IA.
			</p>
			<button type="button" class="ia-demo-link" onclick={carregarDemonstracao}>
				<i class="fa fa-flask" aria-hidden="true"></i> Ver demonstração com dados de exemplo
			</button>
		</div>
	{:else if carregandoForecast}
		<div class="kpi-cards">
			{#each [0, 1, 2, 3] as _}
				<div class="kpi-card kpi-card--skeleton">
					<span class="sk sk-label"></span>
					<span class="sk sk-value"></span>
					<span class="sk sk-line sk-line--short"></span>
				</div>
			{/each}
		</div>
		<section class="chart-panel ia-chart-panel">
			<div class="chart-panel-body chart-panel-body--line ia-chart-loading">
				<span class="spinner-border text-primary" role="status" aria-hidden="true"></span>
				<p class="ia-context mb-0">A calcular previsões…</p>
			</div>
		</section>
	{:else}
		<p class="text-muted ia-context">
			{#if modoDemo}
				<span class="ia-demo-badge">
					<i class="fa fa-flask" aria-hidden="true"></i> Modo demonstração
				</span>
				<span class="context-sep" aria-hidden="true">·</span>
			{/if}
			<span class="context-item">{forecast.anoReferencia || '—'}</span>
			<span class="context-sep" aria-hidden="true">·</span>
			<span class="context-item">{resumoOpcional(filtrosAplicados.escola)}</span>
			<span class="context-sep" aria-hidden="true">·</span>
			<span class="context-item">{resumoOpcional(filtrosAplicados.curso, 'Todos')}</span>
			<span class="context-sep" aria-hidden="true">·</span>
			<span class="context-item">Previsão para {forecast.anoPrevisto || '—'}</span>
			{#if modoDemo}
				<button type="button" class="ia-demo-exit" onclick={() => { modoDemo = false; forecast = null; analise = null; }}>
					Sair
				</button>
			{/if}
		</p>

		<div class="kpi-cards">
			{#each kpiCards as card}
				<button
					type="button"
					class="kpi-card"
					class:kpi-card--active={metricaSelecionada === card.id}
					aria-pressed={metricaSelecionada === card.id}
					title="Ver gráfico de {card.label}"
					onclick={() => (metricaSelecionada = card.id)}
				>
					<p class="kpi-card-label">{card.label}</p>
					<p class="kpi-card-value">
						{card.temPrevisao ? formatNumero(card.previsto) : '—'}
					</p>
					<p class="kpi-card-hint">
						{#if card.temPrevisao}
							Atual: {formatNumero(card.atual)}
							{#if card.delta != null}
								<span
									class="kpi-delta"
									class:kpi-delta--up={card.delta > 0}
									class:kpi-delta--down={card.delta < 0}
								>
									{card.delta > 0 ? '▲' : card.delta < 0 ? '▼' : '▬'}
									{Math.abs(card.delta).toFixed(1)}%
								</span>
							{/if}
						{:else}
							Dados insuficientes
						{/if}
					</p>
				</button>
			{/each}
		</div>

		<div class="ia-metric-chips" role="tablist" aria-label="Selecionar métrica">
			{#each IA_METRICS as m}
				<button
					type="button"
					role="tab"
					aria-selected={metricaSelecionada === m.id}
					class="ia-metric-chip"
					class:ia-metric-chip--active={metricaSelecionada === m.id}
					onclick={() => (metricaSelecionada = m.id)}
				>
					{m.label}
				</button>
			{/each}
		</div>

		<section class="chart-panel ia-chart-panel">
			<header class="chart-panel-header">
				<div class="chart-panel-titlebar">
					<h2 class="chart-panel-title">Previsão de {metricLabel(metricaSelecionada)}</h2>
					{#if metricaInfo?.metodo === 'linear_regression'}
						<span class="ia-method-badge" title="Modelo usado para a previsão">
							<i class="fa fa-line-chart" aria-hidden="true"></i>
							Regressão linear · {metricaInfo.anosUsados} anos
						</span>
					{:else if metricaInfo}
						<span class="ia-method-badge ia-method-badge--muted">
							<i class="fa fa-ban" aria-hidden="true"></i>
							Sem previsão
						</span>
					{/if}
				</div>
				<p class="chart-panel-subtitle">
					Histórico (linha sólida) e estimativa para {forecast.anoPrevisto || '—'} (tracejado)
				</p>
			</header>
			<div class="chart-panel-body chart-panel-body--line">
				{#if chartOption}
					<EChart option={chartOption} />
				{/if}
			</div>
		</section>

		{#if forecast.avisos?.length}
			<div class="ia-avisos">
				{#each forecast.avisos as aviso}
					<p class="ia-aviso"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> {aviso}</p>
				{/each}
			</div>
		{/if}

		<!-- Relatório IA -->
		<section class="ia-report">
			<div class="ia-report-head">
				<h2 class="charts-layer-heading">Relatório IA</h2>
				{#if analiseGeradaEm}
					<span class="ia-report-time">
						<i class="fa fa-clock-o" aria-hidden="true"></i> {analiseGeradaEm}
					</span>
				{/if}
			</div>
			{#if carregandoAnalise}
				<div class="ia-report-grid">
					{#each [0, 1, 2] as _}
						<article class="ia-card ia-card--skeleton">
							<span class="sk sk-title"></span>
							<span class="sk sk-line"></span>
							<span class="sk sk-line sk-line--short"></span>
						</article>
					{/each}
				</div>
			{:else if !analise}
				<p class="text-muted ia-context">Relatório indisponível para os filtros atuais.</p>
			{:else}
				{#if analise.resumo}
					<article class="ia-hero">
						<div class="ia-hero-icon"><i class="fa fa-lightbulb-o" aria-hidden="true"></i></div>
						<div class="ia-hero-body">
							<h3 class="ia-hero-title">Resumo executivo</h3>
							<p class="ia-hero-text">{analise.resumo}</p>
						</div>
					</article>
				{/if}

				<div class="ia-report-grid">
					{#if analise.tendencias?.length}
						<article class="ia-card ia-card--trend">
							<header class="ia-card-head">
								<span class="ia-card-ico"><i class="fa fa-line-chart" aria-hidden="true"></i></span>
								<h3 class="ia-card-title">Tendências</h3>
								<span class="ia-card-count">{analise.tendencias.length}</span>
							</header>
							<ul class="ia-card-list">
								{#each analise.tendencias as t}
									<li class="ia-item">
										<span
											class="ia-dir"
											class:ia-dir--up={t.direcao === 'subida'}
											class:ia-dir--down={t.direcao === 'descida'}
											aria-hidden="true"
										>
											<i
												class="fa {t.direcao === 'subida'
													? 'fa-arrow-up'
													: t.direcao === 'descida'
														? 'fa-arrow-down'
														: 'fa-arrows-h'}"
											></i>
										</span>
										<div class="ia-item-body">
											<span class="ia-chip">{metricLabel(t.metrica)}</span>
											<span class="ia-item-text">{t.texto}</span>
										</div>
									</li>
								{/each}
							</ul>
						</article>
					{/if}

					{#if analise.padroes?.length}
						<article class="ia-card ia-card--pattern">
							<header class="ia-card-head">
								<span class="ia-card-ico"><i class="fa fa-sitemap" aria-hidden="true"></i></span>
								<h3 class="ia-card-title">Padrões</h3>
								<span class="ia-card-count">{analise.padroes.length}</span>
							</header>
							<ul class="ia-card-list">
								{#each analise.padroes as p}
									<li class="ia-item">
										<span class="ia-dir ia-dir--neutral" aria-hidden="true">
											<i class="fa fa-dot-circle-o"></i>
										</span>
										<div class="ia-item-body">
											<span class="ia-chip ia-chip--neutral">{p.via}</span>
											<span class="ia-item-text">{p.texto}</span>
										</div>
									</li>
								{/each}
							</ul>
						</article>
					{/if}

					{#if analise.alertas?.length}
						<article class="ia-card ia-card--alert">
							<header class="ia-card-head">
								<span class="ia-card-ico"><i class="fa fa-bell-o" aria-hidden="true"></i></span>
								<h3 class="ia-card-title">Alertas</h3>
								<span class="ia-card-count">{analise.alertas.length}</span>
							</header>
							<ul class="ia-card-list">
								{#each analise.alertas as a}
									<li class="ia-alert-item" class:ia-alert-item--warning={a.nivel === 'warning'}>
										<i
											class="fa {a.nivel === 'warning'
												? 'fa-exclamation-triangle'
												: 'fa-info-circle'} ia-alert-ico"
											aria-hidden="true"
										></i>
										<span class="ia-item-text">{a.texto}</span>
									</li>
								{/each}
							</ul>
						</article>
					{/if}
				</div>

				{#if analise.limitacoes}
					<p class="ia-limit">
						<i class="fa fa-info-circle" aria-hidden="true"></i>
						<span><strong>Limitações:</strong> {analise.limitacoes}</span>
					</p>
				{/if}
			{/if}
		</section>

	{/if}
		</div>

		<aside class="ia-chat-aside">
			<div class="ia-chat-panel">
				<header class="ia-chat-header">
					<i class="fa fa-comments" aria-hidden="true"></i>
					<span>Perguntar à IA</span>
					{#if chatMensagens.length > 0}
						<button
							type="button"
							class="ia-chat-clear"
							aria-label="Limpar conversa"
							title="Limpar conversa"
							onclick={limparChat}
						>
							<i class="fa fa-trash-o" aria-hidden="true"></i>
						</button>
					{/if}
				</header>
				<div class="ia-chat-body">
					<div class="ia-chat-messages" bind:this={chatMessagesEl}>
						{#if chatMensagens.length === 0}
							<p class="text-muted ia-chat-empty">
								Faz uma pergunta sobre as previsões ou o histórico.
							</p>
							<div class="ia-chat-suggestions">
								{#each SUGESTOES_CHAT as sugestao}
									<button
										type="button"
										class="ia-chat-suggestion"
										onclick={() => enviarSugestao(sugestao)}
									>
										<i class="fa fa-lightbulb-o" aria-hidden="true"></i> {sugestao}
									</button>
								{/each}
							</div>
						{:else}
							{#each chatMensagens as msg}
								<div class="ia-chat-msg ia-chat-msg--{msg.role}">
									<span class="ia-chat-bubble">{msg.content}</span>
								</div>
							{/each}
						{/if}
						{#if chatCarregando}
							<div class="ia-chat-msg ia-chat-msg--assistant">
								<span class="ia-chat-bubble ia-chat-bubble--loading">A escrever…</span>
							</div>
						{/if}
					</div>
					<div class="ia-chat-input">
						<textarea
							class="form-control form-control-sm"
							rows="2"
							placeholder="Escreve a tua pergunta…"
							bind:value={chatInput}
							onkeydown={onChatKeydown}
						></textarea>
						<button
							type="button"
							class="btn btn-primary btn-sm"
							aria-label="Enviar pergunta"
							onclick={enviarChat}
							disabled={chatCarregando || !chatInput.trim()}
						>
							<i class="fa fa-paper-plane" aria-hidden="true"></i>
						</button>
					</div>
				</div>
			</div>
		</aside>
	</div>

	<div class="alert alert-info ia-disclaimer" role="note">
		<i class="fa fa-info-circle" aria-hidden="true"></i>
		As previsões são indicativas, calculadas por regressão linear sobre os últimos anos disponíveis,
		e o relatório é gerado por IA. Devem ser interpretadas como apoio à decisão, não como valores garantidos.
	</div>
</div>

<style>
	.analise-ia-wrap {
		min-height: calc(100vh - 120px);
		padding: 24px;
		background-color: #fff;
	}

	.ia-lead {
		font-size: 13px;
		color: #6c757d;
		max-width: 880px;
		margin-bottom: 18px;
	}

	.ia-layout {
		display: flex;
		align-items: flex-start;
		gap: 16px;
	}

	.ia-main {
		flex: 1 1 auto;
		min-width: 0;
	}

	.ia-chat-aside {
		flex: 0 0 340px;
		width: 340px;
		position: sticky;
		top: 16px;
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
		padding-left: 40px;
		padding-right: 40px;
		line-height: 36px;
		margin-left: 16px;
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

	:global(.ia-update-btn.btn-search-hover) {
		min-width: 160px;
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
	:global(.ia-update-btn.btn-search-hover:hover:not(:disabled)) {
		background-color: #1a93cc !important;
		border-color: #1a93cc !important;
		color: #fff !important;
	}
	:global(.ia-update-btn.btn-search-hover:disabled) {
		opacity: 0.65;
		cursor: not-allowed;
	}

	.ia-context {
		font-size: 12px;
		padding: 4px 0 16px;
		color: #868e96;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 8px;
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
		margin-bottom: 16px;
		overflow-x: auto;
		padding-bottom: 2px;
		scrollbar-width: thin;
	}

	.kpi-card {
		flex: 1 1 0;
		min-width: 130px;
		background: #fff;
		border: 1px solid #cfe2ff;
		border-radius: 10px;
		padding: 14px 12px;
		min-height: 110px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		text-align: left;
		font: inherit;
		cursor: pointer;
		position: relative;
		transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
	}

	.kpi-card:hover {
		border-color: #9ec5fe;
		box-shadow: 0 6px 18px rgba(11, 94, 215, 0.08);
	}

	.kpi-card:focus-visible {
		outline: none;
		border-color: #0b5ed7;
		box-shadow: 0 0 0 0.15rem rgba(11, 94, 215, 0.2);
	}

	.kpi-card--active {
		border-color: #0b5ed7;
		background: #f8fbff;
		box-shadow: 0 6px 18px rgba(11, 94, 215, 0.1);
	}

	.kpi-card--active::before {
		content: '';
		position: absolute;
		left: 0;
		top: 10px;
		bottom: 10px;
		width: 3px;
		border-radius: 0 3px 3px 0;
		background: #0b5ed7;
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
		font-size: 1.45rem;
		font-weight: 700;
		line-height: 1.1;
		color: #1a1d21;
		font-variant-numeric: tabular-nums;
	}

	.kpi-card-hint {
		margin: 6px 0 0;
		font-size: 10px;
		color: #6c757d;
		line-height: 1.3;
	}

	.kpi-delta {
		display: inline-block;
		margin-left: 4px;
		font-weight: 700;
		color: #6c757d;
	}

	.kpi-delta--up {
		color: #16a34a;
	}

	.kpi-delta--down {
		color: #dc2626;
	}

	.ia-metric-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 14px;
	}

	.ia-metric-chip {
		border: 1px solid #cfe2ff;
		background: #fff;
		color: #0b5ed7;
		border-radius: 999px;
		padding: 6px 16px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
	}

	.ia-metric-chip:hover {
		border-color: #9ec5fe;
	}

	.ia-metric-chip--active {
		background: #0b5ed7;
		border-color: #0b5ed7;
		color: #fff;
	}

	.chart-panel {
		background: #fff;
		border: 1px solid #cfe2ff;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.ia-chart-panel {
		margin-bottom: 16px;
	}

	.chart-panel-titlebar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		flex-wrap: wrap;
	}

	.ia-method-badge {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		background: #eef4ff;
		color: #0b5ed7;
		border-radius: 999px;
		padding: 3px 10px;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.02em;
		white-space: nowrap;
	}

	.ia-method-badge--muted {
		background: #f1f3f5;
		color: #868e96;
	}

	.ia-chart-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
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

	.chart-panel-body {
		flex: 0 0 360px;
		height: 360px;
		padding: 8px 12px 12px;
		overflow: hidden;
	}

	.ia-avisos {
		margin-bottom: 16px;
	}

	.ia-aviso {
		margin: 0 0 4px;
		font-size: 12px;
		color: #b45309;
	}

	/* Estado inicial */
	.ia-empty {
		border: 1px dashed #cfe2ff;
		border-radius: 10px;
		background: #f8fbff;
		padding: 40px 24px;
		text-align: center;
	}

	.ia-empty-icon {
		width: 56px;
		height: 56px;
		margin: 0 auto 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: #eef4ff;
		color: #0b5ed7;
		font-size: 22px;
	}

	.ia-empty-title {
		margin: 0 0 6px;
		font-size: 16px;
		font-weight: 700;
		color: #0b5ed7;
	}

	.ia-empty-text {
		margin: 0 auto;
		max-width: 440px;
		font-size: 13px;
		color: #6c757d;
		line-height: 1.5;
	}

	.ia-demo-link {
		margin-top: 16px;
		border: 1px solid #cfe2ff;
		background: #fff;
		color: #0b5ed7;
		border-radius: 8px;
		padding: 8px 16px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.15s ease, border-color 0.15s ease;
	}

	.ia-demo-link:hover {
		background: #eef4ff;
		border-color: #9ec5fe;
	}

	.ia-demo-badge {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		background: #fff4e5;
		color: #b45309;
		border-radius: 999px;
		padding: 2px 10px;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}

	.ia-demo-exit {
		margin-left: 6px;
		border: none;
		background: transparent;
		color: #0b5ed7;
		font-size: 11px;
		font-weight: 700;
		text-decoration: underline;
		cursor: pointer;
		padding: 0 2px;
	}

	.ia-demo-exit:hover {
		color: #084298;
	}

	/* Skeletons */
	.kpi-card--skeleton,
	.ia-card--skeleton {
		cursor: default;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.ia-card--skeleton {
		padding: 14px 16px;
	}

	.kpi-card--skeleton:hover,
	.ia-card--skeleton:hover {
		border-color: #cfe2ff;
		box-shadow: none;
	}

	.sk {
		display: block;
		border-radius: 6px;
		background: linear-gradient(90deg, #eef2f7 25%, #f6f8fb 37%, #eef2f7 63%);
		background-size: 400% 100%;
		animation: sk-shimmer 1.4s ease infinite;
	}

	.sk-label {
		width: 50%;
		height: 9px;
	}

	.sk-value {
		width: 70%;
		height: 22px;
	}

	.sk-title {
		width: 40%;
		height: 12px;
	}

	.sk-line {
		width: 100%;
		height: 10px;
	}

	.sk-line--short {
		width: 65%;
	}

	@keyframes sk-shimmer {
		0% {
			background-position: 100% 0;
		}
		100% {
			background-position: -100% 0;
		}
	}

	.charts-layer-heading {
		margin: 0 0 10px;
		font-size: 13px;
		font-weight: 700;
		color: #495057;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.ia-report {
		margin-top: 8px;
		padding-top: 12px;
		border-top: 1px solid #e9ecef;
	}

	.ia-report-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px;
		flex-wrap: wrap;
	}

	.ia-report-time {
		font-size: 11px;
		color: #adb5bd;
		white-space: nowrap;
	}

	/* Hero / Resumo */
	.ia-hero {
		display: flex;
		gap: 14px;
		align-items: flex-start;
		background: linear-gradient(135deg, #f4f9ff 0%, #eef4ff 100%);
		border: 1px solid #cfe2ff;
		border-left: 4px solid #0b5ed7;
		border-radius: 10px;
		padding: 16px 18px;
		margin-bottom: 12px;
	}

	.ia-hero-icon {
		flex: 0 0 auto;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: #0b5ed7;
		color: #fff;
		font-size: 18px;
		box-shadow: 0 4px 12px rgba(11, 94, 215, 0.25);
	}

	.ia-hero-title {
		margin: 0 0 4px;
		font-size: 12px;
		font-weight: 700;
		color: #0b5ed7;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.ia-hero-text {
		margin: 0;
		font-size: 13.5px;
		color: #2b3138;
		line-height: 1.55;
	}

	.ia-report-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 12px;
	}

	.ia-card {
		background: #fff;
		border: 1px solid #cfe2ff;
		border-radius: 10px;
		padding: 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		transition: box-shadow 0.15s ease, border-color 0.15s ease;
	}

	.ia-card:hover {
		border-color: #9ec5fe;
		box-shadow: 0 6px 18px rgba(11, 94, 215, 0.07);
	}

	.ia-card-head {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 11px 14px;
		border-bottom: 1px solid #eef2f7;
		background: #fafcff;
	}

	.ia-card-ico {
		width: 26px;
		height: 26px;
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 7px;
		font-size: 13px;
		background: #eef4ff;
		color: #0b5ed7;
	}

	.ia-card--trend .ia-card-ico {
		background: #e7f6ec;
		color: #16a34a;
	}

	.ia-card--alert .ia-card-ico {
		background: #fff4e5;
		color: #b45309;
	}

	.ia-card-title {
		margin: 0;
		font-size: 12px;
		font-weight: 700;
		color: #344054;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.ia-card-count {
		margin-left: auto;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 999px;
		background: #eef2f7;
		color: #6c757d;
		font-size: 11px;
		font-weight: 700;
	}

	.ia-card-list {
		margin: 0;
		padding: 12px 14px;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 12px;
		flex: 1 1 auto;
	}

	.ia-item {
		display: flex;
		gap: 10px;
		align-items: flex-start;
	}

	.ia-dir {
		flex: 0 0 auto;
		width: 22px;
		height: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		font-size: 11px;
		background: #eef2f7;
		color: #6c757d;
		margin-top: 1px;
	}

	.ia-dir--up {
		background: #e7f6ec;
		color: #16a34a;
	}

	.ia-dir--down {
		background: #fdeaea;
		color: #dc2626;
	}

	.ia-dir--neutral {
		background: #eef4ff;
		color: #0b5ed7;
	}

	.ia-item-body {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.ia-item-text {
		font-size: 13px;
		color: #343a40;
		line-height: 1.45;
	}

	.ia-chip {
		align-self: flex-start;
		display: inline-block;
		background: #e7f6ec;
		color: #16a34a;
		border-radius: 4px;
		padding: 1px 8px;
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.ia-chip--neutral {
		background: #eef4ff;
		color: #0b5ed7;
	}

	.ia-alert-item {
		display: flex;
		gap: 9px;
		align-items: flex-start;
		background: #f4f9ff;
		border-left: 3px solid #0b5ed7;
		border-radius: 6px;
		padding: 9px 11px;
	}

	.ia-alert-item--warning {
		background: #fff8ef;
		border-left-color: #f0a500;
	}

	.ia-alert-ico {
		flex: 0 0 auto;
		font-size: 13px;
		color: #0b5ed7;
		margin-top: 2px;
	}

	.ia-alert-item--warning .ia-alert-ico {
		color: #b45309;
	}

	.ia-limit {
		display: flex;
		gap: 8px;
		align-items: flex-start;
		margin: 12px 0 0;
		padding: 10px 14px;
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 8px;
		font-size: 12px;
		color: #6c757d;
		line-height: 1.45;
	}

	.ia-limit i {
		margin-top: 2px;
		color: #adb5bd;
	}

	.ia-limit strong {
		color: #495057;
	}

	.ia-chat-panel {
		border: 1px solid #cfe2ff;
		border-radius: 10px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		background: #fff;
		height: calc(100vh - 160px);
		min-height: 420px;
	}

	.ia-chat-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		font-size: 13px;
		font-weight: 700;
		color: #0b5ed7;
		background: #f8fbff;
		border-bottom: 1px solid #e9ecef;
		flex: 0 0 auto;
	}

	.ia-chat-clear {
		margin-left: auto;
		border: none;
		background: transparent;
		color: #adb5bd;
		font-size: 13px;
		line-height: 1;
		padding: 4px;
		border-radius: 4px;
		cursor: pointer;
		transition: color 0.15s ease, background-color 0.15s ease;
	}

	.ia-chat-clear:hover {
		color: #dc2626;
		background: #fdeaea;
	}

	.ia-chat-body {
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		min-height: 0;
	}

	.ia-chat-empty {
		font-size: 12px;
		margin: 0 0 12px;
	}

	.ia-chat-suggestions {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.ia-chat-suggestion {
		text-align: left;
		border: 1px solid #cfe2ff;
		background: #fff;
		color: #0b5ed7;
		border-radius: 8px;
		padding: 8px 12px;
		font-size: 12px;
		font-weight: 600;
		line-height: 1.35;
		cursor: pointer;
		transition: background-color 0.15s ease, border-color 0.15s ease;
	}

	.ia-chat-suggestion:hover {
		background: #f8fbff;
		border-color: #9ec5fe;
	}

	.ia-chat-suggestion i {
		margin-right: 6px;
		color: #f0a500;
	}

	.ia-chat-messages {
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex: 1 1 auto;
		overflow-y: auto;
		margin-bottom: 12px;
	}

	.ia-chat-msg {
		display: flex;
	}

	.ia-chat-msg--user {
		justify-content: flex-end;
	}

	.ia-chat-bubble {
		max-width: 80%;
		padding: 8px 12px;
		border-radius: 12px;
		font-size: 13px;
		line-height: 1.45;
		white-space: pre-wrap;
	}

	.ia-chat-msg--user .ia-chat-bubble {
		background: #0b5ed7;
		color: #fff;
		border-bottom-right-radius: 4px;
	}

	.ia-chat-msg--assistant .ia-chat-bubble {
		background: #f1f5fb;
		color: #343a40;
		border-bottom-left-radius: 4px;
	}

	.ia-chat-bubble--loading {
		color: #868e96;
		font-style: italic;
	}

	.ia-chat-input {
		display: flex;
		gap: 8px;
		align-items: stretch;
	}

	.ia-chat-input textarea {
		flex: 1 1 auto;
		resize: none;
		border-color: #cfe2ff;
	}

	.ia-chat-input .btn {
		flex: 0 0 auto;
		width: 44px;
		align-self: stretch;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		font-size: 15px;
		border-radius: 6px;
		cursor: pointer;
	}

	.ia-chat-input .btn:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.ia-disclaimer {
		margin-top: 20px;
		font-size: 12px;
	}

	@media (max-width: 991.98px) {
		.ia-layout {
			flex-direction: column;
		}

		.ia-chat-aside {
			flex: 1 1 auto;
			width: 100%;
			position: static;
		}

		.ia-chat-panel {
			height: auto;
			min-height: 0;
		}

		.ia-chat-messages {
			max-height: 360px;
		}
	}

	@media (max-width: 575.98px) {
		.analise-ia-wrap {
			padding: 12px;
		}

		.ia-context {
			flex-direction: column;
			align-items: flex-start;
			gap: 2px;
		}

		.context-sep {
			display: none;
		}

		.chart-panel-body {
			flex: 0 0 300px;
			height: 300px;
		}
	}
</style>
