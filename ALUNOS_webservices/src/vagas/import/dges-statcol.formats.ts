/** Tipos de PDF statcol DGES suportados pelo importador */
export type DgesFormatKind =
  | 'ec25-ficha'
  | 'estatistica-nacional'
  | 'classificacoes-nacional'
  | 'desconhecido';

export interface DgesSupportedFormat {
  id: DgesFormatKind;
  label: string;
  description: string;
  example?: string;
  importa: string[];
  naoImporta?: string[];
}

export const DGES_SUPPORTED_PDF_FORMATS: DgesSupportedFormat[] = [
  {
    id: 'estatistica-nacional',
    label: 'Estatística nacional (statcol)',
    description:
      'PDF «Estatística por par estabelecimento/curso» com tabela de todos os cursos IPVC.',
    example: 'estatistica_1fase_2025.pdf',
    importa: ['Vagas', 'Candidatos', 'Colocados']
  },
  {
    id: 'ec25-ficha',
    label: 'Estatística por par estabelecimento/curso (fichas)',
    description:
      'PDF nacional StCEsAA.pdf (todas as fichas) ou ec25_EEEECCCC.pdf (um curso): estatística detalhada com distribuições de notas.',
    example: 'StCEs25.pdf · ec25_31619016.pdf',
    importa: ['Candidatos', 'Colocados'],
    naoImporta: ['Vagas (não existem neste PDF)']
  },
  {
    id: 'classificacoes-nacional',
    label: 'Classificações nacionais (statcol)',
    description: 'PDF «Classificações dos últimos colocados» com todos os estabelecimentos.',
    example: 'fase1a25.pdf · fase2a25.pdf · fase3a25.pdf',
    importa: ['Classificação último colocado', 'Vagas', 'Colocados'],
    naoImporta: ['Candidatos (use o PDF de fichas StCEsAA.pdf)']
  }
];

export const DGES_FORMAT_LABELS: Record<DgesFormatKind, string> = {
  'ec25-ficha': 'Ficha ec25 — curso individual',
  'estatistica-nacional': 'Estatística nacional',
  'classificacoes-nacional': 'Classificações nacionais',
  desconhecido: 'Formato não identificado'
};

export const DGES_UNSUPPORTED_PDF_HINTS = [
  'Resumo da colocação por estabelecimento/curso',
  'Comparação entre anos por estabelecimento/curso',
  'PDFs de outras instituições (sem secção IPVC)'
];

/**
 * PDFs típicos na página statcol da DGES (https://www.dges.gov.pt/.../Statcol/...)
 * vs o que o importador IPVC grava na proposta de vagas (CNA).
 */
export const DGES_STATCOL_PAGE_COVERAGE = [
  {
    statcolLabel: 'Estatística por par estabelecimento/curso',
    importavel: true,
    camposPropostaVagas: [
      'vagas (por fase)',
      'candidatos (por fase)',
      'colocados (por fase)'
    ],
    notas: 'PDF nacional com tabela IPVC; ficheiro principal para 1.ª/2.ª/3.ª fase.'
  },
  {
    statcolLabel: 'Classificações dos últimos colocados',
    importavel: true,
    camposPropostaVagas: ['classificacaoUltimo (por fase)'],
    notas: 'PDF nacional com nota do último colocado por curso IPVC.'
  },
  {
    statcolLabel: 'Ficha ec25 (exportação por curso — ec25_EEEECCCC.pdf)',
    importavel: true,
    camposPropostaVagas: ['candidatos (fase detetada)', 'colocados (fase detetada)'],
    notas: 'Um curso IPVC de cada vez; não inclui vagas.'
  },
  {
    statcolLabel: 'Resumo da colocação por estabelecimento/curso',
    importavel: false,
    camposPropostaVagas: [],
    notas: 'Não importável — use Estatística ou Classificações.'
  },
  {
    statcolLabel: 'Comparação entre anos por estabelecimento/curso',
    importavel: false,
    camposPropostaVagas: [],
    notas: 'Não importável — dados históricos multi-ano.'
  }
];

/** Colunas da tabela proposta de vagas que NÃO vêm dos PDFs statcol atuais */
export const DGES_NAO_COBERTO_PROPOSTA = [
  'candidatos1Opcao (1.ª opção por fase)',
  'mediaEntrada',
  'matriculados (atualizados em BD quando colocados importa; origem não registada em campo_origem)',
  'vagasEfetivas3F',
  'sobrasPos3F',
  'Concursos especiais (Over 23, CET, CTeSP, …)',
  'Reingresso e Mudança de par',
  'Regimes especiais e Internacional',
  'Totais, percentagens e fórmulas calculadas',
  'Matrículas por ano (year1–year4)'
];
