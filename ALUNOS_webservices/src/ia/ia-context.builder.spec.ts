import { IaContextBuilder } from './ia-context.builder';
import { VagasService } from '../vagas/vagas.service';

/** Linha mínima da tabela com os campos que os agregadores usam. */
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

function makeBuilder(linhas: Record<string, unknown>[]): IaContextBuilder {
  const vagasService = {
    listarResumoTabela: jest.fn().mockResolvedValue(linhas)
  } as unknown as VagasService;
  return new IaContextBuilder(vagasService);
}

describe('IaContextBuilder', () => {
  const linhas = [
    row(2024, 'ESTG', 'Engenharia Informática', {
      totalCandidatosCna: 200,
      totalAvailableVacancies: 60,
      totalMatriculadosCna: 55
    }),
    row(2024, 'ESS', 'Enfermagem', {
      totalCandidatosCna: 350,
      totalAvailableVacancies: 70,
      totalMatriculadosCna: 70
    }),
    row(2025, 'ESTG', 'Engenharia Informática', {
      totalCandidatosCna: 220,
      totalAvailableVacancies: 60,
      totalMatriculadosCna: 60
    }),
    row(2025, 'ESS', 'Enfermagem', {
      totalCandidatosCna: 360,
      totalAvailableVacancies: 70,
      totalMatriculadosCna: 70
    })
  ];

  it('agrega as métricas por ano letivo', async () => {
    const ctx = await makeBuilder(linhas).build({});

    expect(ctx.anos.map((a) => a.ano)).toEqual(['2024/2025', '2025/2026']);
    expect(ctx.anos[0].metricas.candidatos).toBe(550);
    expect(ctx.anos[0].metricas.vagas).toBe(130);
    expect(ctx.anos[1].metricas.matriculados).toBe(130);
  });

  it('filtra por escola e curso', async () => {
    const ctx = await makeBuilder(linhas).build({ escola: 'ESTG', curso: 'all' });

    expect(ctx.escola).toBe('ESTG');
    expect(ctx.anos[0].metricas.candidatos).toBe(200);
    expect(ctx.anos[1].metricas.candidatos).toBe(220);
  });

  it('usa o ano mais recente quando o ano de referência não existe', async () => {
    const ctx = await makeBuilder(linhas).build({ anoReferencia: '2030/2031' });

    expect(ctx.anoReferencia).toBe('2025/2026');
    expect(ctx.anoPrevisto).toBe('2026/2027');
  });

  it('corta anos posteriores ao ano de referência', async () => {
    const ctx = await makeBuilder(linhas).build({ anoReferencia: '2024/2025' });

    expect(ctx.anoReferencia).toBe('2024/2025');
    expect(ctx.anos.map((a) => a.ano)).toEqual(['2024/2025']);
    expect(ctx.anoPrevisto).toBe('2025/2026');
  });

  it('devolve contexto vazio sem linhas', async () => {
    const ctx = await makeBuilder([]).build({});

    expect(ctx.anos).toEqual([]);
    expect(ctx.anoReferencia).toBe('');
    expect(ctx.anoPrevisto).toBe('');
  });
});
