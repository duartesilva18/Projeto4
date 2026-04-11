import XLSX from 'xlsx-js-style';

const NAVY = 'FF1F497D';
const TEAL = 'FF4BACC6';
const ORANGE_BG = 'FFFCD5B5';
const PURPLE_BG = 'FFCCC1DA';
const OLIVE = 'FF948A54';
const RED = 'FFC0504D';
const PINK_BG = 'FFE6B9B8';
const LIGHT_BLUE = 'FFDCE6F2';
const PURPLE_HEADER = 'FF8064A2';
const ORANGE_TOTAL = 'FFF79646';

const thin = { style: 'thin', color: { rgb: 'FF000000' } };
const border = { top: thin, bottom: thin, left: thin, right: thin };

const font8 = { sz: 8, name: 'Calibri' };
const font8b = { sz: 8, name: 'Calibri', bold: true };
const font8w = { sz: 8, name: 'Calibri', bold: true, color: { rgb: 'FFFFFFFF' } };

/**
 * @param {string} bg - ARGB hex
 * @param {{ bold?: boolean, white?: boolean, wrap?: boolean }} [opts]
 */
function hStyle(bg, opts = {}) {
	const f = opts.white ? font8w : opts.bold !== false ? font8b : font8;
	return {
		font: f,
		fill: { fgColor: { rgb: bg } },
		border,
		alignment: { horizontal: 'center', vertical: 'center', wrapText: opts.wrap !== false }
	};
}

function dataStyle(bg = null) {
	return {
		font: font8,
		border,
		alignment: { horizontal: 'center', vertical: 'center' },
		...(bg ? { fill: { fgColor: { rgb: bg } } } : {})
	};
}

/**
 * @param {import('../routes/(app)/(modules)/proposta-vagas/+page.svelte').CourseData[]} data
 * @param {string} anoLabel
 */
export function exportToXlsx(data, anoLabel) {
	const wb = XLSX.utils.book_new();

	const HEADER_ROWS = 5;
	const totalDataRows = data.length;
	const totalRows = HEADER_ROWS + totalDataRows;

	const aoa = [];

	// Row 1 (index 0) - empty
	aoa.push(new Array(80).fill(''));

	// Row 2 (index 1) - top level groups
	const r2 = new Array(80).fill('');
	r2[1] = anoLabel;
	r2[6] = 'Regime Nacional de acesso Ensino Superior';
	r2[29] = 'Saidas';
	r2[30] = 'Entradas';
	r2[31] = 'SOBRAS pós 3ª fase (dados da DGES)';
	r2[32] = 'Reingresso';
	r2[39] = 'Mudança par Int/Curso';
	r2[42] = 'Concursos Especiais';
	r2[62] = 'Regimes Esp';
	r2[65] = 'Est Internacionais';
	r2[68] = 'Total colocados';
	r2[69] = 'Total matriculados';
	r2[70] = 'Pedidos de Anulação de matricula';
	r2[71] = 'TOTAL VAGAS disponiveis';
	r2[72] = 'DIFERENÇA vagas/mat antes 3F';
	r2[74] = 'TOTAL MATRICULADOS';
	r2[79] = 'Total matriculados p/ curso';
	aoa.push(r2);

	// Row 3 (index 2)
	const r3 = new Array(80).fill('');
	r3[6] = 'Colocados';
	r3[23] = 'Total Candidatos Total CNA';
	r3[24] = 'Total Colocados';
	r3[25] = 'Matriculados';
	r3[28] = 'Total Matriculados (nas 3 fases CNA)';
	r3[29] = 'Transf CNA p outras IESup';
	r3[30] = 'Transf CNA p o IPVC';
	r3[32] = 'Vagas'; r3[33] = 'Candidatos';
	r3[34] = 'Colocados / Matriculados';
	r3[39] = 'Vagas'; r3[40] = 'Candidatos'; r3[41] = 'Colocados / Matriculados';
	r3[42] = '>23 anos'; r3[46] = 'CET'; r3[50] = 'Titulares CTeSP';
	r3[54] = 'Titulares outros Curs Sup';
	r3[58] = 'Titulares cursos dupla Certif nível sec e c artisticos especializados';
	r3[62] = 'vagas'; r3[63] = 'candidatos'; r3[64] = 'matriculados';
	r3[65] = 'vagas'; r3[66] = 'candidatos'; r3[67] = 'matriculados';
	aoa.push(r3);

	// Row 4 (index 3)
	const r4 = new Array(80).fill('');
	r4[1] = 'ESCOLAS / CURSOS / Vagas Conc Nac Acesso Ens Sup';
	r4[6] = '1ª fase'; r4[12] = '2ª fase'; r4[17] = '3ª fase';
	r4[25] = '1ª fase'; r4[26] = '2ª fase'; r4[27] = '3ª fase';
	r4[34] = '1ºano'; r4[35] = '2ºano'; r4[36] = '3ºano'; r4[37] = '4ºano'; r4[38] = 'TOTAL (só 1º ano)';
	r4[42] = 'vagas'; r4[43] = 'candidatos'; r4[44] = 'colocados'; r4[45] = 'matriculados';
	r4[46] = 'vagas'; r4[47] = 'candidatos'; r4[48] = 'colocados'; r4[49] = 'matriculados';
	r4[50] = 'vagas'; r4[51] = 'candidatos'; r4[52] = 'colocados'; r4[53] = 'matriculados';
	r4[54] = 'vagas'; r4[55] = 'candidatos'; r4[56] = 'colocados'; r4[57] = 'matriculados';
	r4[58] = 'vagas'; r4[59] = 'candidatos (3)'; r4[60] = 'colocados'; r4[61] = 'matriculados';
	r4[74] = '1ºano'; r4[75] = '2ºano'; r4[76] = '3ºano'; r4[77] = '4ºano';
	aoa.push(r4);

	// Row 5 (index 4) - detail headers
	const r5 = new Array(80).fill('');
	r5[1] = 'Escola'; r5[2] = 'Código curso'; r5[3] = 'Nome curso';
	r5[6] = 'vagas CNA'; r5[7] = 'candidatos'; r5[8] = 'Candidatos 1ª opção(4)';
	r5[9] = 'colocados(3)'; r5[10] = 'Classif último colocado'; r5[11] = 'média entrada';
	r5[12] = 'vagas (1)'; r5[13] = 'candidatos'; r5[14] = 'Candidatos 1ª opção(4)';
	r5[15] = 'colocados(1)'; r5[16] = 'Classif último colocado';
	r5[17] = 'vagas(5)'; r5[18] = 'vagas efetivas (2)'; r5[19] = 'candidatos';
	r5[20] = 'Candidatos 1ª opção(4)'; r5[21] = 'colocados(1)'; r5[22] = 'Classif último colocado';
	aoa.push(r5);

	// Data rows
	data.forEach((r, idx) => {
		const row = new Array(80).fill('');
		row[0] = idx + 1;
		row[1] = r.schoolName ?? '';
		row[2] = r.courseCode ?? '';
		row[3] = r.courseName ?? '';
		row[4] = '';
		row[5] = '';
		row[6] = r.vagas1F ?? 0; row[7] = r.candidatos1F ?? 0; row[8] = r.candidatos1Opcao1F ?? 0;
		row[9] = r.colocados1F ?? 0; row[10] = r.classificacaoUltimo1F ?? 0; row[11] = r.mediaEntrada1F ?? 0;
		row[12] = r.vagas2F ?? 0; row[13] = r.candidatos2F ?? 0; row[14] = r.candidatos1Opcao2F ?? 0;
		row[15] = r.colocados2F ?? 0; row[16] = r.classificacaoUltimo2F ?? 0;
		row[17] = r.vagas3F ?? 0; row[18] = r.vagasEfetivas3F ?? 0; row[19] = r.candidatos3F ?? 0;
		row[20] = r.candidatos1Opcao3F ?? 0; row[21] = r.colocados3F ?? 0; row[22] = r.classificacaoUltimo3F ?? 0;
		row[23] = r.totalCandidatosCna ?? 0;
		const totalCol = Number(r.colocados1F ?? 0) + Number(r.colocados2F ?? 0) + Number(r.colocados3F ?? 0);
		row[24] = totalCol;
		row[25] = r.matriculados1F ?? 0; row[26] = r.matriculados2F ?? 0; row[27] = r.matriculados3F ?? 0;
		const totalMat = Number(r.matriculados1F ?? 0) + Number(r.matriculados2F ?? 0) + Number(r.matriculados3F ?? 0);
		row[28] = totalMat;
		row[29] = r.diffVagasMatAntes3F ?? 0; row[30] = r.percOcupacaoCna ?? 0;
		row[31] = r.sobrasPos3F ?? 0;
		row[32] = r.reingressoVagas ?? 0; row[33] = r.reingressoCandidatos ?? 0;
		row[34] = r.reingressoAno1 ?? 0; row[35] = r.reingressoAno2 ?? 0;
		row[36] = r.reingressoAno3 ?? 0; row[37] = r.reingressoAno4 ?? 0;
		row[38] = r.reingressoTotal1Ano ?? 0;
		row[39] = r.mudancaVagas ?? 0; row[40] = r.mudancaCandidatos ?? 0;
		row[41] = r.mudancaColocadosMatriculados ?? 0;
		row[42] = r.over23Vagas ?? 0; row[43] = r.over23Candidatos ?? 0;
		row[44] = r.over23Colocados ?? 0; row[45] = r.over23Matriculados ?? 0;
		row[46] = r.cetVagas ?? 0; row[47] = r.cetCandidatos ?? 0;
		row[48] = r.cetColocados ?? 0; row[49] = r.cetMatriculados ?? 0;
		row[50] = r.ctespVagas ?? 0; row[51] = r.ctespCandidatos ?? 0;
		row[52] = r.ctespColocados ?? 0; row[53] = r.ctespMatriculados ?? 0;
		row[54] = r.otherHigherVagas ?? 0; row[55] = r.otherHigherCandidatos ?? 0;
		row[56] = r.otherHigherColocados ?? 0; row[57] = r.otherHigherMatriculados ?? 0;
		row[58] = r.dualCertVagas ?? 0; row[59] = r.dualCertCandidatos ?? 0;
		row[60] = r.dualCertColocados ?? 0; row[61] = r.dualCertMatriculados ?? 0;
		row[62] = r.regimesEspVagas ?? 0; row[63] = r.regimesEspCandidatos ?? 0;
		row[64] = r.regimesEspMatriculados ?? 0;
		row[65] = r.internationalVagas ?? 0; row[66] = r.internationalCandidatos ?? 0;
		row[67] = r.internationalMatriculados ?? 0;
		row[68] = r.totalColocados ?? 0; row[69] = r.totalMatriculados ?? 0;
		row[70] = r.pedidosAnulacao ?? 0; row[71] = r.totalAvailableVacancies ?? 0;
		row[72] = r.diffVagasMatAntes3F ?? 0;
		row[74] = r.year1 ?? 0; row[75] = r.year2 ?? 0; row[76] = r.year3 ?? 0; row[77] = r.year4 ?? 0;
		row[79] = r.totalMatriculatedPerCourse ?? 0;
		aoa.push(row);
	});

	const ws = XLSX.utils.aoa_to_sheet(aoa);

	// -- Merges (matching the original Excel) --
	ws['!merges'] = [
		{ s: { r: 1, c: 1 }, e: { r: 2, c: 3 } },
		{ s: { r: 1, c: 6 }, e: { r: 1, c: 28 } },
		{ s: { r: 2, c: 6 }, e: { r: 2, c: 22 } },
		{ s: { r: 3, c: 6 }, e: { r: 3, c: 11 } },
		{ s: { r: 3, c: 12 }, e: { r: 3, c: 16 } },
		{ s: { r: 3, c: 17 }, e: { r: 3, c: 22 } },
		{ s: { r: 2, c: 23 }, e: { r: 4, c: 23 } },
		{ s: { r: 2, c: 24 }, e: { r: 4, c: 24 } },
		{ s: { r: 2, c: 25 }, e: { r: 2, c: 27 } },
		{ s: { r: 3, c: 25 }, e: { r: 3, c: 25 } },
		{ s: { r: 3, c: 26 }, e: { r: 3, c: 26 } },
		{ s: { r: 3, c: 27 }, e: { r: 3, c: 27 } },
		{ s: { r: 2, c: 28 }, e: { r: 4, c: 28 } },
		{ s: { r: 2, c: 29 }, e: { r: 4, c: 29 } },
		{ s: { r: 2, c: 30 }, e: { r: 4, c: 30 } },
		{ s: { r: 1, c: 31 }, e: { r: 4, c: 31 } },
		{ s: { r: 1, c: 32 }, e: { r: 1, c: 38 } },
		{ s: { r: 2, c: 32 }, e: { r: 4, c: 32 } },
		{ s: { r: 2, c: 33 }, e: { r: 4, c: 33 } },
		{ s: { r: 2, c: 34 }, e: { r: 2, c: 38 } },
		{ s: { r: 1, c: 39 }, e: { r: 1, c: 41 } },
		{ s: { r: 2, c: 39 }, e: { r: 4, c: 39 } },
		{ s: { r: 2, c: 40 }, e: { r: 4, c: 40 } },
		{ s: { r: 2, c: 41 }, e: { r: 4, c: 41 } },
		{ s: { r: 1, c: 42 }, e: { r: 1, c: 61 } },
		{ s: { r: 2, c: 42 }, e: { r: 2, c: 45 } },
		{ s: { r: 2, c: 46 }, e: { r: 2, c: 49 } },
		{ s: { r: 2, c: 50 }, e: { r: 2, c: 53 } },
		{ s: { r: 2, c: 54 }, e: { r: 2, c: 57 } },
		{ s: { r: 2, c: 58 }, e: { r: 2, c: 61 } },
		{ s: { r: 3, c: 42 }, e: { r: 4, c: 42 } },
		{ s: { r: 3, c: 43 }, e: { r: 4, c: 43 } },
		{ s: { r: 3, c: 44 }, e: { r: 4, c: 44 } },
		{ s: { r: 3, c: 45 }, e: { r: 4, c: 45 } },
		{ s: { r: 3, c: 46 }, e: { r: 4, c: 46 } },
		{ s: { r: 3, c: 47 }, e: { r: 4, c: 47 } },
		{ s: { r: 3, c: 48 }, e: { r: 4, c: 48 } },
		{ s: { r: 3, c: 49 }, e: { r: 4, c: 49 } },
		{ s: { r: 3, c: 50 }, e: { r: 4, c: 50 } },
		{ s: { r: 3, c: 51 }, e: { r: 4, c: 51 } },
		{ s: { r: 3, c: 52 }, e: { r: 4, c: 52 } },
		{ s: { r: 3, c: 53 }, e: { r: 4, c: 53 } },
		{ s: { r: 3, c: 54 }, e: { r: 4, c: 54 } },
		{ s: { r: 3, c: 55 }, e: { r: 4, c: 55 } },
		{ s: { r: 3, c: 56 }, e: { r: 4, c: 56 } },
		{ s: { r: 3, c: 57 }, e: { r: 4, c: 57 } },
		{ s: { r: 3, c: 58 }, e: { r: 4, c: 58 } },
		{ s: { r: 3, c: 59 }, e: { r: 4, c: 59 } },
		{ s: { r: 3, c: 60 }, e: { r: 4, c: 60 } },
		{ s: { r: 3, c: 61 }, e: { r: 4, c: 61 } },
		{ s: { r: 1, c: 62 }, e: { r: 1, c: 64 } },
		{ s: { r: 2, c: 62 }, e: { r: 4, c: 62 } },
		{ s: { r: 2, c: 63 }, e: { r: 4, c: 63 } },
		{ s: { r: 2, c: 64 }, e: { r: 4, c: 64 } },
		{ s: { r: 1, c: 65 }, e: { r: 1, c: 67 } },
		{ s: { r: 2, c: 65 }, e: { r: 4, c: 65 } },
		{ s: { r: 2, c: 66 }, e: { r: 4, c: 66 } },
		{ s: { r: 2, c: 67 }, e: { r: 4, c: 67 } },
		{ s: { r: 1, c: 68 }, e: { r: 4, c: 68 } },
		{ s: { r: 1, c: 69 }, e: { r: 4, c: 69 } },
		{ s: { r: 1, c: 70 }, e: { r: 4, c: 70 } },
		{ s: { r: 1, c: 71 }, e: { r: 4, c: 71 } },
		{ s: { r: 1, c: 72 }, e: { r: 4, c: 72 } },
		{ s: { r: 1, c: 74 }, e: { r: 3, c: 77 } },
		{ s: { r: 1, c: 79 }, e: { r: 4, c: 79 } },
		{ s: { r: 3, c: 1 }, e: { r: 4, c: 3 } },
	];

	// -- Cell styles --
	const ref = XLSX.utils.decode_range(ws['!ref'] || 'A1');

	function setCell(r, c, style) {
		const addr = XLSX.utils.encode_cell({ r, c });
		if (!ws[addr]) ws[addr] = { v: '', t: 's' };
		ws[addr].s = style;
	}

	// Row 2 (r=1) colors
	for (let c = 6; c <= 28; c++) setCell(1, c, hStyle(NAVY, { white: true }));
	setCell(1, 29, hStyle(NAVY, { white: true }));
	setCell(1, 30, hStyle(NAVY, { white: true }));
	setCell(1, 31, hStyle(TEAL, { white: true }));
	for (let c = 32; c <= 38; c++) setCell(1, c, hStyle(TEAL));
	for (let c = 39; c <= 41; c++) setCell(1, c, hStyle(TEAL));
	for (let c = 42; c <= 61; c++) setCell(1, c, hStyle(TEAL));
	for (let c = 62; c <= 64; c++) setCell(1, c, hStyle(TEAL));
	for (let c = 65; c <= 67; c++) setCell(1, c, hStyle(TEAL));
	setCell(1, 68, hStyle(OLIVE, { white: true }));
	setCell(1, 69, hStyle(OLIVE, { white: true }));
	setCell(1, 70, hStyle(TEAL, { white: true }));
	setCell(1, 71, hStyle(TEAL, { white: true }));
	setCell(1, 72, hStyle(TEAL, { white: true }));
	for (let c = 74; c <= 77; c++) setCell(1, c, hStyle(OLIVE, { white: true }));
	setCell(1, 79, hStyle(OLIVE, { white: true }));

	// Row 3 (r=2) colors
	for (let c = 6; c <= 22; c++) setCell(2, c, hStyle(NAVY, { white: true }));
	setCell(2, 23, hStyle(ORANGE_TOTAL, { white: true }));
	setCell(2, 24, hStyle(PURPLE_HEADER, { white: true }));
	for (let c = 25; c <= 27; c++) setCell(2, c, hStyle(NAVY, { white: true }));
	setCell(2, 28, hStyle(RED, { white: true }));
	setCell(2, 29, hStyle(TEAL, { white: true }));
	setCell(2, 30, hStyle(TEAL, { white: true }));
	setCell(2, 32, hStyle(TEAL, { white: true }));
	setCell(2, 33, hStyle(TEAL, { white: true }));
	for (let c = 34; c <= 38; c++) setCell(2, c, hStyle(TEAL));
	setCell(2, 39, hStyle(TEAL, { white: true }));
	setCell(2, 40, hStyle(TEAL, { white: true }));
	setCell(2, 41, hStyle(TEAL, { white: true }));
	for (let c = 42; c <= 61; c++) setCell(2, c, hStyle(TEAL));
	for (let c = 62; c <= 67; c++) setCell(2, c, hStyle(TEAL, { white: true }));
	for (let c = 68; c <= 69; c++) setCell(2, c, hStyle(OLIVE, { white: true }));
	for (let c = 74; c <= 77; c++) setCell(2, c, hStyle(OLIVE, { white: true }));

	// Row 4 (r=3) colors
	for (let c = 6; c <= 22; c++) setCell(3, c, hStyle(NAVY, { white: true }));
	setCell(3, 25, hStyle(PINK_BG)); setCell(3, 26, hStyle(PINK_BG)); setCell(3, 27, hStyle(PINK_BG));
	setCell(3, 34, hStyle(PURPLE_BG)); setCell(3, 35, hStyle(TEAL)); setCell(3, 36, hStyle(TEAL));
	setCell(3, 37, hStyle(TEAL)); setCell(3, 38, hStyle(PURPLE_HEADER, { white: true }));
	for (let c = 42; c <= 61; c++) setCell(3, c, hStyle(TEAL));
	for (let c = 68; c <= 69; c++) setCell(3, c, hStyle(OLIVE, { white: true }));
	for (let c = 74; c <= 77; c++) setCell(3, c, hStyle(OLIVE, { white: true }));

	// Row 5 (r=4) detail header colors
	const r5colors = {
		6: TEAL, 7: ORANGE_BG, 8: TEAL, 9: PURPLE_BG, 10: TEAL, 11: TEAL,
		12: TEAL, 13: ORANGE_BG, 14: TEAL, 15: PURPLE_BG, 16: TEAL,
		17: TEAL, 18: TEAL, 19: ORANGE_BG, 20: TEAL, 21: PURPLE_BG, 22: TEAL
	};
	for (const [col, color] of Object.entries(r5colors)) {
		setCell(4, Number(col), hStyle(color));
	}
	for (let c = 42; c <= 61; c++) setCell(4, c, hStyle(TEAL));
	for (let c = 62; c <= 67; c++) setCell(4, c, hStyle(TEAL, { white: true }));
	for (let c = 68; c <= 69; c++) setCell(4, c, hStyle(OLIVE, { white: true }));
	for (let c = 70; c <= 72; c++) setCell(4, c, hStyle(TEAL, { white: true }));
	for (let c = 74; c <= 77; c++) setCell(4, c, hStyle(OLIVE, { white: true }));
	setCell(4, 79, hStyle(OLIVE, { white: true }));

	// Data row styles - alternate light blue for school rows
	const ds = dataStyle();
	const dsBlue = dataStyle(LIGHT_BLUE);
	for (let ri = HEADER_ROWS; ri < totalRows; ri++) {
		const schoolCell = ws[XLSX.utils.encode_cell({ r: ri, c: 1 })];
		const hasSchool = schoolCell && schoolCell.v && String(schoolCell.v).trim() !== '';
		const style = hasSchool ? dsBlue : ds;
		for (let ci = 0; ci < 80; ci++) {
			const addr = XLSX.utils.encode_cell({ r: ri, c: ci });
			if (!ws[addr]) ws[addr] = { v: '', t: 's' };
			ws[addr].s = style;
		}
	}

	// Column widths
	ws['!cols'] = [
		{ wch: 4 },   // A - #
		{ wch: 10 },  // B - Escola
		{ wch: 8 },   // C - Código
		{ wch: 30 },  // D - Nome curso
		{ wch: 7 },   // E
		{ wch: 7 },   // F
	];
	for (let i = 6; i < 80; i++) {
		ws['!cols'].push({ wch: 9 });
	}

	ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: totalRows - 1, c: 79 } });

	XLSX.utils.book_append_sheet(wb, ws, 'Proposta de Vagas');

	const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
	return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
