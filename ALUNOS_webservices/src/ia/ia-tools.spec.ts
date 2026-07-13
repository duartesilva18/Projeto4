import { IaChatTools } from './ia-tools';
import { VagasService } from '../vagas/vagas.service';

function row(
  ano: number,
  schoolName: string,
  courseName: string,
  valores: Partial<Record<string, number>> = {}
) {
  return {
    anoLetivoInicio: ano,
    anoLetivoFim: ano + 1,
    schoolName,
    courseName,
    totalColocadosCna: 0,
    totalColocados: 0,
    totalMatriculadosCna: 0,
    totalMatriculados: 0,
    reingressoAno1: 0,
    reingressoAno2: 0,
    reingressoAno3: 0,
    reingressoAno4: 0,
    mudancaColocadosMatriculados: 0,
    totalCandidatosCna: 0,
    totalAvailableVacancies: 0,
    ...valores
  };
}

const linhas = [
  row(2024, 'ESTG', 'Engenharia Informática', {
    totalCandidatosCna: 200,
    totalAvailableVacancies: 60
  }),
  row(2025, 'ESTG', 'Engenharia Informática', {
    totalCandidatosCna: 220,
    totalAvailableVacancies: 60
  }),
  row(2025, 'ESTG', 'Engenharia Mecânica', {
    totalCandidatosCna: 90,
    totalAvailableVacancies: 30
  }),
  row(2025, 'ESS', 'Enfermagem', {
    totalCandidatosCna: 360,
    totalAvailableVacancies: 70
  })
];

function makeTools(): IaChatTools {
  const vagasService = {
    listarResumoTabela: jest.fn().mockResolvedValue(linhas)
  } as unknown as VagasService;
  return new IaChatTools(vagasService);
}

describe('IaChatTools', () => {
  it('dados_curso devolve a série anual do curso (nome parcial, sem acentos)', async () => {
    const result = JSON.parse(
      await makeTools().execute('dados_curso', JSON.stringify({ curso: 'informatica' }))
    );

    expect(result.cursos).toEqual(['Engenharia Informática (ESTG)']);
    expect(result.seriePorAno).toEqual([
      expect.objectContaining({ ano: '2024/2025', candidatos: 200, vagas: 60 }),
      expect.objectContaining({ ano: '2025/2026', candidatos: 220, vagas: 60 })
    ]);
  });

  it('dados_curso filtra pela escola quando indicada', async () => {
    const result = JSON.parse(
      await makeTools().execute(
        'dados_curso',
        JSON.stringify({ curso: 'Enfermagem', escola: 'ESS' })
      )
    );
    expect(result.cursos).toEqual(['Enfermagem (ESS)']);
  });

  it('dados_curso devolve erro quando não encontra o curso', async () => {
    const result = JSON.parse(
      await makeTools().execute('dados_curso', JSON.stringify({ curso: 'Astrofísica' }))
    );
    expect(result.erro).toMatch(/Nenhum curso/i);
  });

  it('top_cursos ordena pela métrica no ano mais recente', async () => {
    const result = JSON.parse(
      await makeTools().execute('top_cursos', JSON.stringify({ metrica: 'candidatos' }))
    );

    expect(result.ano).toBe('2025/2026');
    expect(result.ranking.map((/** @type {any} */ r: { curso: string }) => r.curso)).toEqual([
      'Enfermagem',
      'Engenharia Informática',
      'Engenharia Mecânica'
    ]);
    expect(result.ranking[0].valor).toBe(360);
  });

  it('top_cursos restringe por escola e respeita o limite', async () => {
    const result = JSON.parse(
      await makeTools().execute(
        'top_cursos',
        JSON.stringify({ metrica: 'candidatos', escola: 'ESTG', limite: 1 })
      )
    );
    expect(result.ranking).toHaveLength(1);
    expect(result.ranking[0].curso).toBe('Engenharia Informática');
  });

  it('rejeita métricas e funções desconhecidas', async () => {
    const tools = makeTools();
    const metricaInvalida = JSON.parse(
      await tools.execute('top_cursos', JSON.stringify({ metrica: 'foo' }))
    );
    expect(metricaInvalida.erro).toMatch(/Métrica inválida/i);

    const funcaoInvalida = JSON.parse(await tools.execute('outra_funcao', '{}'));
    expect(funcaoInvalida.erro).toMatch(/desconhecida/i);
  });

  it('devolve erro com argumentos JSON inválidos', async () => {
    const result = JSON.parse(await makeTools().execute('dados_curso', '{invalid'));
    expect(result.erro).toMatch(/inválidos/i);
  });
});
