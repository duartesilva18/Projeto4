import { Injectable } from '@nestjs/common';
import { VagasService } from '../vagas/vagas.service';
import { IA_METRIC_AGGREGATORS, IA_METRIC_KEYS } from './ia-metrics.config';
import { IaMetricKey } from './ia.types';
import { OpenAiTool } from './ia-openai.client';

/** Funções que o modelo pode invocar durante o chat para consultar dados reais. */
export const IA_CHAT_TOOLS: OpenAiTool[] = [
  {
    type: 'function',
    function: {
      name: 'dados_curso',
      description:
        'Devolve as séries anuais (vagas, candidatos, colocados, matriculados) de um curso específico do IPVC. ' +
        'Usa quando a pergunta menciona um curso concreto.',
      parameters: {
        type: 'object',
        properties: {
          curso: {
            type: 'string',
            description: 'Nome (ou parte do nome) do curso, ex.: "Enfermagem"'
          },
          escola: {
            type: 'string',
            description: 'Sigla da escola para desambiguar, ex.: "ESTG" (opcional)'
          }
        },
        required: ['curso']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'top_cursos',
      description:
        'Devolve o ranking de cursos do IPVC por uma métrica num ano letivo. ' +
        'Usa para perguntas do tipo "qual o curso com mais candidatos".',
      parameters: {
        type: 'object',
        properties: {
          metrica: {
            type: 'string',
            enum: ['vagas', 'candidatos', 'colocados', 'matriculados'],
            description: 'Métrica a ordenar'
          },
          ano: {
            type: 'string',
            description: 'Ano letivo, ex.: "2025/2026". Vazio = ano mais recente com dados.'
          },
          escola: {
            type: 'string',
            description: 'Sigla da escola para restringir, ex.: "ESS" (opcional)'
          },
          limite: {
            type: 'number',
            description: 'Número de cursos a devolver (por defeito 5, máximo 15)'
          }
        },
        required: ['metrica']
      }
    }
  }
];

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function anoLabelOf(row: Record<string, unknown>): string {
  return row.anoLetivoInicio != null && row.anoLetivoFim != null
    ? `${row.anoLetivoInicio}/${row.anoLetivoFim}`
    : '';
}

@Injectable()
export class IaChatTools {
  constructor(private readonly vagasService: VagasService) {}

  /** Executa a função pedida pelo modelo; devolve sempre uma string JSON. */
  async execute(name: string, argumentsJson: string): Promise<string> {
    let args: Record<string, unknown>;
    try {
      args = JSON.parse(argumentsJson || '{}');
    } catch {
      return JSON.stringify({ erro: 'Argumentos inválidos.' });
    }

    const linhas: Record<string, unknown>[] = await this.vagasService.listarResumoTabela();

    if (name === 'dados_curso') {
      return JSON.stringify(this.dadosCurso(linhas, args));
    }
    if (name === 'top_cursos') {
      return JSON.stringify(this.topCursos(linhas, args));
    }
    return JSON.stringify({ erro: `Função desconhecida: ${name}` });
  }

  private dadosCurso(
    linhas: Record<string, unknown>[],
    args: Record<string, unknown>
  ): unknown {
    const alvo = normalize(String(args.curso ?? ''));
    if (!alvo) return { erro: 'Indique o nome do curso.' };
    const escola = args.escola ? normalize(String(args.escola)) : '';

    const rows = linhas.filter((r) => {
      const nome = normalize(String(r.courseName ?? ''));
      if (!nome.includes(alvo)) return false;
      if (escola && normalize(String(r.schoolName ?? '')) !== escola) return false;
      return true;
    });

    if (rows.length === 0) {
      return { erro: `Nenhum curso encontrado com "${args.curso}".` };
    }

    const cursosDistintos = [
      ...new Set(rows.map((r) => `${r.courseName} (${r.schoolName})`))
    ].sort();
    if (cursosDistintos.length > 5) {
      return {
        aviso: 'Vários cursos correspondem; indique um nome mais específico ou a escola.',
        cursos: cursosDistintos.slice(0, 15)
      };
    }

    const porAno = new Map<string, Record<IaMetricKey, number>>();
    for (const row of rows) {
      const ano = anoLabelOf(row);
      if (!ano) continue;
      let entry = porAno.get(ano);
      if (!entry) {
        entry = { colocados: 0, matriculados: 0, candidatos: 0, vagas: 0 };
        porAno.set(ano, entry);
      }
      for (const m of IA_METRIC_KEYS) {
        entry[m] += IA_METRIC_AGGREGATORS[m](row);
      }
    }

    const serie = [...porAno.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([ano, metricas]) => ({ ano, ...metricas }));

    return { cursos: cursosDistintos, seriePorAno: serie };
  }

  private topCursos(
    linhas: Record<string, unknown>[],
    args: Record<string, unknown>
  ): unknown {
    const metrica = String(args.metrica ?? '') as IaMetricKey;
    if (!IA_METRIC_KEYS.includes(metrica)) {
      return { erro: `Métrica inválida: ${args.metrica}` };
    }
    const escola = args.escola ? normalize(String(args.escola)) : '';
    const limite = Math.min(Math.max(Number(args.limite) || 5, 1), 15);

    const anos = [...new Set(linhas.map(anoLabelOf).filter(Boolean))].sort();
    if (anos.length === 0) return { erro: 'Sem anos letivos com dados.' };
    const ano =
      args.ano && anos.includes(String(args.ano)) ? String(args.ano) : anos[anos.length - 1];

    const porCurso = new Map<string, { curso: string; escola: string; valor: number }>();
    for (const row of linhas) {
      if (anoLabelOf(row) !== ano) continue;
      if (escola && normalize(String(row.schoolName ?? '')) !== escola) continue;
      const key = `${row.schoolName}|${row.courseName}`;
      let entry = porCurso.get(key);
      if (!entry) {
        entry = {
          curso: String(row.courseName ?? ''),
          escola: String(row.schoolName ?? ''),
          valor: 0
        };
        porCurso.set(key, entry);
      }
      entry.valor += IA_METRIC_AGGREGATORS[metrica](row);
    }

    const ranking = [...porCurso.values()]
      .filter((e) => e.valor > 0)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, limite);

    return { ano, metrica, ranking };
  }
}
