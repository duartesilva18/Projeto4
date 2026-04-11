/**
 * Tipos de “tabela” alinhados às abas da proposta de vagas.
 * Cada campo corresponde a uma chave na linha devolvida por GET vagas/tabela.
 */

/** @typedef {{ key: string, label: string }} CompareField */
/** @typedef {{ id: string, label: string, fields: CompareField[] }} TableTypeDef */

/** @type {TableTypeDef[]} */
export const TABLE_TYPES = [
	{
		id: 'regime-nacional',
		label: 'Regime Nacional de Acesso',
		fields: [
			{ key: 'vagas1F', label: '1.ª fase — Vagas' },
			{ key: 'candidatos1F', label: '1.ª fase — Candidatos' },
			{ key: 'colocados1F', label: '1.ª fase — Colocados' },
			{ key: 'matriculados1F', label: '1.ª fase — Matriculados' },
			{ key: 'vagas2F', label: '2.ª fase — Vagas' },
			{ key: 'candidatos2F', label: '2.ª fase — Candidatos' },
			{ key: 'colocados2F', label: '2.ª fase — Colocados' },
			{ key: 'matriculados2F', label: '2.ª fase — Matriculados' },
			{ key: 'vagas3F', label: '3.ª fase — Vagas' },
			{ key: 'candidatos3F', label: '3.ª fase — Candidatos' },
			{ key: 'colocados3F', label: '3.ª fase — Colocados' },
			{ key: 'matriculados3F', label: '3.ª fase — Matriculados' }
		]
	},
	{
		id: 'concursos',
		label: 'Concursos especiais',
		fields: [
			{ key: 'over23Vagas', label: '>23 — Vagas' },
			{ key: 'over23Candidatos', label: '>23 — Candidatos' },
			{ key: 'over23Matriculados', label: '>23 — Matriculados' },
			{ key: 'cetVagas', label: 'CET — Vagas' },
			{ key: 'cetCandidatos', label: 'CET — Candidatos' },
			{ key: 'cetMatriculados', label: 'CET — Matriculados' },
			{ key: 'ctespVagas', label: 'CTeSP — Vagas' },
			{ key: 'ctespCandidatos', label: 'CTeSP — Candidatos' },
			{ key: 'ctespMatriculados', label: 'CTeSP — Matriculados' },
			{ key: 'otherHigherVagas', label: 'Outros ens. sup. — Vagas' },
			{ key: 'otherHigherCandidatos', label: 'Outros ens. sup. — Candidatos' },
			{ key: 'otherHigherMatriculados', label: 'Outros ens. sup. — Matriculados' },
			{ key: 'dualCertVagas', label: 'Dupla certificação — Vagas' },
			{ key: 'dualCertCandidatos', label: 'Dupla certificação — Candidatos' },
			{ key: 'dualCertMatriculados', label: 'Dupla certificação — Matriculados' }
		]
	},
	{
		id: 'reingresso-mudanca',
		label: 'Reingresso + Mudança de par/instituição',
		fields: [
			{ key: 'reingressoVagas', label: 'Reingresso — Vagas' },
			{ key: 'reingressoCandidatos', label: 'Reingresso — Candidatos' },
			{ key: 'reingressoAno1', label: 'Reingresso — Matr. 1.º ano' },
			{ key: 'reingressoAno2', label: 'Reingresso — Matr. 2.º ano' },
			{ key: 'reingressoAno3', label: 'Reingresso — Matr. 3.º ano' },
			{ key: 'reingressoAno4', label: 'Reingresso — Matr. 4.º ano' },
			{ key: 'mudancaVagas', label: 'Mudança — Vagas' },
			{ key: 'mudancaCandidatos', label: 'Mudança — Candidatos' },
			{ key: 'mudancaColocadosMatriculados', label: 'Mudança — Colocados/Matriculados' }
		]
	},
	{
		id: 'regimes-esp-internacionais',
		label: 'Regimes especiais + Internacionais',
		fields: [
			{ key: 'regimesEspVagas', label: 'Reg. especiais — Vagas' },
			{ key: 'regimesEspCandidatos', label: 'Reg. especiais — Candidatos' },
			{ key: 'regimesEspMatriculados', label: 'Reg. especiais — Matriculados' },
			{ key: 'internationalVagas', label: 'Internacional — Vagas' },
			{ key: 'internationalCandidatos', label: 'Internacional — Candidatos' },
			{ key: 'internationalMatriculados', label: 'Internacional — Matriculados' }
		]
	},
	{
		id: 'totais',
		label: 'Totais e indicadores',
		fields: [
			{ key: 'totalCandidatosCna', label: 'Total candidatos (CNA)' },
			{ key: 'totalColocados', label: 'Total colocados (concursos esp.)' },
			{ key: 'totalMatriculados', label: 'Total matriculados (esp.+int.)' },
			{ key: 'totalAvailableVacancies', label: 'Vagas disponíveis (soma fases CNA)' },
			{ key: 'diffVacanciesEnrolled', label: 'Dif. vagas − matriculados (CNA)' },
			{ key: 'percOcupacaoCna', label: '% ocupação CNA' },
			{ key: 'sobrasPos3F', label: 'Sobras pós 3.ª fase' }
		]
	}
];

/**
 * Indicadores principais — única lista exposta na UI (comparação entre anos).
 * @typedef {{ key: string, label: string }} MetricPrincipal
 */

/** @type {MetricPrincipal[]} */
export const METRIC_PRINCIPAIS = [
	{ key: 'totalCandidatosCna', label: 'Total candidatos (CNA)' },
	{ key: 'totalAvailableVacancies', label: 'Vagas disponíveis (CNA)' },
	{ key: 'matriculados3F', label: 'Matriculados (3.ª fase)' },
	{ key: 'candidatos3F', label: 'Candidatos (3.ª fase)' },
	{ key: 'percOcupacaoCna', label: '% ocupação (CNA)' },
	{ key: 'diffVacanciesEnrolled', label: 'Vagas − matriculados (CNA)' },
	{ key: 'totalMatriculados', label: 'Matriculados (conc. esp. + int.)' },
	{ key: 'sobrasPos3F', label: 'Sobras pós 3.ª fase' }
];
