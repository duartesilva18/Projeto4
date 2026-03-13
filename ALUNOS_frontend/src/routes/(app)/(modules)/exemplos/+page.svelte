<script>
	import { t } from "$lib/translations/translations";
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { pageIds } from '$lib/js/pageIds.conf';
	import { pageTitle } from '$lib/runes/pageTitle.rune.svelte';
	import Breadcrum from "$lib/components/Breadcrum.svelte";
	import { invalidateAll } from '$app/navigation';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	// garantir que nunca é null
	/**
	 * @typedef {Object} CourseData
	 * @property {string} id
	 * @property {string} courseCode
	 * @property {string} courseName
	 * @property {string} schoolName
	 * @property {number} anoLetivoInicio
	 * @property {number} anoLetivoFim
	 * @property {number} vagas1F
	 * @property {number} candidatos1F
	 * @property {number} candidatos1Opcao1F
	 * @property {number} colocados1F
	 * @property {number} matriculados1F
	 * @property {number} classificacaoUltimo1F
	 * @property {number} mediaEntrada1F
	 * @property {number} vagas2F
	 * @property {number} candidatos2F
	 * @property {number} candidatos1Opcao2F
	 * @property {number} colocados2F
	 * @property {number} matriculados2F
	 * @property {number} classificacaoUltimo2F
	 * @property {number} vagas3F
	 * @property {number} candidatos3F
	 * @property {number} candidatos1Opcao3F
	 * @property {number} colocados3F
	 * @property {number} matriculados3F
	 * @property {number} classificacaoUltimo3F
	 * @property {number} vagasEfetivas3F
	 * @property {number} transfCnaOutrasIESup
	 * @property {number} transfCnaIpvc
	 * @property {number} sobrasPos3F
	 * @property {number} reingressoVagas
	 * @property {number} reingressoCandidatos
	 * @property {number} reingressoAno1
	 * @property {number} reingressoAno2
	 * @property {number} reingressoAno3
	 * @property {number} reingressoAno4
	 * @property {number} reingressoTotal1Ano
	 * @property {number} mudancaVagas
	 * @property {number} mudancaCandidatos
	 * @property {number} mudancaColocadosMatriculados
	 * @property {number} over23Vagas
	 * @property {number} over23Candidatos
	 * @property {number} over23Colocados
	 * @property {number} over23Matriculados
	 * @property {number} cetVagas
	 * @property {number} cetCandidatos
	 * @property {number} cetColocados
	 * @property {number} cetMatriculados
	 * @property {number} ctespVagas
	 * @property {number} ctespCandidatos
	 * @property {number} ctespColocados
	 * @property {number} ctespMatriculados
	 * @property {number} otherHigherVagas
	 * @property {number} otherHigherCandidatos
	 * @property {number} otherHigherColocados
	 * @property {number} otherHigherMatriculados
	 * @property {number} dualCertVagas
	 * @property {number} dualCertCandidatos
	 * @property {number} dualCertColocados
	 * @property {number} dualCertMatriculados
	 * @property {number} regimesEspVagas
	 * @property {number} regimesEspCandidatos
	 * @property {number} regimesEspMatriculados
	 * @property {number} internationalVagas
	 * @property {number} internationalCandidatos
	 * @property {number} internationalMatriculados
	 * @property {number} totalCandidatosCna
	 * @property {number} diffVagasMatAntes3F
	 * @property {number} percOcupacaoCna
	 * @property {number} totalColocados
	 * @property {number} totalMatriculados
	 * @property {number} pedidosAnulacao
	 * @property {number} totalAvailableVacancies
	 * @property {number} diffVacanciesEnrolled
	 * @property {number} year1
	 * @property {number} year2
	 * @property {number} year3
	 * @property {number} year4
	 * @property {number} totalMatriculatedPerCourse
	 */
	/** @type {CourseData[]} */
	let linhas = $derived(Array.isArray(data.linhas) ? data.linhas : []);

	// filtros (ano letivo, escola e curso)
	// valores escolhidos nos selects
	let filtroAno = $state('all');
	let filtroEscola = $state('all');
	let filtroCurso = $state('all');
	// valores efetivamente aplicados (só mudam ao clicar no botão)
	let filtroAnoAplicado = $state('all');
	let filtroEscolaAplicada = $state('all');
	let filtroCursoAplicado = $state('all');

	/** @type {CourseData | null} */
	let selectedCourse = $state(null);

	/** @type {string[]} */
	let anosDisponiveis = $state([]);
	/** @type {string[]} */
	let escolasDisponiveis = $state([]);
	/** @type {string[]} */
	let cursosDisponiveis = $state([]);
	/** @type {CourseData[]} */
	let linhasFiltradas = $state([]);
	let kpi = $state({
		totalCandidatos: 0,
		totalMatriculados: 0,
		diffVagasMat: 0,
		mediaOcupacao: 0,
		totalMatriculadosCurso: 0,
		totalAno1: 0,
		totalAno2: 0,
		totalAno3: 0,
		totalAno4: 0
	});

	$effect(() => {
		// calcular opções de filtros
		const anoSet = new Set();
		const escSet = new Set();
		linhas.forEach((l) => {
			if (l.anoLetivoInicio && l.anoLetivoFim) {
				anoSet.add(`${l.anoLetivoInicio}/${l.anoLetivoFim}`);
			}
			if (l.schoolName) escSet.add(l.schoolName);
		});
		// ordenar anos e definir o mais recente como default na primeira carga
		const anosArray = Array.from(anoSet).sort((a, b) => {
			const aIni = parseInt(a.split('/')[0] || '0', 10);
			const bIni = parseInt(b.split('/')[0] || '0', 10);
			return bIni - aIni;
		});
		anosDisponiveis = anosArray;
		const latestAno = anosArray[0];
		escolasDisponiveis = Array.from(escSet);

		// cursos dependem da escola selecionada no filtro visual
		const cursoSet = new Set();
		linhas.forEach((l) => {
			if (!l.courseName) return;
			if (filtroEscola === 'all' || l.schoolName === filtroEscola) {
				cursoSet.add(l.courseName);
			}
		});
		cursosDisponiveis = Array.from(cursoSet).sort();

		// se ainda não houver filtro de ano aplicado, usar automaticamente o ano mais recente
		if (latestAno && filtroAno === 'all' && filtroAnoAplicado === 'all') {
			filtroAno = latestAno;
			filtroAnoAplicado = latestAno;
		}

		// aplicar filtros às linhas (usar variável local para evitar loop)
		const filtradas = linhas.filter((l) => {
			const anoLabel =
				l.anoLetivoInicio && l.anoLetivoFim
					? `${l.anoLetivoInicio}/${l.anoLetivoFim}`
					: '';
			const matchAno =
				filtroAnoAplicado === 'all' || anoLabel === filtroAnoAplicado;
			const matchEscola =
				filtroEscolaAplicada === 'all' || l.schoolName === filtroEscolaAplicada;
			const matchCurso =
				filtroCursoAplicado === 'all' || l.courseName === filtroCursoAplicado;
			return matchAno && matchEscola && matchCurso;
		});

		linhasFiltradas = filtradas;

		// KPIs por curso selecionado (não globais)
		if (!filtradas.length) {
			selectedCourse = null;
			kpi = {
				totalCandidatos: 0,
				totalMatriculados: 0,
				diffVagasMat: 0,
				mediaOcupacao: 0,
				totalMatriculadosCurso: 0,
				totalAno1: 0,
				totalAno2: 0,
				totalAno3: 0,
				totalAno4: 0
			};
			return;
		}

		// se não houver curso selecionado ou se já não existir nas linhas filtradas,
		// usar o primeiro da lista filtrada
		/** @type {CourseData} */
		// @ts-ignore - garantimos acima que filtradas.length > 0
		let current = selectedCourse && filtradas.some((l) => l.id === selectedCourse.id)
			? selectedCourse
			: filtradas[0];
		selectedCourse = current;

        const row = current;

        kpi = {
			totalCandidatos: row.totalCandidatosCna ?? 0,
			totalMatriculados: row.totalMatriculados ?? 0,
			diffVagasMat: row.diffVacanciesEnrolled ?? 0,
			mediaOcupacao: row.percOcupacaoCna ?? 0,
			totalMatriculadosCurso: row.totalMatriculatedPerCourse ?? 0,
			totalAno1: row.year1 ?? 0,
			totalAno2: row.year2 ?? 0,
			totalAno3: row.year3 ?? 0,
			totalAno4: row.year4 ?? 0
		};
	});

	// titulo da página
	pageTitle.title = $t("exemplos_base.titulo_pagina");

	// designação do módulo e objetos abertos
	sidebarOptions.currentModule = $t("exemplos_base.modulo");
	sidebarOptions.currentObject = $t("exemplos_base.objeto");
	sidebarOptions.currentModuleId = pageIds.exemplos.base.moduleId;
	sidebarOptions.currentObjectId = pageIds.exemplos.base.objectId;

	// grupos expandidos (começam todos colapsados)
	/** @type {Set<string>} */
	let expandedGroups = $state(new Set());

	/** @param {string} groupName */
	const isGroupExpanded = (groupName) => {
		const expanded = expandedGroups.has(groupName);
		console.log('[isGroupExpanded]', groupName, '=>', expanded, 'current:', Array.from(expandedGroups));
		return expanded;
	};

	/** @param {string} groupName */
	const toggleGroup = (groupName) => {
		console.log('--- toggleGroup called ---');
		console.log('before:', groupName, Array.from(expandedGroups));
		const next = new Set(expandedGroups);
		if (next.has(groupName)) {
			next.delete(groupName);
		} else {
			next.add(groupName);
		}
		console.log('after :', groupName, Array.from(next));
		// reatribuir para garantir reatividade
		expandedGroups = next;
	};

	/** @param {CourseData} row */
	const getSpecialContestsTotal = (row) =>
		(row.over23Matriculados || 0) +
		(row.cetMatriculados || 0) +
		(row.ctespMatriculados || 0) +
		(row.otherHigherMatriculados || 0) +
		(row.dualCertMatriculados || 0);

	/**
	 * Indica se a linha é a primeira de uma escola (para mostrar cabeçalho de escola)
	 * @param {CourseData[]} rows
	 * @param {number} index
	 */
	const isFirstRowOfSchool = (rows, index) => {
		if (index === 0) return true;
		const prev = rows[index - 1];
		const current = rows[index];
		return (prev.schoolName || '') !== (current.schoolName || '');
	};

	// exportar tabela atual (linhasFiltradas) para CSV com estrutura semelhante ao Excel
	const exportCsv = () => {
		if (typeof window === 'undefined') return;

		/** @type {string[]} */
		const headers = [
			'Escola',
			'Codigo curso',
			'Nome curso',
			'Ano letivo',
			'Concursos especiais - >23 Matriculados',
			'Concursos especiais - CET Matriculados',
			'Concursos especiais - CTeSP Matriculados',
			'Concursos especiais - Outros sup. Matriculados',
			'Concursos especiais - Dupla cert./art. Matriculados',
			'Regimes especiais - Matriculados',
			'Estudantes internacionais - Matriculados',
			'Total candidatos CNA',
			'Total colocados',
			'Total matriculados',
			'Anulações',
			'Vagas disponíveis',
			'Diferença vagas - matriculados',
			'Matriculados 1.º ano',
			'Matriculados 2.º ano',
			'Matriculados 3.º ano',
			'Matriculados 4.º ano',
			'Total matriculados por curso'
		];

		const linhasParaExportar = linhasFiltradas.length ? linhasFiltradas : linhas;

		// função para escapar valores em CSV
		/**
		 * @param {unknown} value
		 */
		const escapeCsv = (value) => {
			const s = String(value ?? '');
			const escaped = s.replace(/"/g, '""');
			return `"${escaped}"`;
		};

		const rows = linhasParaExportar.map((row) => [
			row.schoolName ?? '',
			row.courseCode ?? '',
			row.courseName ?? '',
			row.anoLetivoInicio && row.anoLetivoFim
				? `${row.anoLetivoInicio}/${row.anoLetivoFim}`
				: '',
			row.over23Matriculados ?? 0,
			row.cetMatriculados ?? 0,
			row.ctespMatriculados ?? 0,
			row.otherHigherMatriculados ?? 0,
			row.dualCertMatriculados ?? 0,
			row.regimesEspMatriculados ?? 0,
			row.internationalMatriculados ?? 0,
			row.totalCandidatosCna ?? 0,
			row.totalColocados ?? 0,
			row.totalMatriculados ?? 0,
			row.pedidosAnulacao ?? 0,
			row.totalAvailableVacancies ?? 0,
			row.diffVacanciesEnrolled ?? 0,
			row.year1 ?? 0,
			row.year2 ?? 0,
			row.year3 ?? 0,
			row.year4 ?? 0,
			row.totalMatriculatedPerCourse ?? 0
		]);

		const separator = ',';
		const csvContent =
			[headers.map(escapeCsv).join(separator)]
				.concat(rows.map((r) => r.map(escapeCsv).join(separator)))
				.join('\r\n');

		// adicionar BOM UTF-8 para o Excel reconhecer corretamente acentos/ç
		const BOM = '\uFEFF';
		const blob = new Blob([BOM + csvContent], {
			type: 'text/csv;charset=utf-8;'
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		const anoLabel =
			filtroAnoAplicado !== 'all'
				? filtroAnoAplicado.replace('/', '-')
				: 'todos';
		a.href = url;
		a.download = `alunos_vagas_${anoLabel}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	/** @type {{ icon_class: string; url: string; designacao: string }[]} */
	let items_breadcrum = $derived([]);

	// Modal Editar: linha em edição e cópia dos dados para o formulário (por abas)
	/** @type {CourseData | null} */
	let editingRow = $state(null);
	/** @type {Partial<CourseData> | null} */
	let editForm = $state(null);
	/** @type {'concursos' | 'regimes' | 'internacionais' | 'totais' | 'ano'} */
	let modalTab = $state('concursos');

	/** @param {CourseData} row */
	function abrirEditar(row) {
		editingRow = row;
		editForm = { ...row };
		modalTab = 'concursos';
	}
	function fecharEditar() {
		editingRow = null;
		editForm = null;
	}
	/** Soma dos 5 concursos (Colocados ou Matriculados) para o formulário de edição */
	/** @param {Record<string, unknown>} f */
	function sumConcursosColocados(f) {
		return (Number(f?.over23Colocados) || 0) + (Number(f?.cetColocados) || 0) + (Number(f?.ctespColocados) || 0) + (Number(f?.otherHigherColocados) || 0) + (Number(f?.dualCertColocados) || 0);
	}
	/** @param {Record<string, unknown>} f */
	function sumConcursosMatriculados(f) {
		return (Number(f?.over23Matriculados) || 0) + (Number(f?.cetMatriculados) || 0) + (Number(f?.ctespMatriculados) || 0) + (Number(f?.otherHigherMatriculados) || 0) + (Number(f?.dualCertMatriculados) || 0);
	}

	async function guardarEditar() {
		if (!editForm || !editingRow) return;
		// Total curso = soma dos 4 anos (calculado)
		const sumAnos = (Number(editForm.year1) || 0) + (Number(editForm.year2) || 0) + (Number(editForm.year3) || 0) + (Number(editForm.year4) || 0);
		editForm.totalMatriculatedPerCourse = sumAnos;
		// Totais calculados: Colocados (5 concursos), Matriculados (5 concursos + regimes + int.), Diff (vagas − matriculados)
		editForm.totalColocados = sumConcursosColocados(editForm);
		editForm.totalMatriculados = sumConcursosMatriculados(editForm) + (Number(editForm.regimesEspMatriculados) || 0) + (Number(editForm.internationalMatriculados) || 0);
		editForm.diffVacanciesEnrolled = (Number(editForm.totalAvailableVacancies) || 0) - (Number(editForm.totalMatriculados) || 0);
		// TODO: chamar API PUT/PATCH quando existir (ex: PATCH /api/vagas/curso/:id)
		// await fetch(`/api/vagas/curso/${editingRow.id}`, { method: 'PATCH', body: JSON.stringify(editForm), headers: { 'Content-Type': 'application/json' } });
		fecharEditar();
	}

	// Estado ao criar novo ano (evita reload e efeito de "tabela grande que desaparece")
	let criandoNovaTabela = $state(false);
</script>

<style>
	/* Azul, com variações, para grupos */
	.group-header {
		background: linear-gradient(to right, #0d6efd, #0b5ed7);
		color: #fff;
		cursor: pointer;
	}
	.group-header-secondary {
		background-color: #e7f1ff;
		color: #0b5ed7;
	}
	/* .subheader-blue removido (deixou de ser usado na tabela) */
	/* (linhas grossas removidas a pedido) */
	.table-main {
		border-collapse: collapse;
		width: 100%;
		font-size: 12px;
		background-color: #ffffff;
		border-radius: 4px;
		overflow: hidden;
		box-shadow: 0 2px 4px rgba(15, 23, 42, 0.05);
	}
	.table-main th,
	.table-main td {
		border: 1px solid #dde3f0;
		padding: 6px 8px;
		text-align: center;
		vertical-align: middle;
	}
	.table-main thead th {
		font-weight: 600;
		font-size: 12px;
	}
	.table-main thead th.sticky-course {
		position: sticky;
		left: 0;
		z-index: 2;
		background-color: #f8f9ff;
		text-align: left;
	}
	.table-main tbody td.sticky-course {
		position: sticky;
		left: 0;
		z-index: 1;
		background-color: #fff;
		text-align: left;
	}
	.row-alt-0 {
		background-color: #ffffff;
	}
	.row-alt-1 {
		background-color: #f8f9ff;
	}
	.table-main tbody tr:hover {
		background-color: #e9f2ff;
	}
	select.form-control {
		cursor: pointer;
	}
	.school-row {
		background-color: #e3efff;
	}
	.school-row td {
		font-weight: 600;
		color: #0b5ed7;
		text-align: left;
	}
	/* Linha selecionada: discreto para ligar aos KPIs */
	.table-main tbody tr.row-selected {
		background-color: #f0f6ff;
		box-shadow: inset 3px 0 0 #0b5ed7;
	}
	.table-main tbody tr.row-selected:hover {
		background-color: #e6efff;
	}

	/* Modal Editar — CSS limpo */
	.modal-editar-vagas {
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(2px);
	}
	.modal-editar-vagas .modal-content {
		border: none;
		border-radius: 12px;
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
	}
	.modal-editar-vagas .modal-header {
		border-bottom: 1px solid #e9ecef;
		padding: 1rem 1.25rem;
		background: #fafbfc;
		border-radius: 12px 12px 0 0;
	}
	.modal-editar-vagas .modal-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: #212529;
	}
	.modal-editar-vagas .modal-header .close {
		opacity: 0.6;
		font-size: 1.5rem;
		padding: 0;
		margin: -0.5rem -0.5rem -0.5rem auto;
	}
	.modal-editar-vagas .modal-header .close:hover {
		opacity: 1;
	}
	.modal-editar-vagas .modal-body {
		padding: 1.25rem 1.5rem;
	}
	.modal-editar-vagas .nav-tabs {
		display: flex;
		border-bottom: 1px solid #e9ecef;
		gap: 0.25rem;
	}
	.modal-editar-vagas .nav-tabs .nav-link {
		border: none;
		background: none;
		color: #6c757d;
		font-size: 0.9rem;
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		cursor: pointer;
	}
	.modal-editar-vagas .nav-tabs .nav-link:hover {
		color: #0b5ed7;
		background: #f0f6ff;
	}
	.modal-editar-vagas .nav-tabs .nav-link.active {
		color: #0b5ed7;
		font-weight: 600;
		background: #e7f1ff;
		border-bottom: 2px solid #0b5ed7;
		border-radius: 6px 6px 0 0;
		margin-bottom: -1px;
	}
	.modal-editar-vagas .modal-body .small.text-muted {
		font-size: 0.85rem;
		line-height: 1.45;
		color: #6c757d;
	}
	.modal-editar-vagas .table {
		font-size: 0.9rem;
	}
	.modal-editar-vagas .table thead th {
		background: #f1f3f5;
		color: #495057;
		font-weight: 600;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		border-color: #dee2e6;
		padding: 0.6rem 0.75rem;
	}
	.modal-editar-vagas .table tbody th {
		background: #fafbfc;
		color: #495057;
		font-weight: 500;
		border-color: #e9ecef;
		padding: 0.5rem 0.75rem;
	}
	.modal-editar-vagas .table td {
		border-color: #e9ecef;
		padding: 0.35rem 0.5rem;
		vertical-align: middle;
	}
	.modal-editar-vagas .table input.form-control {
		border-radius: 6px;
		border: 1px solid #dee2e6;
		font-size: 0.9rem;
		padding: 0.35rem 0.5rem;
	}
	.modal-editar-vagas .table input.form-control:focus {
		border-color: #0b5ed7;
		box-shadow: 0 0 0 2px rgba(11, 94, 215, 0.15);
	}
	.modal-editar-vagas .modal-footer {
		display: flex;
		justify-content: flex-end;
		border-top: 1px solid #e9ecef;
		padding: 1rem 1.25rem;
		background: #fafbfc;
		border-radius: 0 0 12px 12px;
		gap: 0.5rem;
	}
	.modal-editar-vagas .modal-footer .btn {
		border-radius: 8px;
		font-weight: 500;
		padding: 0.5rem 1rem;
	}

	/* KPIs — estilo clean */
	.kpi-card-clean {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.6rem 0.75rem;
		background: #fff;
		border-radius: 6px;
		border: 1px solid #eaecef;
	}
	.kpi-card-clean-label {
		font-size: 11px;
		color: #868e96;
		font-weight: 500;
	}
	.kpi-card-clean-value {
		font-size: 1.15rem;
		font-weight: 600;
		color: #212529;
	}

</style>

<div>
	<Breadcrum modulo={sidebarOptions.currentModule} objeto={sidebarOptions.currentObject} menu_items={items_breadcrum}/>

	<div class="p-2 mt-4">
		<!-- Cards de resumo (campos fórmula) -->
		<!-- Barra de filtros (ano letivo, escola e curso) -->
		<div class="row mt-3 mb-2 align-items-end">
			<div class="col-md-3 col-sm-6 mb-2">
				<label for="filtro-ano" style="font-size: 12px;" class="text-muted">Ano letivo</label>
				<select
					id="filtro-ano"
					class="form-control"
					value={filtroAno}
					onchange={(e) => { filtroAno = /** @type {HTMLSelectElement} */ (e.currentTarget).value; }}
				>
					<option value="all" id="filtro-ano-todos">Todos</option>
					{#each anosDisponiveis as ano}
						<option value={ano}>{ano}</option>
					{/each}
				</select>
			</div>
			<div class="col-md-3 col-sm-6 mb-2">
				<label for="filtro-escola" style="font-size: 12px;" class="text-muted">Escola</label>
				<select
					id="filtro-escola"
					class="form-control"
					value={filtroEscola}
					onchange={(e) => { filtroEscola = /** @type {HTMLSelectElement} */ (e.currentTarget).value; }}
				>
					<option value="all" id="filtro-escola-todas">Todas</option>
					{#each escolasDisponiveis as esc}
						<option value={esc}>{esc}</option>
					{/each}
				</select>
			</div>
			<div class="col-md-3 col-sm-6 mb-2">
				<label for="filtro-curso" style="font-size: 12px;" class="text-muted">Curso</label>
				<select
					id="filtro-curso"
					class="form-control"
					value={filtroCurso}
					onchange={(e) => { filtroCurso = /** @type {HTMLSelectElement} */ (e.currentTarget).value; }}
				>
					<option value="all" id="filtro-curso-todos">Todos</option>
					{#each cursosDisponiveis as curso}
						<option value={curso}>{curso}</option>
					{/each}
				</select>
			</div>
			<div class="col-md-auto col-sm-6 mb-2 d-flex align-items-end">
				<button
					type="button"
					class="btn btn-primary"
					style="padding-left: 70px; padding-right: 70px; font-size: 14px; min-width: 40px;"
					aria-label="Aplicar filtros"
					onclick={() => {
						filtroAnoAplicado = filtroAno;
						filtroEscolaAplicada = filtroEscola;
						filtroCursoAplicado = filtroCurso;
					}}
				>
					<i class="fa fa-search"></i>
				</button>
			</div>
		</div>

		<div class="row mt-1 mb-1 align-items-end">
			<div class="col-12 mb-2">
				<p class="text-muted mb-0" style="font-size: 12px;">
					Clique numa linha para ver o curso. Curso selecionado: <strong>{selectedCourse ? `${selectedCourse.courseName} (${selectedCourse.courseCode})` : 'nenhum'}</strong>
				</p>
			</div>
			<div class="col-6 col-md-3 mb-2">
				<div class="kpi-card-clean">
					<span class="kpi-card-clean-label">Total candidatos</span>
					<span class="kpi-card-clean-value">{kpi.totalCandidatos}</span>
				</div>
			</div>
			<div class="col-6 col-md-3 mb-2">
				<div class="kpi-card-clean">
					<span class="kpi-card-clean-label">Total matriculados</span>
					<span class="kpi-card-clean-value">{kpi.totalMatriculados}</span>
				</div>
			</div>
			<div class="col-6 col-md-3 mb-2">
				<div class="kpi-card-clean">
					<span class="kpi-card-clean-label">Vagas por preencher</span>
					<span class="kpi-card-clean-value">{kpi.diffVagasMat}</span>
				</div>
			</div>
			<div class="col-6 col-md-3 mb-2">
				<div class="kpi-card-clean">
					<span class="kpi-card-clean-label">Taxa ocupação</span>
					<span class="kpi-card-clean-value">{kpi.mediaOcupacao}%</span>
				</div>
			</div>
		</div>

		<!-- Nota de ajuda para a tabela + botões de ações -->
		<div class="row mb-2 mt-2">
			<div class="col-md-8 col-sm-12">
				<small class="text-muted">
					Clique nos cabeçalhos azuis dos grupos (Concursos especiais, Regimes especiais,
					Estudantes internacionais, Totais, Distribuição por ano) para expandir ou recolher as colunas de detalhe.
				</small>
			</div>
			<div class="col-md-4 col-sm-12 d-flex justify-content-md-end justify-content-sm-start mt-sm-2 mt-md-0">
				<button
					type="button"
					class="btn btn-primary btn-sm mr-2"
					style="min-width: 130px;"
					disabled={criandoNovaTabela}
					onclick={async () => {
						if (criandoNovaTabela) return;
						criandoNovaTabela = true;
						try {
							const res = await fetch('/api/vagas/novo-ano', { method: 'POST' });
							if (res.ok) {
								await invalidateAll();
							}
						} catch (e) {
							console.error('Erro a criar novo ano letivo', e);
						} finally {
							criandoNovaTabela = false;
						}
					}}
				>
					{#if criandoNovaTabela}
						<span class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
						A criar...
					{:else}
						<i class="fa fa-plus mr-1"></i> Nova tabela
					{/if}
				</button>

				<button
					type="button"
					class="btn btn-primary btn-sm"
					style="min-width: 130px;"
					onclick={exportCsv}
				>
					<i class="fa fa-download mr-1"></i> Exportar CSV
				</button>
			</div>
		</div>

		<div class="row mt-1">
			<div class="col-12 table-responsive">
				<table class="table-main">
					<thead>
						<tr>
							<th class="sticky-course" rowspan="4">Informação do curso</th>
							<th class="group-header" colspan="25">Regime Nacional de acesso Ensino Superior</th>
							<th class="group-header" rowspan="4">SOBRAS pós 3.ª fase<br /><small>(dados da DGES)</small></th>
							<th class="group-header" colspan="7">Reingresso</th>
							<th class="group-header" colspan="3">Mudança par Int/Curso</th>
							<th class="group-header" colspan="20">Concursos Especiais</th>
							<th class="group-header" colspan="3">Regimes Esp</th>
							<th class="group-header" colspan="3">Est Internacionais</th>
							<th class="group-header" rowspan="4">Total colocados</th>
							<th class="group-header" rowspan="4">Total matriculados</th>
							<th class="group-header" rowspan="4">Pedidos de Anulação de matrícula</th>
							<th class="group-header" rowspan="4">Total vagas disponíveis</th>
							<th class="group-header" rowspan="4">Dif. vagas/mat antes 3F</th>
							<th class="group-header" colspan="4">TOTAL MATRICULADOS</th>
							<th class="group-header" rowspan="4">Total matriculados p/ curso</th>
							<th class="group-header" rowspan="4" style="width: 90px; max-width: 90px;">Ações</th>
						</tr>
						<tr>
							<th class="group-header" colspan="17">Colocados</th>
							<th class="group-header" colspan="8">Totais / Matrículas / Movimentos</th>
							<th class="group-header" colspan="7"></th>
							<th class="group-header" colspan="3"></th>
							<th class="group-header" colspan="20"></th>
							<th class="group-header" colspan="3"></th>
							<th class="group-header" colspan="3"></th>
							<th class="group-header" colspan="4"></th>
						</tr>
						<tr>
							<th class="group-header-secondary" colspan="6">1.ª fase</th>
							<th class="group-header-secondary" colspan="5">2.ª fase</th>
							<th class="group-header-secondary" colspan="6">3.ª fase</th>
							<th class="group-header-secondary" colspan="2">Total CNA</th>
							<th class="group-header-secondary" colspan="4">Matriculados</th>
							<th class="group-header-secondary" colspan="1">Saídas</th>
							<th class="group-header-secondary" colspan="1">Entradas</th>
							<th class="group-header-secondary" colspan="2">Geral</th>
							<th class="group-header-secondary" colspan="5">Colocados / Matriculados</th>
							<th class="group-header-secondary" colspan="3">Mudança par Int/Curso</th>
							<th class="group-header-secondary" colspan="4">&gt;23 anos</th>
							<th class="group-header-secondary" colspan="4">CET</th>
							<th class="group-header-secondary" colspan="4">Titulares CTeSP</th>
							<th class="group-header-secondary" colspan="4">Titulares outros Curs Sup</th>
							<th class="group-header-secondary" colspan="4">Titulares cursos dupla Certif nível sec e c artísticos esp.</th>
							<th class="group-header-secondary" colspan="3">Regimes Esp</th>
							<th class="group-header-secondary" colspan="3">Est Internacionais</th>
							<th class="group-header-secondary" colspan="4">TOTAL MATRICULADOS</th>
						</tr>
						<tr>
							<!-- 1.ª fase -->
							<th class="group-header-secondary">Vagas CNA</th>
							<th class="group-header-secondary">Candidatos</th>
							<th class="group-header-secondary">Cand. 1.ª opç (4)</th>
							<th class="group-header-secondary">Colocados (3)</th>
							<th class="group-header-secondary">Classif. últ. colocado</th>
							<th class="group-header-secondary">Média entrada</th>
							<!-- 2.ª fase -->
							<th class="group-header-secondary">Vagas (1)</th>
							<th class="group-header-secondary">Candidatos</th>
							<th class="group-header-secondary">Cand. 1.ª opç (4)</th>
							<th class="group-header-secondary">Colocados (1)</th>
							<th class="group-header-secondary">Classif. últ. colocado</th>
							<!-- 3.ª fase -->
							<th class="group-header-secondary">Vagas (5)</th>
							<th class="group-header-secondary">Vagas efetivas (2)</th>
							<th class="group-header-secondary">Candidatos</th>
							<th class="group-header-secondary">Cand. 1.ª opç (4)</th>
							<th class="group-header-secondary">Colocados (1)</th>
							<th class="group-header-secondary">Classif. últ. colocado</th>
							<!-- Totais CNA -->
							<th class="group-header-secondary">Total Cand. Total CNA</th>
							<th class="group-header-secondary">Total Colocados</th>
							<!-- Matriculados -->
							<th class="group-header-secondary">Matric. 1.ªF</th>
							<th class="group-header-secondary">Matric. 2.ªF</th>
							<th class="group-header-secondary">Matric. 3.ªF</th>
							<th class="group-header-secondary">Total Matriculados (3F)</th>
							<!-- Movimentos -->
							<th class="group-header-secondary">Transf. CNA p outras IESup</th>
							<th class="group-header-secondary">Transf. CNA p o IPVC</th>
							<!-- Reingresso -->
							<th class="group-header-secondary">Vagas</th>
							<th class="group-header-secondary">Candidatos</th>
							<th class="group-header-secondary">1.º ano</th>
							<th class="group-header-secondary">2.º ano</th>
							<th class="group-header-secondary">3.º ano</th>
							<th class="group-header-secondary">4.º ano</th>
							<th class="group-header-secondary">TOTAL (só 1.º ano)</th>
							<!-- Mudança par Int/Curso -->
							<th class="group-header-secondary">Vagas</th>
							<th class="group-header-secondary">Candidatos</th>
							<th class="group-header-secondary">Colocados / Matriculados</th>
							<!-- Concursos Especiais: >23 anos -->
							<th class="group-header-secondary">vagas</th>
							<th class="group-header-secondary">candidatos</th>
							<th class="group-header-secondary">colocados</th>
							<th class="group-header-secondary">matriculados</th>
							<!-- Concursos Especiais: CET -->
							<th class="group-header-secondary">vagas</th>
							<th class="group-header-secondary">candidatos</th>
							<th class="group-header-secondary">colocados</th>
							<th class="group-header-secondary">matriculados</th>
							<!-- Concursos Especiais: Titulares CTeSP -->
							<th class="group-header-secondary">vagas</th>
							<th class="group-header-secondary">candidatos</th>
							<th class="group-header-secondary">colocados</th>
							<th class="group-header-secondary">matriculados</th>
							<!-- Concursos Especiais: Titulares outros Curs Sup -->
							<th class="group-header-secondary">vagas</th>
							<th class="group-header-secondary">candidatos</th>
							<th class="group-header-secondary">colocados</th>
							<th class="group-header-secondary">matriculados</th>
							<!-- Concursos Especiais: Titulares cursos dupla Certif nível sec e c artísticos especializados -->
							<th class="group-header-secondary">vagas</th>
							<th class="group-header-secondary">candidatos</th>
							<th class="group-header-secondary">colocados</th>
							<th class="group-header-secondary">matriculados</th>
							<!-- Regimes Esp -->
							<th class="group-header-secondary">vagas</th>
							<th class="group-header-secondary">candidatos</th>
							<th class="group-header-secondary">matriculados</th>
							<!-- Est Internacionais -->
							<th class="group-header-secondary">vagas</th>
							<th class="group-header-secondary">candidatos</th>
							<th class="group-header-secondary">matriculados</th>
							<!-- TOTAL MATRICULADOS por ano -->
							<th class="group-header-secondary">1.º ano</th>
							<th class="group-header-secondary">2.º ano</th>
							<th class="group-header-secondary">3.º ano</th>
							<th class="group-header-secondary">4.º ano</th>
						</tr>
					</thead>

					<tbody>
						{#each linhasFiltradas as row, idx}
							{#if isFirstRowOfSchool(linhasFiltradas, idx)}
								<tr class="school-row">
									<td colspan="100">
										{row.schoolName}
									</td>
								</tr>
							{/if}
							<tr
								class="{idx % 2 === 0 ? 'row-alt-0' : 'row-alt-1'} {selectedCourse?.id === row.id ? 'row-selected' : ''}"
								onclick={() => { selectedCourse = row; }}
								style="cursor: pointer;"
							>
								<td class="sticky-course">
									<div style="display: flex; flex-direction: column; align-items: flex-start;">
										<span style="font-weight: 600;">{row.courseName}</span>
										<span style="font-size: 11px; color: #6c757d;">{row.courseCode}</span>
									</div>
								</td>
								<!-- 1.ª fase -->
								<td>{row.vagas1F}</td>
								<td>{row.candidatos1F}</td>
								<td>{row.candidatos1Opcao1F}</td>
								<td>{row.colocados1F}</td>
								<td>{row.classificacaoUltimo1F}</td>
								<td>{row.mediaEntrada1F}</td>
								<!-- 2.ª fase -->
								<td>{row.vagas2F}</td>
								<td>{row.candidatos2F}</td>
								<td>{row.candidatos1Opcao2F}</td>
								<td>{row.colocados2F}</td>
								<td>{row.classificacaoUltimo2F}</td>
								<!-- 3.ª fase -->
								<td>{row.vagas3F}</td>
								<td>{row.vagasEfetivas3F}</td>
								<td>{row.candidatos3F}</td>
								<td>{row.candidatos1Opcao3F}</td>
								<td>{row.colocados3F}</td>
								<td>{row.classificacaoUltimo3F}</td>
								<!-- Totais CNA -->
								<td>{row.totalCandidatosCna}</td>
								<td>{row.totalColocados}</td>
								<!-- Matriculados por fase + total -->
								<td>{row.matriculados1F}</td>
								<td>{row.matriculados2F}</td>
								<td>{row.matriculados3F}</td>
								<td>{row.totalMatriculados}</td>
								<!-- Movimentos -->
								<td>{row.transfCnaOutrasIESup}</td>
								<td>{row.transfCnaIpvc}</td>
								<!-- SOBRAS pós 3.ª fase (fora do módulo Regime Nacional) -->
								<td>{row.sobrasPos3F}</td>
								<!-- Reingresso -->
								<td>{row.reingressoVagas}</td>
								<td>{row.reingressoCandidatos}</td>
								<td>{row.reingressoAno1}</td>
								<td>{row.reingressoAno2}</td>
								<td>{row.reingressoAno3}</td>
								<td>{row.reingressoAno4}</td>
								<td>{row.reingressoTotal1Ano}</td>
								<!-- Mudança par Int/Curso -->
								<td>{row.mudancaVagas}</td>
								<td>{row.mudancaCandidatos}</td>
								<td>{row.mudancaColocadosMatriculados}</td>
								<!-- Concursos Especiais: >23 anos -->
								<td>{row.over23Vagas}</td>
								<td>{row.over23Candidatos}</td>
								<td>{row.over23Colocados}</td>
								<td>{row.over23Matriculados}</td>
								<!-- Concursos Especiais: CET -->
								<td>{row.cetVagas}</td>
								<td>{row.cetCandidatos}</td>
								<td>{row.cetColocados}</td>
								<td>{row.cetMatriculados}</td>
								<!-- Concursos Especiais: Titulares CTeSP -->
								<td>{row.ctespVagas}</td>
								<td>{row.ctespCandidatos}</td>
								<td>{row.ctespColocados}</td>
								<td>{row.ctespMatriculados}</td>
								<!-- Concursos Especiais: Titulares outros Curs Sup -->
								<td>{row.otherHigherVagas}</td>
								<td>{row.otherHigherCandidatos}</td>
								<td>{row.otherHigherColocados}</td>
								<td>{row.otherHigherMatriculados}</td>
								<!-- Concursos Especiais: Titulares cursos dupla Certif nível sec e c artísticos especializados -->
								<td>{row.dualCertVagas}</td>
								<td>{row.dualCertCandidatos}</td>
								<td>{row.dualCertColocados}</td>
								<td>{row.dualCertMatriculados}</td>
								<!-- Regimes Esp -->
								<td>{row.regimesEspVagas}</td>
								<td>{row.regimesEspCandidatos}</td>
								<td>{row.regimesEspMatriculados}</td>
								<!-- Est Internacionais -->
								<td>{row.internationalVagas}</td>
								<td>{row.internationalCandidatos}</td>
								<td>{row.internationalMatriculados}</td>
								<!-- Totais finais (fora dos módulos) -->
								<td>{row.totalColocados}</td>
								<td>{row.totalMatriculados}</td>
								<td>{row.pedidosAnulacao}</td>
								<td>{row.totalAvailableVacancies}</td>
								<td>{row.diffVagasMatAntes3F}</td>
								<!-- TOTAL MATRICULADOS por ano -->
								<td>{row.year1}</td>
								<td>{row.year2}</td>
								<td>{row.year3}</td>
								<td>{row.year4}</td>
								<!-- Total matriculados por curso -->
								<td>{row.totalMatriculatedPerCourse}</td>
								<td style="width: 90px; max-width: 90px;" onclick={(e) => e.stopPropagation()}>
									<button
										type="button"
										class="btn btn-sm btn-outline-primary"
										onclick={() => abrirEditar(row)}
									>
										<i class="fa fa-edit mr-1"></i> Editar
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Anos em que a tabela foi preenchida – atalho para filtrar por ano -->
		{#if anosDisponiveis.length > 0}
			<div class="row mt-3 mb-3">
				<div class="col-12">
					<small class="text-muted">Tabela preenchida nos anos: </small>
					{#each anosDisponiveis as ano}
						<button
							type="button"
							class="btn btn-sm {filtroAnoAplicado === ano ? 'btn-primary' : 'btn-outline-secondary'} mr-1 mb-1"
							onclick={() => {
								filtroAno = ano;
								filtroAnoAplicado = ano;
							}}
						>
							{ano}
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Modal Editar curso: abas para não mostrar tudo de uma vez -->
		{#if editingRow && editForm}
			<div class="modal modal-editar-vagas d-block" tabindex="-1" role="dialog">
				<div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title">Editar — {editingRow.courseName} ({editingRow.courseCode})</h5>
							<button type="button" class="close" aria-label="Fechar" onclick={fecharEditar}>
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div class="modal-body">
							<ul class="nav nav-tabs mb-3">
								<li class="nav-item">
									<button type="button" class="nav-link {modalTab === 'concursos' ? 'active' : ''}" onclick={() => modalTab = 'concursos'}>Concursos especiais</button>
								</li>
								<li class="nav-item">
									<button type="button" class="nav-link {modalTab === 'regimes' ? 'active' : ''}" onclick={() => modalTab = 'regimes'}>Regimes especiais</button>
								</li>
								<li class="nav-item">
									<button type="button" class="nav-link {modalTab === 'internacionais' ? 'active' : ''}" onclick={() => modalTab = 'internacionais'}>Internacionais</button>
								</li>
								<li class="nav-item">
									<button type="button" class="nav-link {modalTab === 'totais' ? 'active' : ''}" onclick={() => modalTab = 'totais'}>Totais</button>
								</li>
								<li class="nav-item">
									<button type="button" class="nav-link {modalTab === 'ano' ? 'active' : ''}" onclick={() => modalTab = 'ano'}>Por ano</button>
								</li>
							</ul>

							{#if modalTab === 'concursos'}
								<p class="small text-muted mb-3">Preencha, para cada tipo de concurso especial, o número de <strong>Vagas</strong>, <strong>Candidatos</strong>, <strong>Colocados</strong> e <strong>Matriculados</strong>.</p>
								<div class="table-responsive">
									<table class="table table-bordered table-sm">
										<thead class="thead-light">
											<tr>
												<th scope="col">Tipo</th>
												<th scope="col">Vagas</th>
												<th scope="col">Candidatos</th>
												<th scope="col">Colocados</th>
												<th scope="col">Matriculados</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<th scope="row" class="text-nowrap">&gt;23 anos</th>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label=">23 Vagas" bind:value={editForm.over23Vagas} /></td>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label=">23 Candidatos" bind:value={editForm.over23Candidatos} /></td>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label=">23 Colocados" bind:value={editForm.over23Colocados} /></td>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label=">23 Matriculados" bind:value={editForm.over23Matriculados} /></td>
											</tr>
											<tr>
												<th scope="row">CET</th>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label="CET Vagas" bind:value={editForm.cetVagas} /></td>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label="CET Candidatos" bind:value={editForm.cetCandidatos} /></td>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label="CET Colocados" bind:value={editForm.cetColocados} /></td>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label="CET Matriculados" bind:value={editForm.cetMatriculados} /></td>
											</tr>
											<tr>
												<th scope="row">CTeSP</th>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label="CTeSP Vagas" bind:value={editForm.ctespVagas} /></td>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label="CTeSP Candidatos" bind:value={editForm.ctespCandidatos} /></td>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label="CTeSP Colocados" bind:value={editForm.ctespColocados} /></td>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label="CTeSP Matriculados" bind:value={editForm.ctespMatriculados} /></td>
											</tr>
											<tr>
												<th scope="row">Outros sup.</th>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label="Outros Vagas" bind:value={editForm.otherHigherVagas} /></td>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label="Outros Candidatos" bind:value={editForm.otherHigherCandidatos} /></td>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label="Outros Colocados" bind:value={editForm.otherHigherColocados} /></td>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label="Outros Matriculados" bind:value={editForm.otherHigherMatriculados} /></td>
											</tr>
											<tr>
												<th scope="row">Dupla cert.</th>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label="Dupla cert. Vagas" bind:value={editForm.dualCertVagas} /></td>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label="Dupla cert. Candidatos" bind:value={editForm.dualCertCandidatos} /></td>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label="Dupla cert. Colocados" bind:value={editForm.dualCertColocados} /></td>
												<td><input type="number" min="0" class="form-control form-control-sm" aria-label="Dupla cert. Matriculados" bind:value={editForm.dualCertMatriculados} /></td>
											</tr>
										</tbody>
									</table>
								</div>
							{:else if modalTab === 'regimes'}
								<p class="small text-muted mb-3">Regimes especiais: indique <strong>Vagas</strong>, <strong>Candidatos</strong> e <strong>Matriculados</strong>.</p>
								<div class="row">
									<div class="col-md-4 mb-2"><label for="reg-v">Vagas</label><input id="reg-v" type="number" min="0" class="form-control" bind:value={editForm.regimesEspVagas} /></div>
									<div class="col-md-4 mb-2"><label for="reg-c">Candidatos</label><input id="reg-c" type="number" min="0" class="form-control" bind:value={editForm.regimesEspCandidatos} /></div>
									<div class="col-md-4 mb-2"><label for="reg-m">Matriculados</label><input id="reg-m" type="number" min="0" class="form-control" bind:value={editForm.regimesEspMatriculados} /></div>
								</div>
							{:else if modalTab === 'internacionais'}
								<p class="small text-muted mb-3">Estudantes internacionais: indique <strong>Vagas</strong>, <strong>Candidatos</strong> e <strong>Matriculados</strong>.</p>
								<div class="row">
									<div class="col-md-4 mb-2"><label for="int-v">Vagas</label><input id="int-v" type="number" min="0" class="form-control" bind:value={editForm.internationalVagas} /></div>
									<div class="col-md-4 mb-2"><label for="int-c">Candidatos</label><input id="int-c" type="number" min="0" class="form-control" bind:value={editForm.internationalCandidatos} /></div>
									<div class="col-md-4 mb-2"><label for="int-m">Matriculados</label><input id="int-m" type="number" min="0" class="form-control" bind:value={editForm.internationalMatriculados} /></div>
								</div>
							{:else if modalTab === 'totais'}
								<p class="small text-muted mb-3">Edite <strong>Anulações</strong> e <strong>Vagas disponíveis</strong>. Colocados, Matriculados e Diff são calculados automaticamente (concursos + regimes + internacionais; Diff = vagas − matriculados).</p>
								<div class="row">
									<div class="col-md-4 mb-2"><label for="tot-anul">Anulações</label><input id="tot-anul" type="number" min="0" class="form-control" bind:value={editForm.pedidosAnulacao} /></div>
									<div class="col-md-4 mb-2"><label for="tot-vag">Vagas disponíveis</label><input id="tot-vag" type="number" min="0" class="form-control" bind:value={editForm.totalAvailableVacancies} /></div>
								</div>
							{:else if modalTab === 'ano'}
								<p class="small text-muted mb-3">Preencha o número de matriculados em cada <strong>1.º, 2.º, 3.º e 4.º ano</strong>. O Total curso é calculado automaticamente (soma dos quatro anos).</p>
								<div class="row">
									<div class="col-md-4 mb-2"><label for="y1">1.º ano</label><input id="y1" type="number" min="0" class="form-control" bind:value={editForm.year1} /></div>
									<div class="col-md-4 mb-2"><label for="y2">2.º ano</label><input id="y2" type="number" min="0" class="form-control" bind:value={editForm.year2} /></div>
									<div class="col-md-4 mb-2"><label for="y3">3.º ano</label><input id="y3" type="number" min="0" class="form-control" bind:value={editForm.year3} /></div>
									<div class="col-md-4 mb-2"><label for="y4">4.º ano</label><input id="y4" type="number" min="0" class="form-control" bind:value={editForm.year4} /></div>
								</div>
							{/if}
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-secondary" onclick={fecharEditar}>Fechar</button>
							<button type="button" class="btn btn-primary" onclick={guardarEditar}>Guardar</button>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
