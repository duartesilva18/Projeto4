<script>
	import { t } from "$lib/translations/translations";
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { pageIds } from '$lib/js/pageIds.conf';
	import { pageTitle } from '$lib/runes/pageTitle.rune.svelte';
	import Breadcrum from "$lib/components/Breadcrum.svelte";
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import toastr from "toastr";
	import { exportToXlsx } from "$lib/exportXlsx.js";

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

	/** @type {{ id: number, codigo: string, nome: string }[]} */
	let escolasBd = $derived(Array.isArray(/** @type {any} */ (data).escolas) ? /** @type {any} */ (data).escolas : []);
	/** @type {{ id: number, codigo: string, nome: string, regime: string, idEscola: number, escola: string }[]} */
	let cursosBd = $derived(Array.isArray(/** @type {any} */ (data).cursos) ? /** @type {any} */ (data).cursos : []);

	// filtros (ano letivo, escola e curso)
	// valores escolhidos nos selects
	let filtroAno = $state('all');
	let filtroEscola = $state('all');
	let filtroCurso = $state('all');
	// valores efetivamente aplicados (só mudam ao clicar no botão)
	let filtroAnoAplicado = $state('all');
	let filtroEscolaAplicada = $state('all');
	let filtroCursoAplicado = $state('all');

	/**
	 * Navegação por "páginas" via sidebar global:
	 * - URL: /proposta-vagas?tab=regime-nacional|sobras|reingresso|...
	 */
	const tabConfig = {
		'regime-nacional': { objectId: 1, label: 'Regime Nacional (inclui sobras/anulações)' },
		'sobras': { objectId: 2, label: 'SOBRAS pós 3.ª fase' },
		'reingresso-mudanca': { objectId: 3, label: 'Reingresso + Mudança par (Int/Curso)' },
		'concursos': { objectId: 5, label: 'Concursos Especiais' },
		'regimes-esp-internacionais': { objectId: 6, label: 'Regimes Esp + Internacionais' },
		'totais': { objectId: 8, label: 'Totais' }
	};

	/** @type {keyof typeof tabConfig | 'full'} */
	let activeTab = $state(/** @type {keyof typeof tabConfig | 'full'} */ ('regime-nacional'));
	$effect(() => {
		const tRaw = $page.url.searchParams.get('tab');
		// "sobras" foi integrado na página do regime nacional; se alguém ainda usar a URL antiga,
		// forçamos para o tab atual para evitar estado "morto".
		const tNormalized = tRaw === 'sobras' ? 'regime-nacional' : tRaw;
		if (tNormalized && Object.prototype.hasOwnProperty.call(tabConfig, tNormalized)) {
			activeTab = /** @type {keyof typeof tabConfig} */ (tNormalized);
		}

		const cfg =
			tabConfig[
				activeTab === 'full' ? 'regime-nacional' : activeTab
			];

		sidebarOptions.currentObjectId = cfg.objectId;
		sidebarOptions.currentObject = cfg.label;
	});

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
		linhas.forEach((l) => {
			if (l.anoLetivoInicio && l.anoLetivoFim) {
				anoSet.add(`${l.anoLetivoInicio}/${l.anoLetivoFim}`);
			}
		});
		const anosArray = Array.from(anoSet).sort((a, b) => {
			const aIni = parseInt(a.split('/')[0] || '0', 10);
			const bIni = parseInt(b.split('/')[0] || '0', 10);
			return bIni - aIni;
		});
		anosDisponiveis = anosArray;
		const currentYear = new Date().getFullYear();
		const currentAnoLabel = anosArray.find((a) => a.startsWith(`${currentYear}/`)) ?? anosArray[0];
		if (currentAnoLabel && filtroAnoAplicado === 'all') {
			filtroAno = currentAnoLabel;
			filtroAnoAplicado = currentAnoLabel;
		}

		if (escolasBd.length > 0) {
			escolasDisponiveis = escolasBd.map((e) => e.nome).sort();
		} else {
			const escSet = new Set();
			linhas.forEach((l) => { if (l.schoolName) escSet.add(l.schoolName); });
			escolasDisponiveis = Array.from(escSet).sort();
		}

		if (cursosBd.length > 0) {
			const filtered = filtroEscola === 'all'
				? cursosBd
				: cursosBd.filter((c) => c.escola === filtroEscola);
			cursosDisponiveis = filtered.map((c) => c.nome).sort();
		} else {
			const cursoSet = new Set();
			linhas.forEach((l) => {
				if (!l.courseName) return;
				if (filtroEscola === 'all' || l.schoolName === filtroEscola) {
					cursoSet.add(l.courseName);
				}
			});
			cursosDisponiveis = Array.from(cursoSet).sort();
		}

		// O "Curso" depende da escola selecionada no seletor visual.
		// Os filtros só afetam as linhas ao clicar em "Aplicar filtros".

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
	// será sincronizado pelo $effect() quando o parâmetro "tab" mudar
	sidebarOptions.currentObject = $t("exemplos_base.objeto");
	sidebarOptions.currentModuleId = pageIds.exemplos.base.moduleId;
	sidebarOptions.currentObjectId = 1;

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

	const exportCsv = () => {
		if (typeof window === 'undefined') return;

		const rows = linhasFiltradas.length ? linhasFiltradas : linhas;
		const anoLabel = rows[0]
			? `${rows[0].anoLetivoInicio ?? ''}/${rows[0].anoLetivoFim ?? ''}`
			: '';

		const blob = exportToXlsx(rows, anoLabel);
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		const anoFile = filtroAnoAplicado !== 'all' ? filtroAnoAplicado.replace('/', '-') : 'todos';
		a.href = url;
		a.download = `Alunos_Proposta_Vagas_${anoFile}.xlsx`;
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
	/** @type {'regime-nacional' | 'reingresso-mudanca' | 'regimes-esp-internacionais' | 'concursos' | 'totais' | 'all'} */
	let modalTab = $state('regime-nacional');
	/** @type {'all' | '1f' | '2f' | '3f' | 'totais'} */
	let modalSection = $state('all');

	/** @param {CourseData} row */
	function abrirEditar(row) {
		editingRow = row;
		editForm = { ...row };
		modalSection = 'all';
		switch (activeTab) {
			case 'reingresso-mudanca':
				modalTab = 'reingresso-mudanca';
				break;
			case 'regimes-esp-internacionais':
				modalTab = 'regimes-esp-internacionais';
				break;
			case 'concursos':
				modalTab = 'concursos';
				break;
			case 'totais':
				modalTab = 'totais';
				break;
			case 'regime-nacional':
			default:
				modalTab = 'regime-nacional';
				break;
		}
	}
	function fecharEditar() {
		editingRow = null;
		editForm = null;
	}

	// Scroll to top
	let showScrollTop = $state(false);
	$effect(() => {
		const onScroll = () => { showScrollTop = window.scrollY > 400; };
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// Inline editing (apenas "Regime Nacional" na tabela)
	let inlineEditRowId = $state('');
	let inlineEditField = $state('');
	/** @type {CourseData | null} */
	let inlineEditRow = $state(null);
	let inlineEditValue = $state('0');
	let inlineEditCommitting = $state(false);

	/**
	 * @param {CourseData} row
	 * @param {keyof CourseData} field
	 */
	function beginInlineEdit(row, field) {
		if (activeTab !== 'regime-nacional' && activeTab !== 'sobras' && activeTab !== 'full' && activeTab !== 'reingresso-mudanca' && activeTab !== 'concursos' && activeTab !== 'regimes-esp-internacionais') return;
		if (activeTab === 'reingresso-mudanca' && (field === 'reingressoTotal1Ano' || field === 'mudancaColocadosMatriculados')) return;
		inlineEditRow = row;
		inlineEditRowId = row.id;
		inlineEditField = field;
		inlineEditValue = String(row?.[field] ?? 0);
		// Seleciona automaticamente o valor quando o input aparece (para o utilizador só escrever).
		setTimeout(() => {
			const all = Array.from(document.querySelectorAll('input.inline-edit-input'));
			const visible = /** @type {HTMLInputElement | undefined} */ (all.find((el) => el instanceof HTMLInputElement && el.offsetParent !== null));
			if (visible) {
				visible.focus();
				visible.select();
			}
		}, 0);
	}

	function closeInlineEdit() {
		inlineEditRow = null;
		inlineEditRowId = '';
		inlineEditField = '';
		inlineEditValue = '0';
	}

	// Quando o utilizador troca de tab, fecho qualquer edição inline pendente.
	// Isto evita que o `ondblclick` fique bloqueado por `inlineEditRowId` de uma tab anterior.
	$effect(() => {
		// Dependência explícita para re-executar só quando a tab mudar.
		const _tab = activeTab;
		closeInlineEdit();
	});

	async function commitInlineEdit() {
		if (inlineEditCommitting) return;
		if (!inlineEditRow) return;

		inlineEditCommitting = true;
		const r = inlineEditRow;
		const parsed = String(inlineEditValue ?? '')
			.trim()
			.replace(',', '.');
		const newValNum = Number(parsed);
		const isDecimalField =
			inlineEditField === 'mediaEntrada1F';
		const newVal = Number.isFinite(newValNum) ? (isDecimalField ? newValNum : Math.trunc(newValNum)) : 0;

		/** @type {Record<string, number>} */
		let payload = {};

		try {
			// Guardar apenas se mudou (evita PATCH desnecessários)
			const oldVal = (() => {
				switch (inlineEditField) {
					case 'vagasEfetivas3F':
						return Number(r.vagasEfetivas3F ?? r.vagas3F ?? 0);
					case 'vagas1F':
						return Number(r.vagas1F ?? 0);
					case 'candidatos1F':
						return Number(r.candidatos1F ?? 0);
					case 'colocados1F':
						return Number(r.colocados1F ?? 0);
					case 'vagas2F':
						return Number(r.vagas2F ?? 0);
					case 'candidatos2F':
						return Number(r.candidatos2F ?? 0);
					case 'colocados2F':
						return Number(r.colocados2F ?? 0);
					case 'vagas3F':
						return Number(r.vagas3F ?? 0);
					case 'candidatos3F':
						return Number(r.candidatos3F ?? 0);
					case 'colocados3F':
						return Number(r.colocados3F ?? 0);
					case 'matriculados1F':
						return Number(r.matriculados1F ?? 0);
					case 'matriculados2F':
						return Number(r.matriculados2F ?? 0);
					case 'matriculados3F':
						return Number(r.matriculados3F ?? 0);
					case 'sobrasPos3F':
						return Number(r.sobrasPos3F ?? 0);
					case 'diffVagasMatAntes3F':
						return Number(r.diffVagasMatAntes3F ?? 0);
					case 'percOcupacaoCna':
						return Number(r.percOcupacaoCna ?? 0);
					case 'candidatos1Opcao1F':
						return Number(r.candidatos1Opcao1F ?? 0);
					case 'candidatos1Opcao2F':
						return Number(r.candidatos1Opcao2F ?? 0);
					case 'candidatos1Opcao3F':
						return Number(r.candidatos1Opcao3F ?? 0);
					case 'classificacaoUltimo1F':
						return Number(r.classificacaoUltimo1F ?? 0);
					case 'mediaEntrada1F':
						return Number(r.mediaEntrada1F ?? 0);
					case 'classificacaoUltimo2F':
						return Number(r.classificacaoUltimo2F ?? 0);
				case 'classificacaoUltimo3F':
					return Number(r.classificacaoUltimo3F ?? 0);
				case 'reingressoVagas':
					return Number(r.reingressoVagas ?? 0);
				case 'reingressoCandidatos':
					return Number(r.reingressoCandidatos ?? 0);
				case 'reingressoAno1':
					return Number(r.reingressoAno1 ?? 0);
				case 'reingressoAno2':
					return Number(r.reingressoAno2 ?? 0);
				case 'reingressoAno3':
					return Number(r.reingressoAno3 ?? 0);
				case 'reingressoAno4':
					return Number(r.reingressoAno4 ?? 0);
				case 'mudancaVagas':
					return Number(r.mudancaVagas ?? 0);
			case 'mudancaCandidatos':
				return Number(r.mudancaCandidatos ?? 0);
			case 'over23Vagas': return Number(r.over23Vagas ?? 0);
			case 'over23Candidatos': return Number(r.over23Candidatos ?? 0);
			case 'over23Colocados': return Number(r.over23Colocados ?? 0);
			case 'over23Matriculados': return Number(r.over23Matriculados ?? 0);
			case 'cetVagas': return Number(r.cetVagas ?? 0);
			case 'cetCandidatos': return Number(r.cetCandidatos ?? 0);
			case 'cetColocados': return Number(r.cetColocados ?? 0);
			case 'cetMatriculados': return Number(r.cetMatriculados ?? 0);
			case 'ctespVagas': return Number(r.ctespVagas ?? 0);
			case 'ctespCandidatos': return Number(r.ctespCandidatos ?? 0);
			case 'ctespColocados': return Number(r.ctespColocados ?? 0);
			case 'ctespMatriculados': return Number(r.ctespMatriculados ?? 0);
			case 'otherHigherVagas': return Number(r.otherHigherVagas ?? 0);
			case 'otherHigherCandidatos': return Number(r.otherHigherCandidatos ?? 0);
			case 'otherHigherColocados': return Number(r.otherHigherColocados ?? 0);
			case 'otherHigherMatriculados': return Number(r.otherHigherMatriculados ?? 0);
			case 'dualCertVagas': return Number(r.dualCertVagas ?? 0);
			case 'dualCertCandidatos': return Number(r.dualCertCandidatos ?? 0);
			case 'dualCertColocados': return Number(r.dualCertColocados ?? 0);
			case 'dualCertMatriculados': return Number(r.dualCertMatriculados ?? 0);
			case 'regimesEspVagas': return Number(r.regimesEspVagas ?? 0);
			case 'regimesEspCandidatos': return Number(r.regimesEspCandidatos ?? 0);
			case 'regimesEspMatriculados': return Number(r.regimesEspMatriculados ?? 0);
			case 'internationalVagas': return Number(r.internationalVagas ?? 0);
			case 'internationalCandidatos': return Number(r.internationalCandidatos ?? 0);
			case 'internationalMatriculados': return Number(r.internationalMatriculados ?? 0);
			default:
				return NaN;
			}
			})();

			if (!Number.isNaN(oldVal)) {
				const same = isDecimalField ? Math.abs(newVal - oldVal) < 1e-9 : newVal === oldVal;
				if (same) {
					closeInlineEdit();
					return;
				}
			}

			switch (inlineEditField) {
				// Para evitar o backend colocar NULL quando o payload vem "parcial",
				// enviamos sempre o trio completo (vagas/candidatos/colocados) da fase.
				case 'vagas1F':
					payload = { vagas1F: newVal, candidatos1F: r.candidatos1F ?? 0, colocados1F: r.colocados1F ?? 0 };
					break;
				case 'candidatos1F':
					payload = { vagas1F: r.vagas1F ?? 0, candidatos1F: newVal, colocados1F: r.colocados1F ?? 0 };
					break;
				case 'colocados1F':
					payload = { vagas1F: r.vagas1F ?? 0, candidatos1F: r.candidatos1F ?? 0, colocados1F: newVal };
					break;
				case 'matriculados1F':
					// O modal/VIEW tratam "matriculados" como dependente de "colocados".
					// Por isso, ao editar Matric. 1.ªF, persistimos em "colocados1F".
					payload = { vagas1F: r.vagas1F ?? 0, candidatos1F: r.candidatos1F ?? 0, colocados1F: newVal };
					break;
				case 'candidatos1Opcao1F':
					payload = {
						vagas1F: r.vagas1F ?? 0,
						candidatos1F: r.candidatos1F ?? 0,
						candidatos1Opcao1F: newVal,
						colocados1F: r.colocados1F ?? 0
					};
					break;
				case 'vagas2F':
					payload = { vagas2F: newVal, candidatos2F: r.candidatos2F ?? 0, colocados2F: r.colocados2F ?? 0 };
					break;
				case 'candidatos2F':
					payload = { vagas2F: r.vagas2F ?? 0, candidatos2F: newVal, colocados2F: r.colocados2F ?? 0 };
					break;
				case 'colocados2F':
					payload = { vagas2F: r.vagas2F ?? 0, candidatos2F: r.candidatos2F ?? 0, colocados2F: newVal };
					break;
				case 'matriculados2F':
					// Persistimos em "colocados2F" (matriculados é dependente).
					payload = { vagas2F: r.vagas2F ?? 0, candidatos2F: r.candidatos2F ?? 0, colocados2F: newVal };
					break;
				case 'candidatos1Opcao2F':
					payload = {
						vagas2F: r.vagas2F ?? 0,
						candidatos2F: r.candidatos2F ?? 0,
						candidatos1Opcao2F: newVal,
						colocados2F: r.colocados2F ?? 0
					};
					break;
				case 'vagas3F':
					payload = { vagas3F: newVal, candidatos3F: r.candidatos3F ?? 0, colocados3F: r.colocados3F ?? 0 };
					break;
				case 'vagasEfetivas3F':
					// No teu backend atual, "vagasEfetivas3F" está mapeado para a mesma base de "vagas3F".
					payload = { vagas3F: newVal, candidatos3F: r.candidatos3F ?? 0, colocados3F: r.colocados3F ?? 0 };
					break;
				case 'candidatos3F':
					payload = { vagas3F: r.vagas3F ?? 0, candidatos3F: newVal, colocados3F: r.colocados3F ?? 0 };
					break;
				case 'colocados3F':
					payload = { vagas3F: r.vagas3F ?? 0, candidatos3F: r.candidatos3F ?? 0, colocados3F: newVal };
					break;
				case 'matriculados3F':
					// Persistimos em "colocados3F" (matriculados é dependente).
					payload = { vagas3F: r.vagas3F ?? 0, candidatos3F: r.candidatos3F ?? 0, colocados3F: newVal };
					break;
				case 'candidatos1Opcao3F':
					payload = {
						vagas3F: r.vagas3F ?? 0,
						candidatos3F: r.candidatos3F ?? 0,
						candidatos1Opcao3F: newVal,
						colocados3F: r.colocados3F ?? 0
					};
					break;
				case 'sobrasPos3F':
					payload = { sobrasPos3F: newVal };
					break;
				case 'diffVagasMatAntes3F':
					payload = { diffVagasMatAntes3F: newVal };
					break;
				case 'percOcupacaoCna':
					payload = { percOcupacaoCna: newVal };
					break;
				case 'classificacaoUltimo1F':
					payload = {
						vagas1F: r.vagas1F ?? 0,
						candidatos1F: r.candidatos1F ?? 0,
						candidatos1Opcao1F: r.candidatos1Opcao1F ?? 0,
						colocados1F: r.colocados1F ?? 0,
						classificacaoUltimo1F: newVal,
						mediaEntrada1F: r.mediaEntrada1F ?? 0
					};
					break;
				case 'mediaEntrada1F':
					payload = {
						vagas1F: r.vagas1F ?? 0,
						candidatos1F: r.candidatos1F ?? 0,
						candidatos1Opcao1F: r.candidatos1Opcao1F ?? 0,
						colocados1F: r.colocados1F ?? 0,
						classificacaoUltimo1F: r.classificacaoUltimo1F ?? 0,
						mediaEntrada1F: newVal
					};
					break;
				case 'classificacaoUltimo2F':
					payload = {
						vagas2F: r.vagas2F ?? 0,
						candidatos2F: r.candidatos2F ?? 0,
						candidatos1Opcao2F: r.candidatos1Opcao2F ?? 0,
						colocados2F: r.colocados2F ?? 0,
						classificacaoUltimo2F: newVal
					};
					break;
			case 'classificacaoUltimo3F':
				payload = {
					vagas3F: r.vagas3F ?? 0,
					candidatos3F: r.candidatos3F ?? 0,
					candidatos1Opcao3F: r.candidatos1Opcao3F ?? 0,
					colocados3F: r.colocados3F ?? 0,
					classificacaoUltimo3F: newVal
				};
				break;
			case 'reingressoVagas':
			case 'reingressoCandidatos':
			case 'reingressoAno1':
			case 'reingressoAno2':
			case 'reingressoAno3':
			case 'reingressoAno4':
			case 'mudancaVagas':
			case 'mudancaCandidatos':
				payload = {
					reingressoVagas: inlineEditField === 'reingressoVagas' ? newVal : (r.reingressoVagas ?? 0),
					reingressoCandidatos: inlineEditField === 'reingressoCandidatos' ? newVal : (r.reingressoCandidatos ?? 0),
					reingressoAno1: inlineEditField === 'reingressoAno1' ? newVal : (r.reingressoAno1 ?? 0),
					reingressoAno2: inlineEditField === 'reingressoAno2' ? newVal : (r.reingressoAno2 ?? 0),
					reingressoAno3: inlineEditField === 'reingressoAno3' ? newVal : (r.reingressoAno3 ?? 0),
					reingressoAno4: inlineEditField === 'reingressoAno4' ? newVal : (r.reingressoAno4 ?? 0),
					mudancaVagas: inlineEditField === 'mudancaVagas' ? newVal : (r.mudancaVagas ?? 0),
					mudancaCandidatos: inlineEditField === 'mudancaCandidatos' ? newVal : (r.mudancaCandidatos ?? 0),
					mudancaColocadosMatriculados: r.mudancaColocadosMatriculados ?? 0
				};
				break;
			case 'over23Vagas':
			case 'over23Candidatos':
			case 'over23Colocados':
			case 'over23Matriculados':
			case 'cetVagas':
			case 'cetCandidatos':
			case 'cetColocados':
			case 'cetMatriculados':
			case 'ctespVagas':
			case 'ctespCandidatos':
			case 'ctespColocados':
			case 'ctespMatriculados':
			case 'otherHigherVagas':
			case 'otherHigherCandidatos':
			case 'otherHigherColocados':
			case 'otherHigherMatriculados':
			case 'dualCertVagas':
			case 'dualCertCandidatos':
			case 'dualCertColocados':
			case 'dualCertMatriculados':
				payload = {
					over23Vagas: inlineEditField === 'over23Vagas' ? newVal : (r.over23Vagas ?? 0),
					over23Candidatos: inlineEditField === 'over23Candidatos' ? newVal : (r.over23Candidatos ?? 0),
					over23Colocados: inlineEditField === 'over23Colocados' ? newVal : (r.over23Colocados ?? 0),
					over23Matriculados: inlineEditField === 'over23Matriculados' ? newVal : (r.over23Matriculados ?? 0),
					cetVagas: inlineEditField === 'cetVagas' ? newVal : (r.cetVagas ?? 0),
					cetCandidatos: inlineEditField === 'cetCandidatos' ? newVal : (r.cetCandidatos ?? 0),
					cetColocados: inlineEditField === 'cetColocados' ? newVal : (r.cetColocados ?? 0),
					cetMatriculados: inlineEditField === 'cetMatriculados' ? newVal : (r.cetMatriculados ?? 0),
					ctespVagas: inlineEditField === 'ctespVagas' ? newVal : (r.ctespVagas ?? 0),
					ctespCandidatos: inlineEditField === 'ctespCandidatos' ? newVal : (r.ctespCandidatos ?? 0),
					ctespColocados: inlineEditField === 'ctespColocados' ? newVal : (r.ctespColocados ?? 0),
					ctespMatriculados: inlineEditField === 'ctespMatriculados' ? newVal : (r.ctespMatriculados ?? 0),
					otherHigherVagas: inlineEditField === 'otherHigherVagas' ? newVal : (r.otherHigherVagas ?? 0),
					otherHigherCandidatos: inlineEditField === 'otherHigherCandidatos' ? newVal : (r.otherHigherCandidatos ?? 0),
					otherHigherColocados: inlineEditField === 'otherHigherColocados' ? newVal : (r.otherHigherColocados ?? 0),
					otherHigherMatriculados: inlineEditField === 'otherHigherMatriculados' ? newVal : (r.otherHigherMatriculados ?? 0),
					dualCertVagas: inlineEditField === 'dualCertVagas' ? newVal : (r.dualCertVagas ?? 0),
					dualCertCandidatos: inlineEditField === 'dualCertCandidatos' ? newVal : (r.dualCertCandidatos ?? 0),
					dualCertColocados: inlineEditField === 'dualCertColocados' ? newVal : (r.dualCertColocados ?? 0),
					dualCertMatriculados: inlineEditField === 'dualCertMatriculados' ? newVal : (r.dualCertMatriculados ?? 0)
				};
				break;
			case 'regimesEspVagas':
			case 'regimesEspCandidatos':
			case 'regimesEspMatriculados':
			case 'internationalVagas':
			case 'internationalCandidatos':
			case 'internationalMatriculados':
				payload = {
					regimesEspVagas: inlineEditField === 'regimesEspVagas' ? newVal : (r.regimesEspVagas ?? 0),
					regimesEspCandidatos: inlineEditField === 'regimesEspCandidatos' ? newVal : (r.regimesEspCandidatos ?? 0),
					regimesEspMatriculados: inlineEditField === 'regimesEspMatriculados' ? newVal : (r.regimesEspMatriculados ?? 0),
					internationalVagas: inlineEditField === 'internationalVagas' ? newVal : (r.internationalVagas ?? 0),
					internationalCandidatos: inlineEditField === 'internationalCandidatos' ? newVal : (r.internationalCandidatos ?? 0),
					internationalMatriculados: inlineEditField === 'internationalMatriculados' ? newVal : (r.internationalMatriculados ?? 0)
				};
				break;
			default:
				return;
		}

		const reingressoFields = ['reingressoVagas', 'reingressoCandidatos', 'reingressoAno1', 'reingressoAno2', 'reingressoAno3', 'reingressoAno4', 'mudancaVagas', 'mudancaCandidatos'];
		const concursosFields = ['over23Vagas', 'over23Candidatos', 'over23Colocados', 'over23Matriculados', 'cetVagas', 'cetCandidatos', 'cetColocados', 'cetMatriculados', 'ctespVagas', 'ctespCandidatos', 'ctespColocados', 'ctespMatriculados', 'otherHigherVagas', 'otherHigherCandidatos', 'otherHigherColocados', 'otherHigherMatriculados', 'dualCertVagas', 'dualCertCandidatos', 'dualCertColocados', 'dualCertMatriculados'];
		const regimesFields = ['regimesEspVagas', 'regimesEspCandidatos', 'regimesEspMatriculados', 'internationalVagas', 'internationalCandidatos', 'internationalMatriculados'];

		let endpoint;
		if (reingressoFields.includes(inlineEditField)) {
			endpoint = `/api/vagas/reingresso-mudanca/${r.id}`;
		} else if (concursosFields.includes(inlineEditField)) {
			endpoint = `/api/vagas/concursos/${r.id}`;
		} else if (regimesFields.includes(inlineEditField)) {
			endpoint = `/api/vagas/regimes-esp-internacionais/${r.id}`;
		} else {
			endpoint = `/api/vagas/curso/${r.id}`;
		}

		const res = await fetch(endpoint, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

			if (!res.ok) {
				console.error('Falha ao guardar edição inline', await res.text());
				return;
			}

			toastr.success('Dados guardados com sucesso!', 'SUCESSO', { timeOut: 5000, progressBar: true });
			await invalidateAll();
			closeInlineEdit();
		} catch (e) {
			console.error('Erro ao guardar edição inline', e);
		} finally {
			inlineEditCommitting = false;
		}
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

		/** @param {string} msg */
		const showSuccess = (msg) => {
			toastr.success(msg, 'SUCESSO', { timeOut: 5000, progressBar: true });
		};

		// Apenas persistimos quando estamos no modal do Regime Nacional (CNA).
		// Os campos derivados (fórmulas) recalculam via VIEW no SQL quando a tabela voltar a ser carregada.
		if (modalTab === 'regime-nacional') {
			try {
				const payload = {
					vagas1F: Number(editForm.vagas1F) || 0,
					candidatos1F: Number(editForm.candidatos1F) || 0,
					candidatos1Opcao1F: Number(editForm.candidatos1Opcao1F ?? 0) || 0,
					colocados1F: Number(editForm.colocados1F) || 0,
					vagas2F: Number(editForm.vagas2F) || 0,
					candidatos2F: Number(editForm.candidatos2F) || 0,
					candidatos1Opcao2F: Number(editForm.candidatos1Opcao2F ?? 0) || 0,
					colocados2F: Number(editForm.colocados2F) || 0,
					vagas3F: Number(editForm.vagas3F) || 0,
					candidatos3F: Number(editForm.candidatos3F) || 0,
					candidatos1Opcao3F: Number(editForm.candidatos1Opcao3F ?? 0) || 0,
					colocados3F: Number(editForm.colocados3F) || 0,
					diffVagasMatAntes3F: Number(editForm.diffVagasMatAntes3F ?? 0) || 0,
					// Classificação e média (último colocado / média de entrada)
					classificacaoUltimo1F: Number(editForm.classificacaoUltimo1F ?? 0) || 0,
					mediaEntrada1F: Number(editForm.mediaEntrada1F ?? 0) || 0,
					classificacaoUltimo2F: Number(editForm.classificacaoUltimo2F ?? 0) || 0,
					classificacaoUltimo3F: Number(editForm.classificacaoUltimo3F ?? 0) || 0,
					percOcupacaoCna: Number(String(editForm.percOcupacaoCna ?? 0).replace(',', '.')) || 0,
					sobrasPos3F: Number(editForm.sobrasPos3F ?? 0) || 0
				};

				const res = await fetch(`/api/vagas/curso/${editingRow.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});

				if (!res.ok) {
					console.error('Falha ao guardar CNA', await res.text());
				} else {
					showSuccess('Dados guardados com sucesso!');
				}
			} catch (e) {
				console.error('Erro ao guardar CNA', e);
			} finally {
				await invalidateAll();
				fecharEditar();
			}

			return;
		}

		if (modalTab === 'reingresso-mudanca') {
			try {
				const payload = {
					reingressoVagas: Number(editForm.reingressoVagas) || 0,
					reingressoCandidatos: Number(editForm.reingressoCandidatos) || 0,
					reingressoAno1: Number(editForm.reingressoAno1) || 0,
					reingressoAno2: Number(editForm.reingressoAno2) || 0,
					reingressoAno3: Number(editForm.reingressoAno3) || 0,
					reingressoAno4: Number(editForm.reingressoAno4) || 0,

					mudancaVagas: Number(editForm.mudancaVagas) || 0,
					mudancaCandidatos: Number(editForm.mudancaCandidatos) || 0,
					mudancaColocadosMatriculados: Number(editForm.mudancaColocadosMatriculados) || 0
				};

				const res = await fetch(`/api/vagas/reingresso-mudanca/${editingRow.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});

				if (!res.ok) {
					console.error('Falha ao guardar reingresso/mudança', await res.text());
				} else {
					showSuccess('Dados guardados com sucesso!');
				}
			} catch (e) {
				console.error('Erro ao guardar reingresso/mudança', e);
			} finally {
				await invalidateAll();
				fecharEditar();
			}

			return;
		}

		if (modalTab === 'concursos') {
			try {
				const payload = {
					over23Vagas: Number(editForm.over23Vagas) || 0,
					over23Candidatos: Number(editForm.over23Candidatos) || 0,
					over23Colocados: Number(editForm.over23Colocados) || 0,
					over23Matriculados: Number(editForm.over23Matriculados) || 0,

					cetVagas: Number(editForm.cetVagas) || 0,
					cetCandidatos: Number(editForm.cetCandidatos) || 0,
					cetColocados: Number(editForm.cetColocados) || 0,
					cetMatriculados: Number(editForm.cetMatriculados) || 0,

					ctespVagas: Number(editForm.ctespVagas) || 0,
					ctespCandidatos: Number(editForm.ctespCandidatos) || 0,
					ctespColocados: Number(editForm.ctespColocados) || 0,
					ctespMatriculados: Number(editForm.ctespMatriculados) || 0,

					otherHigherVagas: Number(editForm.otherHigherVagas) || 0,
					otherHigherCandidatos: Number(editForm.otherHigherCandidatos) || 0,
					otherHigherColocados: Number(editForm.otherHigherColocados) || 0,
					otherHigherMatriculados: Number(editForm.otherHigherMatriculados) || 0,

					dualCertVagas: Number(editForm.dualCertVagas) || 0,
					dualCertCandidatos: Number(editForm.dualCertCandidatos) || 0,
					dualCertColocados: Number(editForm.dualCertColocados) || 0,
					dualCertMatriculados: Number(editForm.dualCertMatriculados) || 0
				};

				const res = await fetch(`/api/vagas/concursos/${editingRow.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});

				if (!res.ok) {
					console.error('Falha ao guardar concursos', await res.text());
				} else {
					showSuccess('Dados guardados com sucesso!');
				}
			} catch (e) {
				console.error('Erro ao guardar concursos', e);
			} finally {
				await invalidateAll();
				fecharEditar();
			}

			return;
		}

		if (modalTab === 'regimes-esp-internacionais') {
			try {
				const payload = {
					regimesEspVagas: Number(editForm.regimesEspVagas) || 0,
					regimesEspCandidatos: Number(editForm.regimesEspCandidatos) || 0,
					regimesEspMatriculados: Number(editForm.regimesEspMatriculados) || 0,

					internationalVagas: Number(editForm.internationalVagas) || 0,
					internationalCandidatos: Number(editForm.internationalCandidatos) || 0,
					internationalMatriculados: Number(editForm.internationalMatriculados) || 0
				};

				const res = await fetch(`/api/vagas/regimes-esp-internacionais/${editingRow.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});

				if (!res.ok) {
					console.error('Falha ao guardar regimes esp+internacionais', await res.text());
				} else {
					showSuccess('Dados guardados com sucesso!');
				}
			} catch (e) {
				console.error('Erro ao guardar regimes esp+internacionais', e);
			} finally {
				await invalidateAll();
				fecharEditar();
			}

			return;
		}

		// Para outros modais (reingresso/mudança/totais) ainda não temos endpoint completo: mantemos o comportamento anterior.
		// Total curso = soma dos 4 anos (calculado)
		const sumAnos = (Number(editForm.year1) || 0) + (Number(editForm.year2) || 0) + (Number(editForm.year3) || 0) + (Number(editForm.year4) || 0);
		editForm.totalMatriculatedPerCourse = sumAnos;
		// Totais calculados: Colocados (5 concursos), Matriculados (5 concursos + regimes + int.), Diff (vagas − matriculados)
		editForm.totalColocados = sumConcursosColocados(editForm);
		editForm.totalMatriculados = sumConcursosMatriculados(editForm) + (Number(editForm.regimesEspMatriculados) || 0) + (Number(editForm.internationalMatriculados) || 0);
		fecharEditar();
	}

	// Estado ao criar novo ano (evita reload e efeito de "tabela grande que desaparece")
	let criandoNovaTabela = $state(false);

	// Modal de confirmação para criar nova tabela
	let modalConfirmNovoAno = $state(false);
	let anoNovoParaCriar = $state('');
	let modalConfirmNovoAnoLoading = $state(false);

	const fecharConfirmNovoAno = () => {
		if (criandoNovaTabela) return; // evita fechar enquanto está a correr
		modalConfirmNovoAno = false;
		modalConfirmNovoAnoLoading = false;
	};

	const confirmarCriarNovaTabela = async () => {
		if (criandoNovaTabela) return;
		modalConfirmNovoAno = false;
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
	};
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
	/* Campos calculados (dependentes de outras colunas no Excel) */
	.table-main td.formula-cell {
		background-color: #e9ecef;
		color: #495057;
		font-weight: 600;
	}

	.table-main .inline-edit-input {
		padding: 1px 2px;
		font-size: 12px;
		text-align: center;
		width: 100%;
		min-width: 0;
		max-width: 100%;
		box-sizing: border-box;
		height: 24px;
		line-height: 1;
		appearance: textfield;
		-moz-appearance: textfield;
	}
	.table-main .inline-edit-input::-webkit-outer-spin-button,
	.table-main .inline-edit-input::-webkit-inner-spin-button {
		appearance: none;
		-webkit-appearance: none;
		margin: 0;
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
	/* Filtros — layout compacto (como no screenshot) */
	.filter-controls .form-label {
		font-size: 12px;
		color: #6c757d;
		margin-bottom: 2px;
	}
	.filter-controls select.form-control {
		border-radius: 4px;
		min-height: 36px;
		height: 36px; /* para igualar o botão de aplicar filtros */
	}
	.filter-controls .btn {
		border-radius: 4px;
	}
	.filter-controls .btn.filter-apply-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 36px; /* igual ao select (form-control-sm) */
		padding-left: 70px;
		padding-right: 70px;
		line-height: 36px;
		margin-left: 30px;
	}
	.filter-controls .btn.filter-apply-icon i {
		font-size: 16px;
		line-height: 1;
	}

	/* Confirm dialog e botões com hover (igual ao da pesquisa) */
	.modal-confirm-novo-ano {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		width: 100%;
		height: 100%;
	}

	.modal-confirm-novo-ano .modal-dialog {
		margin: 0 auto;
	}

	.btn-search-hover {
		transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
		background-color: #20a8d8 !important;
		border-color: #20a8d8 !important;
		background-image: none !important;
		color: #fff !important;
	}

	.btn-search-hover:hover {
		background-color: #1a93cc !important;
		border-color: #1a93cc !important;
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
		background: rgba(13, 17, 23, 0.35);
	}
	.modal-editar-vagas .modal-content {
		border: 1px solid rgba(233, 236, 239, 1);
		border-radius: 14px;
		box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
	}
	.modal-editar-vagas .modal-header {
		border-bottom: 1px solid rgba(233, 236, 239, 1);
		padding: 1rem 1.25rem;
		background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
		border-radius: 14px 14px 0 0;
	}
	.modal-editar-vagas .modal-title {
		font-size: 1.05rem;
		font-weight: 600;
		color: #212529;
	}
	.modal-editar-vagas .modal-header .close {
		opacity: 0.6;
		font-size: 1.35rem;
		padding: 0;
		margin: -0.25rem -0.25rem -0.25rem auto;
		line-height: 1;
	}
	.modal-editar-vagas .modal-header .close:hover {
		opacity: 0.95;
	}
	.modal-editar-vagas .modal-body {
		padding: 1.2rem 1.5rem;
	}
	.modal-editar-vagas .modal-body .small.text-muted {
		font-size: 0.85rem;
		line-height: 1.45;
		color: #6c757d;
	}
	.modal-editar-vagas label {
		font-size: 0.86rem;
		color: #495057;
		font-weight: 500;
	}
	.modal-editar-vagas input.form-control {
		border-radius: 10px;
		border: 1px solid #dde3f0;
		box-shadow: none;
	}
	.modal-editar-vagas input.form-control:focus {
		border-color: #0b5ed7;
		box-shadow: 0 0 0 3px rgba(11, 94, 215, 0.12);
	}
	.modal-editar-vagas input.form-control:disabled {
		background: #f8f9fa;
		color: #6c757d;
	}
	/* Campos calculados (fórmulas) - não editáveis */
	.modal-editar-vagas input.form-control.formula-field:disabled {
		background: #e9ecef;
		color: #495057;
		border-color: #d8dde6;
	}
	.modal-editar-vagas .modal-footer {
		display: flex;
		justify-content: flex-end;
		border-top: 1px solid rgba(233, 236, 239, 1);
		padding: 1rem 1.25rem;
		background: #fafbfc;
		border-radius: 0 0 14px 14px;
		gap: 0.5rem;
	}
	.modal-editar-vagas .modal-footer .btn {
		border-radius: 8px;
		font-weight: 500;
		padding: 0.5rem 1rem;
	}

	/* Notas para a tabela do Regime Nacional */
	.regime-notes {
		margin-top: 10px;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		background: #f8fafc;
		padding: 10px 12px;
	}
	.regime-notes-title {
		font-weight: 700;
		font-size: 12px;
		color: #0b5ed7;
		margin-bottom: 6px;
	}
	.regime-notes-item {
		font-size: 12px;
		color: #495057;
		padding: 2px 0;
	}
	.regime-notes-tag {
		display: inline-block;
		min-width: 28px;
		font-weight: 700;
		color: #0b5ed7;
	}

	/* Modal: edição Regime Nacional (CNA) — layout por secções */
	.regime-edit-title {
		font-weight: 700;
		color: #0b5ed7;
		margin-bottom: 12px;
		font-size: 0.95rem;
	}
	.modal-section-nav {
		border-bottom: 1px solid #dee2e6;
		padding-bottom: 0;
		margin-bottom: 16px !important;
	}
	.modal-section-nav .nav-link {
		font-size: 0.82rem;
		padding: 5px 10px;
		border-radius: 4px 4px 0 0;
		color: #495057;
		cursor: pointer;
		border: 1px solid transparent;
		border-bottom: none;
		background: none;
	}
	.modal-section-nav .nav-link:hover {
		background: #f0f4ff;
	}
	.modal-section-nav .nav-link.active {
		background: #fff;
		color: #0b5ed7;
		font-weight: 600;
		border-color: #dee2e6;
		border-bottom: 2px solid #fff;
		margin-bottom: -1px;
	}
	.regime-edit-section {
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 12px 14px;
		background: #ffffff;
		margin-bottom: 12px;
	}
	.regime-edit-section-title {
		font-weight: 800;
		color: #0b5ed7;
		font-size: 0.85rem;
		margin-bottom: 8px;
		text-transform: none;
	}

	/* KPIs — estilo clean */
	/* (cards KPI removidos) */

	.scroll-top-btn {
		position: fixed;
		bottom: 28px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1050;
		width: 42px;
		height: 42px;
		border-radius: 50%;
		border: none;
		background: rgba(50, 130, 184, 0.85);
		color: #fff;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
		transition: opacity 0.25s, background 0.2s;
		opacity: 0.85;
	}
	.scroll-top-btn:hover {
		opacity: 1;
		background: rgba(50, 130, 184, 1);
	}
</style>

<div>
	<Breadcrum modulo={sidebarOptions.currentModule} objeto={sidebarOptions.currentObject} menu_items={items_breadcrum}>
		<svelte:fragment slot="actions">
			<button
				type="button"
				class="btn botao-breadcrumb-on btn-sm fw-bold btn-search-hover"
				style="min-width: 130px; height: 36px; border-radius: 4px; font-size: 14px; font-weight: 700;"
				disabled={criandoNovaTabela}
				onclick={async () => {
					if (criandoNovaTabela) return;
					anoNovoParaCriar = '';
					modalConfirmNovoAnoLoading = true;
					modalConfirmNovoAno = true;

					try {
						const res = await fetch('/api/vagas/novo-ano', { method: 'GET' });
						if (res.ok) {
							const data = await res.json();
							const ano = data?.ano;
							if (ano && typeof ano.ano_inicio === 'number' && typeof ano.ano_fim === 'number') {
								anoNovoParaCriar = `${ano.ano_inicio}/${ano.ano_fim}`;
							}
						}
					} catch (e) {
						console.error('Erro ao obter próximo ano letivo', e);
					} finally {
						modalConfirmNovoAnoLoading = false;
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
		</svelte:fragment>
	</Breadcrum>

		<div class="p-2 mt-4">
			<div class="row filter-controls g-2 align-items-end mb-2">
				<div class="col-12 col-md-3">
					<label class="form-label" for="filtro-ano">Ano letivo</label>
					<select id="filtro-ano" class="form-control form-control-sm" bind:value={filtroAno}>
						{#if anosDisponiveis.length === 0}
							<option value="" disabled selected>Carregando...</option>
						{:else}
							{#each anosDisponiveis as ano}
								<option value={ano}>{ano}</option>
							{/each}
						{/if}
					</select>
				</div>

				<div class="col-12 col-md-3">
					<label class="form-label" for="filtro-escola">Escola</label>
					<select id="filtro-escola" class="form-control form-control-sm" bind:value={filtroEscola}>
						<option value="all">Todas</option>
						{#each escolasDisponiveis as escola}
							<option value={escola}>{escola}</option>
						{/each}
					</select>
				</div>

				<div class="col-12 col-md-3">
					<label class="form-label" for="filtro-curso">Curso</label>
					<div class="d-flex align-items-end">
						<select
							id="filtro-curso"
							class="form-control form-control-sm"
							style="flex: 1 1 auto;"
							bind:value={filtroCurso}
						>
							<option value="all">Todos</option>
							{#each cursosDisponiveis as curso}
								<option value={curso}>{curso}</option>
							{/each}
						</select>

						<button
							type="button"
							class="btn btn-primary btn-sm ms-2 filter-apply-icon"
							aria-label="Aplicar filtros"
							onclick={() => {
								filtroAnoAplicado = filtroAno;
								filtroEscolaAplicada = filtroEscola;
								filtroCursoAplicado = filtroCurso;
							}}
						>
							<i class="fa fa-search" aria-hidden="true"></i>
						</button>
					</div>
				</div>

			</div>

			<div class="row mt-1 mb-1 align-items-end">
				<div class="col-12 col-md-8 mb-2">
					<p class="text-muted mb-0" style="font-size: 12px;">
						Clique numa linha para ver o curso. Curso selecionado: <strong>{selectedCourse ? `${selectedCourse.courseName} (${selectedCourse.courseCode})` : 'nenhum'}</strong>
					</p>
				</div>
			</div>

			<!-- Nota de ajuda para a tabela -->
			<div class="row mb-2 mt-2">
				<div class="col-12 col-md-8 col-sm-12">
					<small class="text-muted">
						Clique nos cabeçalhos azuis dos grupos (Concursos especiais, Regimes especiais,
						Estudantes internacionais, Totais, Distribuição por ano) para expandir ou recolher as colunas de detalhe.
					</small>
				</div>
				<div class="col-12 col-md-4 d-flex justify-content-md-end justify-content-sm-end mt-sm-2 mt-md-0">
					<button
						type="button"
						class="btn btn-primary btn-sm btn-search-hover"
						style="min-width: 130px; height: 36px; border-radius: 4px; font-size: 14px; font-weight: 700;"
						onclick={exportCsv}
					>
						<i class="fa fa-download mr-1"></i> Exportar Excel
					</button>
				</div>
			</div>

		<div class="row mt-1">
			<div class="col-12 table-responsive">
				{#if activeTab === 'full'}
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
							<th class="group-header" rowspan="4">Transf CNA p outras IESup</th>
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
							<th class="group-header-secondary">Colocados / Matriculados (1.º ano)</th>
							<th class="group-header-secondary">Colocados / Matriculados (2.º ano)</th>
							<th class="group-header-secondary">Colocados / Matriculados (3.º ano)</th>
							<th class="group-header-secondary">Colocados / Matriculados (4.º ano)</th>
							<th class="group-header-secondary">TOTAL (só 1º ano)</th>
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
						{#each linhasFiltradas as row, idx (row.id)}
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
								ondblclick={() => {
									if (inlineEditRowId && inlineEditRowId === row.id) return;
									abrirEditar(row);
								}}
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
									<td ondblclick={() => beginInlineEdit(row, 'candidatos1Opcao1F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'candidatos1Opcao1F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.candidatos1Opcao1F}
										{/if}
									</td>
								<td>{row.colocados1F}</td>
								<td ondblclick={() => beginInlineEdit(row, 'classificacaoUltimo1F')}>
									{#if inlineEditRowId === row.id && inlineEditField === 'classificacaoUltimo1F'}
										<input
											type="number"
											min="0"
											step="1"
											class="form-control form-control-sm inline-edit-input"
											value={inlineEditValue}
											oninput={(e) => (inlineEditValue = e.currentTarget.value)}
											onclick={(e) => e.stopPropagation()}
											onblur={commitInlineEdit}
											onkeydown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													e.stopPropagation();
													commitInlineEdit();
												}
											}}
										/>
									{:else}
										{row.classificacaoUltimo1F}
									{/if}
								</td>
								<td ondblclick={() => beginInlineEdit(row, 'mediaEntrada1F')}>
									{#if inlineEditRowId === row.id && inlineEditField === 'mediaEntrada1F'}
										<input
											type="number"
											min="0"
											step="0.01"
											class="form-control form-control-sm inline-edit-input"
											value={inlineEditValue}
											oninput={(e) => (inlineEditValue = e.currentTarget.value)}
											onclick={(e) => e.stopPropagation()}
											onblur={commitInlineEdit}
											onkeydown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													e.stopPropagation();
													commitInlineEdit();
												}
											}}
										/>
									{:else}
										{row.mediaEntrada1F}
									{/if}
								</td>
								<!-- 2.ª fase -->
								<td>{row.vagas2F}</td>
								<td>{row.candidatos2F}</td>
								<td ondblclick={() => beginInlineEdit(row, 'candidatos1Opcao2F')}>
									{#if inlineEditRowId === row.id && inlineEditField === 'candidatos1Opcao2F'}
										<input
											type="number"
											min="0"
											step="1"
											class="form-control form-control-sm inline-edit-input"
											value={inlineEditValue}
											oninput={(e) => (inlineEditValue = e.currentTarget.value)}
											onclick={(e) => e.stopPropagation()}
											onblur={commitInlineEdit}
											onkeydown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													e.stopPropagation();
													commitInlineEdit();
												}
											}}
										/>
									{:else}
										{row.candidatos1Opcao2F}
									{/if}
								</td>
								<td>{row.colocados2F}</td>
								<td ondblclick={() => beginInlineEdit(row, 'classificacaoUltimo2F')}>
									{#if inlineEditRowId === row.id && inlineEditField === 'classificacaoUltimo2F'}
										<input
											type="number"
											min="0"
											step="1"
											class="form-control form-control-sm inline-edit-input"
											value={inlineEditValue}
											oninput={(e) => (inlineEditValue = e.currentTarget.value)}
											onclick={(e) => e.stopPropagation()}
											onblur={commitInlineEdit}
											onkeydown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													e.stopPropagation();
													commitInlineEdit();
												}
											}}
										/>
									{:else}
										{row.classificacaoUltimo2F}
									{/if}
								</td>
								<!-- 3.ª fase -->
								<td>{row.vagas3F}</td>
								<td ondblclick={() => beginInlineEdit(row, 'vagasEfetivas3F')}>
									{#if inlineEditRowId === row.id && inlineEditField === 'vagasEfetivas3F'}
										<input
											type="number"
											min="0"
											step="1"
											class="form-control form-control-sm inline-edit-input"
											value={inlineEditValue}
											oninput={(e) => (inlineEditValue = e.currentTarget.value)}
											onclick={(e) => e.stopPropagation()}
											onblur={commitInlineEdit}
											onkeydown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													e.stopPropagation();
													commitInlineEdit();
												}
											}}
										/>
									{:else}
										{row.vagasEfetivas3F}
									{/if}
								</td>
								<td>{row.candidatos3F}</td>
								<td ondblclick={() => beginInlineEdit(row, 'candidatos1Opcao3F')}>
									{#if inlineEditRowId === row.id && inlineEditField === 'candidatos1Opcao3F'}
										<input
											type="number"
											min="0"
											step="1"
											class="form-control form-control-sm inline-edit-input"
											value={inlineEditValue}
											oninput={(e) => (inlineEditValue = e.currentTarget.value)}
											onclick={(e) => e.stopPropagation()}
											onblur={commitInlineEdit}
											onkeydown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													e.stopPropagation();
													commitInlineEdit();
												}
											}}
										/>
									{:else}
										{row.candidatos1Opcao3F}
									{/if}
								</td>
								<td>{row.colocados3F}</td>
								<td ondblclick={() => beginInlineEdit(row, 'classificacaoUltimo3F')}>
									{#if inlineEditRowId === row.id && inlineEditField === 'classificacaoUltimo3F'}
										<input
											type="number"
											min="0"
											step="1"
											class="form-control form-control-sm inline-edit-input"
											value={inlineEditValue}
											oninput={(e) => (inlineEditValue = e.currentTarget.value)}
											onclick={(e) => e.stopPropagation()}
											onblur={commitInlineEdit}
											onkeydown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													e.stopPropagation();
													commitInlineEdit();
												}
											}}
										/>
									{:else}
										{row.classificacaoUltimo3F}
									{/if}
								</td>
								<!-- Totais CNA -->
								<td class="formula-cell">{row.totalCandidatosCna}</td>
								<td class="formula-cell">
									{(row.colocados1F ?? 0) + (row.colocados2F ?? 0) + (row.colocados3F ?? 0)}
								</td>
								<!-- Matriculados por fase + total -->
								<td ondblclick={() => beginInlineEdit(row, 'matriculados1F')}>
									{#if inlineEditRowId === row.id && inlineEditField === 'matriculados1F'}
										<input
											type="number"
											min="0"
											step="1"
											class="form-control form-control-sm inline-edit-input"
											value={inlineEditValue}
											oninput={(e) => (inlineEditValue = e.currentTarget.value)}
											onclick={(e) => e.stopPropagation()}
											onblur={commitInlineEdit}
											onkeydown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													e.stopPropagation();
													commitInlineEdit();
												}
											}}
										/>
									{:else}
										{row.matriculados1F}
									{/if}
								</td>
								<td ondblclick={() => beginInlineEdit(row, 'matriculados2F')}>
									{#if inlineEditRowId === row.id && inlineEditField === 'matriculados2F'}
										<input
											type="number"
											min="0"
											step="1"
											class="form-control form-control-sm inline-edit-input"
											value={inlineEditValue}
											oninput={(e) => (inlineEditValue = e.currentTarget.value)}
											onclick={(e) => e.stopPropagation()}
											onblur={commitInlineEdit}
											onkeydown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													e.stopPropagation();
													commitInlineEdit();
												}
											}}
										/>
									{:else}
										{row.matriculados2F}
									{/if}
								</td>
								<td ondblclick={() => beginInlineEdit(row, 'matriculados3F')}>
									{#if inlineEditRowId === row.id && inlineEditField === 'matriculados3F'}
										<input
											type="number"
											min="0"
											step="1"
											class="form-control form-control-sm inline-edit-input"
											value={inlineEditValue}
											oninput={(e) => (inlineEditValue = e.currentTarget.value)}
											onclick={(e) => e.stopPropagation()}
											onblur={commitInlineEdit}
											onkeydown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													e.stopPropagation();
													commitInlineEdit();
												}
											}}
										/>
									{:else}
										{row.matriculados3F}
									{/if}
								</td>
								<td class="formula-cell">
									{(row.matriculados1F ?? 0) + (row.matriculados2F ?? 0) + (row.matriculados3F ?? 0)}
								</td>
								<!-- Movimentos -->
								<td>{row.transfCnaOutrasIESup}</td>
								<td>{row.transfCnaIpvc}</td>
								<!-- SOBRAS pós 3.ª fase (fora do módulo Regime Nacional) -->
								<td ondblclick={() => beginInlineEdit(row, 'sobrasPos3F')}>
									{#if inlineEditRowId === row.id && inlineEditField === 'sobrasPos3F'}
										<input
											type="number"
											min="0"
											step="1"
											class="form-control form-control-sm inline-edit-input"
											value={inlineEditValue}
											oninput={(e) => (inlineEditValue = e.currentTarget.value)}
											onclick={(e) => e.stopPropagation()}
											onblur={commitInlineEdit}
											onkeydown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													e.stopPropagation();
													commitInlineEdit();
												}
											}}
										/>
									{:else}
										{row.sobrasPos3F}
									{/if}
								</td>
								<!-- Reingresso -->
								<td>{row.reingressoVagas}</td>
								<td>{row.reingressoCandidatos}</td>
								<td>{row.reingressoAno1}</td>
								<td>{row.reingressoAno2}</td>
								<td>{row.reingressoAno3}</td>
								<td>{row.reingressoAno4}</td>
								<td class="formula-cell">{row.reingressoTotal1Ano}</td>
								<!-- Mudança par Int/Curso -->
								<td>{row.mudancaVagas}</td>
								<td>{row.mudancaCandidatos}</td>
								<td class="formula-cell">{row.mudancaColocadosMatriculados}</td>
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
								<td class="formula-cell">
									{(row.colocados1F ?? 0) + (row.colocados2F ?? 0) + (row.colocados3F ?? 0)}
								</td>
								<td class="formula-cell">{row.totalMatriculados}</td>
								<td>{row.pedidosAnulacao}</td>
								<td>{row.totalAvailableVacancies}</td>
								<td>{row.diffVagasMatAntes3F}</td>
								<!-- TOTAL MATRICULADOS por ano -->
								<td>{row.year1}</td>
								<td>{row.year2}</td>
								<td>{row.year3}</td>
								<td>{row.year4}</td>
								<!-- Total matriculados por curso -->
								<td class="formula-cell">{row.totalMatriculatedPerCourse}</td>
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
				{:else}
				<table class="table-main">
						<thead>
						{#if activeTab === 'regime-nacional'}
							<tr>
								<th class="sticky-course" rowspan="2">Informação do curso</th>
						<th class="group-header-secondary" colspan="6">1.ª fase</th>
								<th class="group-header-secondary" colspan="5">2.ª fase</th>
								<th class="group-header-secondary" colspan="6">3.ª fase</th>
								<th class="group-header-secondary" colspan="2">Total CNA</th>
								<th class="group-header-secondary" colspan="4">TOTAL MATRICULADOS</th>
								<th class="group-header-secondary" rowspan="2">Transf CNA p outras IESup</th>
								<th class="group-header-secondary" rowspan="2">Transf CNA p o IPVC</th>
								<th class="group-header-secondary" rowspan="2">SOBRAS pós 3.ª fase</th>
								<th class="group-header-secondary" rowspan="2" style="width: 90px; max-width: 90px;">Ações</th>
							</tr>
							<tr>
								<!-- 1.ª fase -->
							<th class="group-header-secondary">Vagas CNA</th>
							<th class="group-header-secondary">Candidatos</th>
							<th class="group-header-secondary">Candidatos 1.ª opção (4)</th>
							<th class="group-header-secondary">Colocados (3)</th>
							<th class="group-header-secondary">Classif. últ. colocado</th>
							<th class="group-header-secondary">Média entrada</th>
								<!-- 2.ª fase -->
								<th class="group-header-secondary">Vagas (1)</th>
								<th class="group-header-secondary">Candidatos</th>
								<th class="group-header-secondary">Candidatos 1.ª opção (4)</th>
								<th class="group-header-secondary">Colocados (1)</th>
								<th class="group-header-secondary">Classif. últ. colocado</th>
								<!-- 3.ª fase -->
								<th class="group-header-secondary">Vagas (5)</th>
								<th class="group-header-secondary">Vagas efetivas (2)</th>
								<th class="group-header-secondary">Candidatos</th>
								<th class="group-header-secondary">Candidatos 1.ª opção (4)</th>
								<th class="group-header-secondary">Colocados (1)</th>
								<th class="group-header-secondary">Classif. últ. colocado</th>
								<!-- Totais CNA -->
								<th class="group-header-secondary">Total Cand. Total CNA</th>
								<th class="group-header-secondary">Total Colocados</th>
								<!-- Matriculados por fase -->
								<th class="group-header-secondary">Matric. 1.ªF</th>
								<th class="group-header-secondary">Matric. 2.ªF</th>
								<th class="group-header-secondary">Matric. 3.ªF</th>
								<th class="group-header-secondary">Total Matriculados</th>
							</tr>
						{:else if activeTab === 'concursos'}
							<tr>
								<th class="sticky-course" rowspan="2">Informação do curso</th>
								<th class="group-header-secondary" colspan="4">&gt;23 anos</th>
								<th class="group-header-secondary" colspan="4">CET</th>
								<th class="group-header-secondary" colspan="4">Titulares CTeSP</th>
								<th class="group-header-secondary" colspan="4">Titulares outros Curs Sup</th>
								<th class="group-header-secondary" colspan="4">Titulares cursos dupla Certif nível sec e c artísticos especializados</th>
								<th class="group-header-secondary" rowspan="2" style="width: 90px; max-width: 90px;">Ações</th>
							</tr>
							<tr>
								<th class="group-header-secondary">Vagas</th>
								<th class="group-header-secondary">Candidatos</th>
								<th class="group-header-secondary">Colocados</th>
								<th class="group-header-secondary">Matriculados</th>
								<th class="group-header-secondary">Vagas</th>
								<th class="group-header-secondary">Candidatos</th>
								<th class="group-header-secondary">Colocados</th>
								<th class="group-header-secondary">Matriculados</th>
								<th class="group-header-secondary">Vagas</th>
								<th class="group-header-secondary">Candidatos</th>
								<th class="group-header-secondary">Colocados</th>
								<th class="group-header-secondary">Matriculados</th>
								<th class="group-header-secondary">Vagas</th>
								<th class="group-header-secondary">Candidatos</th>
								<th class="group-header-secondary">Colocados</th>
								<th class="group-header-secondary">Matriculados</th>
								<th class="group-header-secondary">Vagas</th>
								<th class="group-header-secondary">Candidatos</th>
								<th class="group-header-secondary">Colocados</th>
								<th class="group-header-secondary">Matriculados</th>
							</tr>
						{:else if activeTab === 'reingresso-mudanca'}
							<tr>
								<th class="sticky-course" rowspan="2">Informação do curso</th>
								<th class="group-header-secondary" colspan="7">Reingresso</th>
								<th class="group-header-secondary" colspan="3">Mudança par Int/Curso</th>
								<th class="group-header-secondary" rowspan="2" style="width: 90px; max-width: 90px;">Ações</th>
							</tr>
							<tr>
								<th class="group-header-secondary">Vagas</th>
								<th class="group-header-secondary">Candidatos</th>
								<th class="group-header-secondary">Colocados / Matriculados (1.º ano)</th>
								<th class="group-header-secondary">Colocados / Matriculados (2.º ano)</th>
								<th class="group-header-secondary">Colocados / Matriculados (3.º ano)</th>
								<th class="group-header-secondary">Colocados / Matriculados (4.º ano)</th>
								<th class="group-header-secondary">TOTAL (só 1º ano)</th>
								<th class="group-header-secondary">Vagas</th>
								<th class="group-header-secondary">Candidatos</th>
								<th class="group-header-secondary">Colocados / Matriculados</th>
							</tr>
						{:else if activeTab === 'regimes-esp-internacionais'}
							<tr>
								<th class="sticky-course" rowspan="2">Informação do curso</th>
								<th class="group-header-secondary" colspan="3">Regimes Esp</th>
								<th class="group-header-secondary" colspan="3">Est Internacionais</th>
								<th class="group-header-secondary" rowspan="2" style="width: 90px; max-width: 90px;">Ações</th>
							</tr>
							<tr>
								<th class="group-header-secondary">Vagas</th>
								<th class="group-header-secondary">Candidatos</th>
								<th class="group-header-secondary">Matriculados</th>
								<th class="group-header-secondary">Vagas</th>
								<th class="group-header-secondary">Candidatos</th>
								<th class="group-header-secondary">Matriculados</th>
							</tr>
						{:else if activeTab === 'sobras'}
							<tr>
								<th class="sticky-course">Informação do curso</th>
								<th class="group-header-secondary">SOBRAS pós 3.ª fase</th>
								<th class="group-header-secondary">Anulações</th>
								<th class="group-header-secondary" style="width: 90px; max-width: 90px;">Ações</th>
							</tr>
						{:else if activeTab === 'totais'}
							<tr>
								<th class="sticky-course" rowspan="2">Informação do curso</th>
								<th class="group-header-secondary" rowspan="2">Total colocados</th>
								<th class="group-header-secondary" rowspan="2">Total matriculados</th>
								<th class="group-header-secondary" rowspan="2">Pedidos de Anulação de matrícula</th>
								<th class="group-header-secondary" rowspan="2">TOTAL VAGAS disponiveis</th>
								<th class="group-header-secondary" rowspan="2">DIFERENÇA vagas/mat antes 3F</th>
								<th class="group-header-secondary" colspan="4">TOTAL MATRICULADOS</th>
								<th class="group-header-secondary" rowspan="2">Total matriculados por curso</th>
								<th class="group-header-secondary" rowspan="2" style="width: 90px; max-width: 90px;">Ações</th>
							</tr>
							<tr>
								<th class="group-header-secondary">1.º ano</th>
								<th class="group-header-secondary">2.º ano</th>
								<th class="group-header-secondary">3.º ano</th>
								<th class="group-header-secondary">4.º ano</th>
							</tr>
						{:else}
							<tr>
								<th class="sticky-course">Informação do curso</th>
								<th class="group-header-secondary">Vagas 1.ª fase</th>
								<th class="group-header-secondary">Candidatos 1.ª fase</th>
								<th class="group-header-secondary">Colocados 1.ª fase</th>
								<th class="group-header-secondary">Matriculados 1.ª fase</th>
								<th class="group-header-secondary" style="width: 90px; max-width: 90px;">Ações</th>
							</tr>
						{/if}
					</thead>

					<tbody>
						{#each linhasFiltradas as row, idx (row.id)}
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
								ondblclick={() => {
									if (inlineEditRowId && inlineEditRowId === row.id) return;
									abrirEditar(row);
								}}
								style="cursor: pointer;"
							>
								<td class="sticky-course">
									<div style="display: flex; flex-direction: column; align-items: flex-start;">
										<span style="font-weight: 600;">{row.courseName}</span>
										<span style="font-size: 11px; color: #6c757d;">{row.courseCode}</span>
									</div>
								</td>

								{#if activeTab === 'regime-nacional'}
									<td ondblclick={() => beginInlineEdit(row, 'vagas1F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'vagas1F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.vagas1F}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'candidatos1F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'candidatos1F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.candidatos1F}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'candidatos1Opcao1F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'candidatos1Opcao1F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.candidatos1Opcao1F}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'colocados1F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'colocados1F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.colocados1F}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'classificacaoUltimo1F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'classificacaoUltimo1F'}
											<input
												type="number"
												min="0"
												step="0.01"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.classificacaoUltimo1F}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'mediaEntrada1F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'mediaEntrada1F'}
											<input
												type="number"
												min="0"
												step="0.01"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.mediaEntrada1F}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'vagas2F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'vagas2F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.vagas2F}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'candidatos2F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'candidatos2F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.candidatos2F}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'candidatos1Opcao2F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'candidatos1Opcao2F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.candidatos1Opcao2F}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'colocados2F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'colocados2F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.colocados2F}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'classificacaoUltimo2F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'classificacaoUltimo2F'}
											<input
												type="number"
												min="0"
												step="0.01"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.classificacaoUltimo2F}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'vagas3F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'vagas3F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.vagas3F}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'vagasEfetivas3F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'vagasEfetivas3F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.vagasEfetivas3F}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'candidatos3F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'candidatos3F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.candidatos3F}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'candidatos1Opcao3F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'candidatos1Opcao3F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.candidatos1Opcao3F}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'colocados3F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'colocados3F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.colocados3F}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'classificacaoUltimo3F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'classificacaoUltimo3F'}
											<input
												type="number"
												min="0"
												step="0.01"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.classificacaoUltimo3F}
										{/if}
									</td>
									<td class="formula-cell">{row.totalCandidatosCna}</td>
									<td class="formula-cell">
										{(row.colocados1F ?? 0) + (row.colocados2F ?? 0) + (row.colocados3F ?? 0)}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'matriculados1F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'matriculados1F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.matriculados1F}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'matriculados2F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'matriculados2F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.matriculados2F}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'matriculados3F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'matriculados3F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.matriculados3F}
										{/if}
									</td>
									<td class="formula-cell">
										{(row.matriculados1F ?? 0) + (row.matriculados2F ?? 0) + (row.matriculados3F ?? 0)}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'diffVagasMatAntes3F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'diffVagasMatAntes3F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.diffVagasMatAntes3F}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'percOcupacaoCna')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'percOcupacaoCna'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.percOcupacaoCna}
										{/if}
									</td>
									<td ondblclick={() => beginInlineEdit(row, 'sobrasPos3F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'sobrasPos3F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.sobrasPos3F}
										{/if}
									</td>
							{:else if activeTab === 'concursos'}
							<td ondblclick={() => beginInlineEdit(row, 'over23Vagas')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'over23Vagas'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.over23Vagas}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'over23Candidatos')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'over23Candidatos'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.over23Candidatos}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'over23Colocados')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'over23Colocados'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.over23Colocados}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'over23Matriculados')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'over23Matriculados'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.over23Matriculados}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'cetVagas')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'cetVagas'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.cetVagas}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'cetCandidatos')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'cetCandidatos'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.cetCandidatos}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'cetColocados')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'cetColocados'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.cetColocados}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'cetMatriculados')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'cetMatriculados'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.cetMatriculados}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'ctespVagas')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'ctespVagas'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.ctespVagas}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'ctespCandidatos')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'ctespCandidatos'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.ctespCandidatos}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'ctespColocados')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'ctespColocados'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.ctespColocados}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'ctespMatriculados')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'ctespMatriculados'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.ctespMatriculados}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'otherHigherVagas')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'otherHigherVagas'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.otherHigherVagas}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'otherHigherCandidatos')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'otherHigherCandidatos'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.otherHigherCandidatos}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'otherHigherColocados')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'otherHigherColocados'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.otherHigherColocados}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'otherHigherMatriculados')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'otherHigherMatriculados'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.otherHigherMatriculados}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'dualCertVagas')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'dualCertVagas'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.dualCertVagas}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'dualCertCandidatos')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'dualCertCandidatos'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.dualCertCandidatos}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'dualCertColocados')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'dualCertColocados'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.dualCertColocados}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'dualCertMatriculados')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'dualCertMatriculados'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.dualCertMatriculados}{/if}
							</td>
							{:else if activeTab === 'reingresso-mudanca'}
								<td ondblclick={() => beginInlineEdit(row, 'reingressoVagas')}>
									{#if inlineEditRowId === row.id && inlineEditField === 'reingressoVagas'}
										<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
									{:else}{row.reingressoVagas}{/if}
								</td>
								<td ondblclick={() => beginInlineEdit(row, 'reingressoCandidatos')}>
									{#if inlineEditRowId === row.id && inlineEditField === 'reingressoCandidatos'}
										<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
									{:else}{row.reingressoCandidatos}{/if}
								</td>
								<td ondblclick={() => beginInlineEdit(row, 'reingressoAno1')}>
									{#if inlineEditRowId === row.id && inlineEditField === 'reingressoAno1'}
										<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
									{:else}{row.reingressoAno1}{/if}
								</td>
								<td ondblclick={() => beginInlineEdit(row, 'reingressoAno2')}>
									{#if inlineEditRowId === row.id && inlineEditField === 'reingressoAno2'}
										<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
									{:else}{row.reingressoAno2}{/if}
								</td>
								<td ondblclick={() => beginInlineEdit(row, 'reingressoAno3')}>
									{#if inlineEditRowId === row.id && inlineEditField === 'reingressoAno3'}
										<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
									{:else}{row.reingressoAno3}{/if}
								</td>
								<td ondblclick={() => beginInlineEdit(row, 'reingressoAno4')}>
									{#if inlineEditRowId === row.id && inlineEditField === 'reingressoAno4'}
										<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
									{:else}{row.reingressoAno4}{/if}
								</td>
								<td class="formula-cell">{row.reingressoTotal1Ano}</td>
								<td ondblclick={() => beginInlineEdit(row, 'mudancaVagas')}>
									{#if inlineEditRowId === row.id && inlineEditField === 'mudancaVagas'}
										<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
									{:else}{row.mudancaVagas}{/if}
								</td>
								<td ondblclick={() => beginInlineEdit(row, 'mudancaCandidatos')}>
									{#if inlineEditRowId === row.id && inlineEditField === 'mudancaCandidatos'}
										<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
									{:else}{row.mudancaCandidatos}{/if}
								</td>
								<td class="formula-cell">{row.mudancaColocadosMatriculados}</td>
							{:else if activeTab === 'regimes-esp-internacionais'}
							<td ondblclick={() => beginInlineEdit(row, 'regimesEspVagas')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'regimesEspVagas'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.regimesEspVagas}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'regimesEspCandidatos')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'regimesEspCandidatos'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.regimesEspCandidatos}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'regimesEspMatriculados')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'regimesEspMatriculados'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.regimesEspMatriculados}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'internationalVagas')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'internationalVagas'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.internationalVagas}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'internationalCandidatos')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'internationalCandidatos'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.internationalCandidatos}{/if}
							</td>
							<td ondblclick={() => beginInlineEdit(row, 'internationalMatriculados')}>
								{#if inlineEditRowId === row.id && inlineEditField === 'internationalMatriculados'}
									<input type="number" min="0" step="1" class="form-control form-control-sm inline-edit-input" value={inlineEditValue} oninput={(e) => (inlineEditValue = e.currentTarget.value)} onclick={(e) => e.stopPropagation()} onblur={commitInlineEdit} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitInlineEdit(); } }} />
								{:else}{row.internationalMatriculados}{/if}
							</td>
								{:else if activeTab === 'sobras'}
									<td ondblclick={() => beginInlineEdit(row, 'sobrasPos3F')}>
										{#if inlineEditRowId === row.id && inlineEditField === 'sobrasPos3F'}
											<input
												type="number"
												min="0"
												step="1"
												class="form-control form-control-sm inline-edit-input"
												value={inlineEditValue}
												oninput={(e) => (inlineEditValue = e.currentTarget.value)}
												onclick={(e) => e.stopPropagation()}
												onblur={commitInlineEdit}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.stopPropagation();
														commitInlineEdit();
													}
												}}
											/>
										{:else}
											{row.sobrasPos3F}
										{/if}
									</td>
									<td>{row.pedidosAnulacao}</td>
								{:else if activeTab === 'totais'}
									<td class="formula-cell">
										{(row.colocados1F ?? 0) + (row.colocados2F ?? 0) + (row.colocados3F ?? 0)}
									</td>
									<td class="formula-cell">{row.totalMatriculados}</td>
									<td>{row.pedidosAnulacao}</td>
									<td>{row.totalAvailableVacancies}</td>
									<td>{row.diffVagasMatAntes3F}</td>
									<td>{row.year1}</td>
									<td>{row.year2}</td>
									<td>{row.year3}</td>
									<td>{row.year4}</td>
									<td class="formula-cell">{row.totalMatriculatedPerCourse}</td>
								{:else}
									<td>{row.vagas1F}</td>
									<td>{row.candidatos1F}</td>
									<td>{row.colocados1F}</td>
									<td>{row.matriculados1F}</td>
								{/if}

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
				{/if}
			</div>
		</div>

		{#if activeTab === 'full' || activeTab === 'regime-nacional'}
			<div class="regime-notes">
				<div class="regime-notes-title">Notas</div>
				<div class="regime-notes-item">
					<span class="regime-notes-tag">(1)</span>
					Vagas colocadas a concurso pela (5) vagas colocadas a conc pelo IPVC
				</div>
				<div class="regime-notes-item">
					<span class="regime-notes-tag">(2)</span>
					Vagas reais
				</div>
				<div class="regime-notes-item">
					<span class="regime-notes-tag">(3)</span>
					Com base nas listagens da DGES
				</div>
				<div class="regime-notes-item">
					<span class="regime-notes-tag">(4)</span>
					Com base nas listagens da DGES, considerando todos os alunos candidatos
				</div>
			</div>
		{/if}

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
						{#if modalTab === 'regime-nacional'}
							<div class="regime-edit-title">Regime Nacional (CNA)</div>

							<ul class="nav nav-pills nav-fill mb-3 modal-section-nav">
								<li class="nav-item">
									<button type="button" class="nav-link {modalSection === 'all' ? 'active' : ''}" onclick={() => (modalSection = 'all')}>Tudo</button>
								</li>
								<li class="nav-item">
									<button type="button" class="nav-link {modalSection === '1f' ? 'active' : ''}" onclick={() => (modalSection = '1f')}>1.ª fase</button>
								</li>
								<li class="nav-item">
									<button type="button" class="nav-link {modalSection === '2f' ? 'active' : ''}" onclick={() => (modalSection = '2f')}>2.ª fase</button>
								</li>
								<li class="nav-item">
									<button type="button" class="nav-link {modalSection === '3f' ? 'active' : ''}" onclick={() => (modalSection = '3f')}>3.ª fase</button>
								</li>
								<li class="nav-item">
									<button type="button" class="nav-link {modalSection === 'totais' ? 'active' : ''}" onclick={() => (modalSection = 'totais')}>Totais</button>
								</li>
							</ul>

							{#if modalSection === 'all' || modalSection === '1f'}
							<div class="regime-edit-section">
								<div class="regime-edit-section-title">1.ª fase (1F)</div>
								<div class="row">
									<div class="col-md-4 mb-2">
										<label for="v1f">Vagas CNA</label>
										<input id="v1f" type="number" min="0" class="form-control" bind:value={editForm.vagas1F} />
									</div>
									<div class="col-md-4 mb-2">
										<label for="c1f">Candidatos</label>
										<input id="c1f" type="number" min="0" class="form-control" bind:value={editForm.candidatos1F} />
									</div>
									<div class="col-md-4 mb-2">
										<label for="opc1f">Candidatos 1.ª opção (4)</label>
										<input id="opc1f" type="number" min="0" class="form-control" bind:value={editForm.candidatos1Opcao1F} />
									</div>
								</div>
								<div class="row mt-2">
									<div class="col-md-4 mb-2">
										<label for="col1f">Colocados (3)</label>
										<input id="col1f" type="number" min="0" class="form-control" bind:value={editForm.colocados1F} />
									</div>
									<div class="col-md-4 mb-2">
										<label for="class1f">Classif. últ. colocado</label>
										<input id="class1f" type="number" min="0" step="1" class="form-control" bind:value={editForm.classificacaoUltimo1F} />
									</div>
									<div class="col-md-4 mb-2">
										<label for="med1f">Média entrada</label>
										<input id="med1f" type="number" min="0" step="0.01" class="form-control" bind:value={editForm.mediaEntrada1F} />
									</div>
								</div>
							</div>
							{/if}

							{#if modalSection === 'all' || modalSection === '2f'}
							<div class="regime-edit-section">
								<div class="regime-edit-section-title">2.ª fase (2F)</div>
								<div class="row">
									<div class="col-md-4 mb-2">
										<label for="v2f">Vagas</label>
										<input id="v2f" type="number" min="0" class="form-control" bind:value={editForm.vagas2F} />
									</div>
									<div class="col-md-4 mb-2">
										<label for="c2f">Candidatos</label>
										<input id="c2f" type="number" min="0" class="form-control" bind:value={editForm.candidatos2F} />
									</div>
									<div class="col-md-4 mb-2">
										<label for="opc2f">Candidatos 1.ª opção (4)</label>
										<input id="opc2f" type="number" min="0" class="form-control" bind:value={editForm.candidatos1Opcao2F} />
									</div>
								</div>
								<div class="row mt-2">
									<div class="col-md-6 mb-2">
										<label for="col2f">Colocados (1)</label>
										<input id="col2f" type="number" min="0" class="form-control" bind:value={editForm.colocados2F} />
									</div>
									<div class="col-md-6 mb-2">
										<label for="class2f">Classif. últ. colocado</label>
										<input id="class2f" type="number" min="0" step="1" class="form-control" bind:value={editForm.classificacaoUltimo2F} />
									</div>
								</div>
							</div>
							{/if}

							{#if modalSection === 'all' || modalSection === '3f'}
							<div class="regime-edit-section">
								<div class="regime-edit-section-title">3.ª fase (3F)</div>
								<div class="row">
									<div class="col-md-4 mb-2">
										<label for="v3f">Vagas (5)</label>
										<input id="v3f" type="number" min="0" class="form-control" bind:value={editForm.vagas3F} />
									</div>
									<div class="col-md-4 mb-2">
										<label for="v3ef">Vagas efetivas (2)</label>
										<input id="v3ef" type="number" min="0" step="1" class="form-control" bind:value={editForm.vagas3F} />
									</div>
									<div class="col-md-4 mb-2">
										<label for="c3f">Candidatos</label>
										<input id="c3f" type="number" min="0" class="form-control" bind:value={editForm.candidatos3F} />
									</div>
								</div>
								<div class="row mt-2">
									<div class="col-md-4 mb-2">
										<label for="opc3f">Candidatos 1.ª opção (4)</label>
										<input id="opc3f" type="number" min="0" class="form-control" bind:value={editForm.candidatos1Opcao3F} />
									</div>
									<div class="col-md-4 mb-2">
										<label for="col3f">Colocados (1)</label>
										<input id="col3f" type="number" min="0" class="form-control" bind:value={editForm.colocados3F} />
									</div>
									<div class="col-md-4 mb-2">
										<label for="class3f">Classif. últ. colocado</label>
										<input id="class3f" type="number" min="0" step="1" class="form-control" bind:value={editForm.classificacaoUltimo3F} />
									</div>
								</div>
							</div>
							{/if}

							{#if modalSection === 'all' || modalSection === 'totais'}
							<div class="regime-edit-section">
								<div class="regime-edit-section-title">Totais e movimentos</div>
								<div class="row">
									<div class="col-md-4 mb-2">
										<label for="tot-cna">Total Candidatos CNA</label>
										<input id="tot-cna" type="number" class="form-control formula-field" disabled value={editForm.totalCandidatosCna ?? 0} />
									</div>
									<div class="col-md-4 mb-2">
										<label for="tot-col">Total Colocados</label>
										<input
											id="tot-col"
											type="number"
											class="form-control formula-field"
											disabled
											value={(Number(editForm.colocados1F ?? 0) + Number(editForm.colocados2F ?? 0) + Number(editForm.colocados3F ?? 0))}
										/>
									</div>
									<div class="col-md-4 mb-2">
										<label for="tot-mat">Total Matriculados</label>
										<input id="tot-mat" type="number" class="form-control formula-field" disabled value={editForm.totalMatriculados ?? 0} />
									</div>
								</div>
								<div class="row mt-2">
									<div class="col-md-12 mb-2">
										<label for="sobras">SOBRAS pós 3.ª fase</label>
										<input id="sobras" type="number" min="0" class="form-control" bind:value={editForm.sobrasPos3F} />
									</div>
								</div>
								<div class="row mt-2">
									<div class="col-md-6 mb-2">
										<label for="diff-3f">Transf CNA p outras IESup</label>
										<input id="diff-3f" type="number" min="0" class="form-control" bind:value={editForm.diffVagasMatAntes3F} />
									</div>
									<div class="col-md-6 mb-2">
										<label for="ocup-cna">Transf CNA p o IPVC</label>
										<input id="ocup-cna" type="number" min="0" step="1" class="form-control" bind:value={editForm.percOcupacaoCna} />
									</div>
								</div>
							</div>
							{/if}
						{:else if modalTab === 'reingresso-mudanca'}
							<div class="regime-edit-title">Reingresso + Mudança par Int/Curso</div>

							<div class="regime-edit-section">
								<div class="regime-edit-section-title">Reingresso</div>
								<div class="row">
									<div class="col-md-6 mb-2">
										<label for="rein-vagas">Vagas</label>
										<input id="rein-vagas" type="number" min="0" class="form-control" bind:value={editForm.reingressoVagas} />
									</div>
									<div class="col-md-6 mb-2">
										<label for="rein-cand">Candidatos</label>
										<input id="rein-cand" type="number" min="0" class="form-control" bind:value={editForm.reingressoCandidatos} />
									</div>
								</div>
								<div class="row mt-2">
									<div class="col-md-3 mb-2">
										<label for="rein-y1">1.º ano</label>
										<input id="rein-y1" type="number" min="0" class="form-control" bind:value={editForm.reingressoAno1} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="rein-y2">2.º ano</label>
										<input id="rein-y2" type="number" min="0" class="form-control" bind:value={editForm.reingressoAno2} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="rein-y3">3.º ano</label>
										<input id="rein-y3" type="number" min="0" class="form-control" bind:value={editForm.reingressoAno3} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="rein-y4">4.º ano</label>
										<input id="rein-y4" type="number" min="0" class="form-control" bind:value={editForm.reingressoAno4} />
									</div>
								</div>
								<div class="row mt-2">
									<div class="col-md-12 mb-2">
										<label for="rein-total">TOTAL (só 1.º ano)</label>
										<input id="rein-total" type="number" class="form-control formula-field" disabled value={editForm.reingressoTotal1Ano ?? 0} />
									</div>
								</div>
							</div>

							<div class="regime-edit-section">
								<div class="regime-edit-section-title">Mudança par Int/Curso</div>
								<div class="row">
									<div class="col-md-4 mb-2">
										<label for="mud-vagas">Vagas</label>
										<input id="mud-vagas" type="number" min="0" class="form-control" bind:value={editForm.mudancaVagas} />
									</div>
									<div class="col-md-4 mb-2">
										<label for="mud-cand">Candidatos</label>
										<input id="mud-cand" type="number" min="0" class="form-control" bind:value={editForm.mudancaCandidatos} />
									</div>
									<div class="col-md-4 mb-2">
										<label for="mud-col-mat">Colocados / Matriculados</label>
										<input id="mud-col-mat" type="number" class="form-control formula-field" disabled value={editForm.mudancaColocadosMatriculados ?? 0} />
									</div>
								</div>
							</div>
						{:else if modalTab === 'regimes-esp-internacionais'}
							<div class="regime-edit-title">Regimes Esp + Internacionais</div>

							<div class="regime-edit-section">
								<div class="regime-edit-section-title">Regimes Especiais</div>
								<div class="row">
									<div class="col-md-4 mb-2">
										<label for="reg-v">Vagas</label>
										<input id="reg-v" type="number" min="0" class="form-control" bind:value={editForm.regimesEspVagas} />
									</div>
									<div class="col-md-4 mb-2">
										<label for="reg-c">Candidatos</label>
										<input id="reg-c" type="number" min="0" class="form-control" bind:value={editForm.regimesEspCandidatos} />
									</div>
									<div class="col-md-4 mb-2">
										<label for="reg-m">Matriculados</label>
										<input id="reg-m" type="number" min="0" class="form-control" bind:value={editForm.regimesEspMatriculados} />
									</div>
								</div>
							</div>

							<div class="regime-edit-section">
								<div class="regime-edit-section-title">Estudantes Internacionais</div>
								<div class="row">
									<div class="col-md-4 mb-2">
										<label for="int-v">Vagas</label>
										<input id="int-v" type="number" min="0" class="form-control" bind:value={editForm.internationalVagas} />
									</div>
									<div class="col-md-4 mb-2">
										<label for="int-c">Candidatos</label>
										<input id="int-c" type="number" min="0" class="form-control" bind:value={editForm.internationalCandidatos} />
									</div>
									<div class="col-md-4 mb-2">
										<label for="int-m">Matriculados</label>
										<input id="int-m" type="number" min="0" class="form-control" bind:value={editForm.internationalMatriculados} />
									</div>
								</div>
							</div>
						{:else if modalTab === 'concursos'}
							<div class="regime-edit-title">Concursos Especiais</div>

							<div class="regime-edit-section">
								<div class="regime-edit-section-title">&gt;23 anos</div>
								<div class="row">
									<div class="col-md-3 mb-2">
										<label for="conc-over23-v">Vagas</label>
										<input id="conc-over23-v" type="number" min="0" class="form-control" bind:value={editForm.over23Vagas} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="conc-over23-c">Candidatos</label>
										<input id="conc-over23-c" type="number" min="0" class="form-control" bind:value={editForm.over23Candidatos} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="conc-over23-col">Colocados</label>
										<input id="conc-over23-col" type="number" min="0" class="form-control" bind:value={editForm.over23Colocados} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="conc-over23-mat">Matriculados</label>
										<input id="conc-over23-mat" type="number" min="0" class="form-control" bind:value={editForm.over23Matriculados} />
									</div>
								</div>
							</div>

							<div class="regime-edit-section">
								<div class="regime-edit-section-title">CET</div>
								<div class="row">
									<div class="col-md-3 mb-2">
										<label for="conc-cet-v">Vagas</label>
										<input id="conc-cet-v" type="number" min="0" class="form-control" bind:value={editForm.cetVagas} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="conc-cet-c">Candidatos</label>
										<input id="conc-cet-c" type="number" min="0" class="form-control" bind:value={editForm.cetCandidatos} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="conc-cet-col">Colocados</label>
										<input id="conc-cet-col" type="number" min="0" class="form-control" bind:value={editForm.cetColocados} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="conc-cet-mat">Matriculados</label>
										<input id="conc-cet-mat" type="number" min="0" class="form-control" bind:value={editForm.cetMatriculados} />
									</div>
								</div>
							</div>

							<div class="regime-edit-section">
								<div class="regime-edit-section-title">Titulares CTeSP</div>
								<div class="row">
									<div class="col-md-3 mb-2">
										<label for="conc-ctesp-v">Vagas</label>
										<input id="conc-ctesp-v" type="number" min="0" class="form-control" bind:value={editForm.ctespVagas} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="conc-ctesp-c">Candidatos</label>
										<input id="conc-ctesp-c" type="number" min="0" class="form-control" bind:value={editForm.ctespCandidatos} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="conc-ctesp-col">Colocados</label>
										<input id="conc-ctesp-col" type="number" min="0" class="form-control" bind:value={editForm.ctespColocados} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="conc-ctesp-mat">Matriculados</label>
										<input id="conc-ctesp-mat" type="number" min="0" class="form-control" bind:value={editForm.ctespMatriculados} />
									</div>
								</div>
							</div>

							<div class="regime-edit-section">
								<div class="regime-edit-section-title">Titulares outros Curs Sup</div>
								<div class="row">
									<div class="col-md-3 mb-2">
										<label for="conc-other-v">Vagas</label>
										<input id="conc-other-v" type="number" min="0" class="form-control" bind:value={editForm.otherHigherVagas} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="conc-other-c">Candidatos</label>
										<input id="conc-other-c" type="number" min="0" class="form-control" bind:value={editForm.otherHigherCandidatos} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="conc-other-col">Colocados</label>
										<input id="conc-other-col" type="number" min="0" class="form-control" bind:value={editForm.otherHigherColocados} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="conc-other-mat">Matriculados</label>
										<input id="conc-other-mat" type="number" min="0" class="form-control" bind:value={editForm.otherHigherMatriculados} />
									</div>
								</div>
							</div>

							<div class="regime-edit-section">
								<div class="regime-edit-section-title">Dupla Certif nível sec e c artísticos especializados</div>
								<div class="row">
									<div class="col-md-3 mb-2">
										<label for="conc-dupla-v">Vagas</label>
										<input id="conc-dupla-v" type="number" min="0" class="form-control" bind:value={editForm.dualCertVagas} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="conc-dupla-c">Candidatos</label>
										<input id="conc-dupla-c" type="number" min="0" class="form-control" bind:value={editForm.dualCertCandidatos} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="conc-dupla-col">Colocados</label>
										<input id="conc-dupla-col" type="number" min="0" class="form-control" bind:value={editForm.dualCertColocados} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="conc-dupla-mat">Matriculados</label>
										<input id="conc-dupla-mat" type="number" min="0" class="form-control" bind:value={editForm.dualCertMatriculados} />
									</div>
								</div>
							</div>
						{:else if modalTab === 'totais'}
							<div class="regime-edit-title">Totais</div>

							<div class="regime-edit-section">
								<div class="regime-edit-section-title">TOTAL MATRICULADOS por ano</div>
								<div class="row">
									<div class="col-md-3 mb-2">
										<label for="tot-y1">1.º ano</label>
										<input id="tot-y1" type="number" min="0" class="form-control" bind:value={editForm.year1} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="tot-y2">2.º ano</label>
										<input id="tot-y2" type="number" min="0" class="form-control" bind:value={editForm.year2} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="tot-y3">3.º ano</label>
										<input id="tot-y3" type="number" min="0" class="form-control" bind:value={editForm.year3} />
									</div>
									<div class="col-md-3 mb-2">
										<label for="tot-y4">4.º ano</label>
										<input id="tot-y4" type="number" min="0" class="form-control" bind:value={editForm.year4} />
									</div>
								</div>
							</div>

							<div class="regime-edit-section">
								<div class="regime-edit-section-title">Vagas e movimentos</div>
								<div class="row">
									<div class="col-md-4 mb-2">
										<label for="tot-pedidos">Pedidos de Anulação de matrícula</label>
										<input id="tot-pedidos" type="number" min="0" class="form-control" bind:value={editForm.pedidosAnulacao} />
									</div>
									<div class="col-md-4 mb-2">
										<label for="tot-vagas-dispo">TOTAL VAGAS disponíveis</label>
										<input id="tot-vagas-dispo" type="number" min="0" class="form-control" bind:value={editForm.totalAvailableVacancies} />
									</div>
									<div class="col-md-4 mb-2">
										<label for="tot-diff">DIFERENÇA vagas/mat antes 3F</label>
										<input id="tot-diff" type="number" min="0" class="form-control" bind:value={editForm.diffVagasMatAntes3F} />
									</div>
								</div>
								</div>
								<div class="row mt-2">
									<div class="col-md-6 mb-2">
										<label for="tot-col2">Total colocados</label>
										<input id="tot-col2" type="number" class="form-control formula-field" disabled value={editForm.totalColocados ?? 0} />
									</div>
									<div class="col-md-6 mb-2">
										<label for="tot-mat2">Total matriculados</label>
										<input id="tot-mat2" type="number" class="form-control formula-field" disabled value={editForm.totalMatriculados ?? 0} />
									</div>
								</div>
								<div class="row mt-2">
									<div class="col-md-12 mb-2">
										<label for="tot-curso">Total matriculados por curso</label>
										<input id="tot-curso" type="number" class="form-control formula-field" disabled value={editForm.totalMatriculatedPerCourse ?? 0} />
									</div>
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

		{#if modalConfirmNovoAno}
			<div class="modal modal-editar-vagas d-block modal-confirm-novo-ano" tabindex="-1" role="dialog" aria-modal="true">
				<div class="modal-dialog modal-dialog-centered" role="document" style="max-width: 520px; width: 90%;">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title">Confirmar criação de nova tabela</h5>
							<button type="button" class="close" aria-label="Fechar" onclick={fecharConfirmNovoAno}>
								<span aria-hidden="true">&times;</span>
							</button>
						</div>

						<div class="modal-body">
							Vai ser criado o ano letivo:
							<strong>{modalConfirmNovoAnoLoading ? 'Carregando...' : anoNovoParaCriar || '—'}</strong>
							<p class="small text-muted mb-0" style="margin-top: 10px;">
								A nova tabela será criada com todos os valores a 0.
							</p>
						</div>

						<div class="modal-footer">
							<button
								type="button"
								class="btn btn-secondary"
								onclick={fecharConfirmNovoAno}
								disabled={criandoNovaTabela || modalConfirmNovoAnoLoading}
							>
								Cancelar
							</button>
							<button
								type="button"
								class="btn btn-primary btn-search-hover"
								onclick={confirmarCriarNovaTabela}
								disabled={criandoNovaTabela || modalConfirmNovoAnoLoading}
							>
								{#if criandoNovaTabela}
									<span class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
									Confirmando...
								{:else}
									Confirmar
								{/if}
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

{#if showScrollTop}
	<button class="scroll-top-btn" onclick={scrollToTop} aria-label="Voltar ao topo">
		<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
			<polyline points="18 15 12 9 6 15"></polyline>
		</svg>
	</button>
{/if}
