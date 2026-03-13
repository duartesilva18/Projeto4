import {Body, Controller, Delete, Get, Param, Patch, Post, Query} from '@nestjs/common';
import {ApiTags} from "@nestjs/swagger";
import {OutrosExemplosService} from "./service";

@ApiTags('Exemplos - Outras')
@Controller('exemplos/outras')
export class OutrosExemplosController {
    constructor(private service: OutrosExemplosService) {}

  @Get("/getUOs")
  async getUOs(){
    return [
      {id: 1, unidade_organica: "Escola Superior Agrária", sigla: "ESA", id_rh: "03", cd_ministerio: 3161},
      {id: 2, unidade_organica: "Escola Superior de Educação", sigla: "ESE", id_rh: "02", cd_ministerio: 3162},
      {id: 3, unidade_organica: "Escola Superior de Tecnologia e Gestão", sigla: "ESTG", id_rh: "04", cd_ministerio: 3163},
      {id: 4, unidade_organica: "Escola Superior de Ciências Empresariais", sigla: "ESCE", id_rh: "05", cd_ministerio: 3164},
      {id: 5, unidade_organica: "Escola Superior de Saúde", sigla: "ESS", id_rh: "04", cd_ministerio: 7075},
      {id: 6, unidade_organica: "Escola Superior de Desporto e Lazer", sigla: "ESDL", id_rh: "10", cd_ministerio: null},
      {id: 7, unidade_organica: "Serviços Centrais", sigla: "SC", id_rh: "01", cd_ministerio: null},
      {id: 8, unidade_organica: "Serviços de Acção Social", sigla: "SAS", id_rh: "07", cd_ministerio: null},
      {id: 9, unidade_organica: "OTIC", sigla: "OTIC", id_rh: "09", cd_ministerio: null},
    ];
  }

  @Get("/getTiposCurso")
  async getTiposCurso(@Query('ano') ano: string, @Query('uo') uo: string){
    // devolve os tipos de curso existentes numa UO num dado ano
    // uo = id da uo (1 ESA, 2 ESE, 3 ESTG, 4 ESCE, 5 ESS, 6 ESDL)
    return [
      {
        id: "OUTRO",
        descricao: "OUTRO"
      },
      {
        id: "POSGRADUACAO",
        descricao: "POSGRADUACAO"
      },
      {
        id: "MESTRADO",
        descricao: "MESTRADO"
      },
      {
        id: "LICENCIATURA",
        descricao: "LICENCIATURA"
      },
      {
        id: "CTeSP",
        descricao: "CTeSP"
      }
    ];
  }

  @Get("/getCursos")
  async getCursos(@Query('ano') ano: string, @Query('uo') uo: string){
    // uo = id da uo (% | 1 ESA, 2 ESE, 3 ESTG, 4 ESCE, 5 ESS, 6 ESDL)
    // grau = % | CTeSP | LICENCIATURA | MESTRADO | POSGRADUACAO | OUTRO

    let cursos = [
      {
        "id": "5026",
        "descricao": "Alimentação e Restauração Coletiva",
        "grau": "CTeSP",
        "uo": 3
      },
      {
        "id": "5010",
        "descricao": "Construção e Reabilitação",
        "grau": "CTeSP",
        "uo": 3
      },
      {
        "id": "5008",
        "descricao": "Desenvolvimento Web e Multimédia",
        "grau": "CTeSP",
        "uo": 3
      },
      {
        "id": "5009",
        "descricao": "Eficiência Energética nos Edifícios",
        "grau": "CTeSP",
        "uo": 3
      },
      {
        "id": "5013",
        "descricao": "Gestão Hoteleira",
        "grau": "CTeSP",
        "uo": 3
      },
      {
        "id": "5017",
        "descricao": "Manutenção Mecânica",
        "grau": "CTeSP",
        "uo": 3
      },
      {
        "id": "5018",
        "descricao": "Mecatrónica",
        "grau": "CTeSP",
        "uo": 3
      },
      {
        "id": "5028",
        "descricao": "Processo Industrial",
        "grau": "CTeSP",
        "uo": 3
      },
      {
        "id": "5011",
        "descricao": "Qualidade e Segurança Alimentar",
        "grau": "CTeSP",
        "uo": 3
      },
      {
        "id": "5020",
        "descricao": "Redes e Sistemas Informáticos",
        "grau": "CTeSP",
        "uo": 3
      },
      {
        "id": "5015",
        "descricao": "Sistemas Eletrónicos e Computadores",
        "grau": "CTeSP",
        "uo": 3
      },
      {
        "id": "5014",
        "descricao": "Tecnologias e Programação de Sistemas de Informação",
        "grau": "CTeSP",
        "uo": 3
      },
      {
        "id": "50",
        "descricao": "Ciência e Tecnologia Alimentar",
        "grau": "LICENCIATURA",
        "uo": 3
      },
      {
        "id": "9723",
        "descricao": "Design de Ambientes",
        "grau": "LICENCIATURA",
        "uo": 3
      },
      {
        "id": "9727",
        "descricao": "Design do Produto",
        "grau": "LICENCIATURA",
        "uo": 3
      },
      {
        "id": "9087",
        "descricao": "Engenharia Alimentar",
        "grau": "LICENCIATURA",
        "uo": 3
      },
      {
        "id": "9743",
        "descricao": "Engenharia Civil e do Ambiente",
        "grau": "LICENCIATURA",
        "uo": 3
      },
      {
        "id": "8407",
        "descricao": "Engenharia da Computação Gráfica e Multimédia",
        "grau": "LICENCIATURA",
        "uo": 3
      },
      {
        "id": "57",
        "descricao": "Engenharia de Redes e Sistemas de Computadores",
        "grau": "LICENCIATURA",
        "uo": 3
      },
      {
        "id": "9857",
        "descricao": "Engenharia de Sistemas de Energias Renováveis",
        "grau": "LICENCIATURA",
        "uo": 3
      },
      {
        "id": "9750",
        "descricao": "Engenharia Electrónica e Redes de Computadores",
        "grau": "LICENCIATURA",
        "uo": 3
      },
      {
        "id": "9119",
        "descricao": "Engenharia Informática",
        "grau": "LICENCIATURA",
        "uo": 3
      },
      {
        "id": "9123",
        "descricao": "Engenharia Mecânica",
        "grau": "LICENCIATURA",
        "uo": 3
      },
      {
        "id": "9751",
        "descricao": "Engenharia Mecatrónica",
        "grau": "LICENCIATURA",
        "uo": 3
      },
      {
        "id": "9147",
        "descricao": "Gestão",
        "grau": "LICENCIATURA",
        "uo": 3
      },
      {
        "id": "9148",
        "descricao": "Gestão (nocturno)",
        "grau": "LICENCIATURA",
        "uo": 3
      },
      {
        "id": "9254",
        "descricao": "Turismo",
        "grau": "LICENCIATURA",
        "uo": 3
      },
      {
        "id": "8114",
        "descricao": "Turismo (regime pós-laboral)",
        "grau": "LICENCIATURA",
        "uo": 3
      },
      {
        "id": "6395",
        "descricao": "Contabilidade e Finanças",
        "grau": "MESTRADO",
        "uo": 3
      },
      {
        "id": "16",
        "descricao": "Design Integrado",
        "grau": "MESTRADO",
        "uo": 3
      },
      {
        "id": "9567",
        "descricao": "Engenharia Alimentar",
        "grau": "MESTRADO",
        "uo": 3
      },
      {
        "id": "66",
        "descricao": "Engenharia Civil e do Ambiente",
        "grau": "MESTRADO",
        "uo": 3
      },
      {
        "id": "9286",
        "descricao": "Engenharia Informática",
        "grau": "MESTRADO",
        "uo": 3
      },
      {
        "id": "14",
        "descricao": "Gestão das Organizações : Ramo de Gestão de Empresas",
        "grau": "MESTRADO",
        "uo": 3
      },
      {
        "id": "6914",
        "descricao": "Educação Pré-Escolar",
        "grau": "MESTRADO",
        "uo": 2
      },
      {
        "id": "6915",
        "descricao": "Educação Pré-Escolar e Ensino do 1º Ciclo do EB",
        "grau": "MESTRADO",
        "uo": 2
      },
      {
        "id": "69",
        "descricao": "Ensino do 1.º Ciclo do Ensino Básico e de Português e História e Geografia de Portugal no 2.º Ciclo do Ensino Básico",
        "grau": "MESTRADO",
        "uo": 2
      },
      {
        "id": "70",
        "descricao": "Ensino do 1º Ciclo do Ensino Básico e de Matemática e Ciências Naturais no 2º Ciclo do Ensino Básico",
        "grau": "MESTRADO",
        "uo": 2
      },
      {
        "id": "6419",
        "descricao": "Gerontologia Social",
        "grau": "MESTRADO",
        "uo": 2
      }, 
      {
        "id": "55",
        "descricao": "Artes Plásticas e Tecnologias Artísticas",
        "grau": "LICENCIATURA",
        "uo": 2
      },
      {
        "id": "9853",
        "descricao": "Educação Básica",
        "grau": "LICENCIATURA",
        "uo": 2
      },
      {
        "id": "9473",
        "descricao": "Educação Social Gerontológica",
        "grau": "LICENCIATURA",
        "uo": 2
      },
      {
        "id": "9859",
        "descricao": "Gestão Artística e Cultural",
        "grau": "LICENCIATURA",
        "uo": 2
      },
      {
        "id": "5025",
        "descricao": "Artes e Tecnologia",
        "grau": "CTeSP",
        "uo": 2
      },
      {
        "id": "5007",
        "descricao": "Intervenção Educativa em Creche",
        "grau": "CTeSP",
        "uo": 2
      },
      {
        "id": "5031",
        "descricao": "Intervenção Sociocomunitária e Envelhecimento",
        "grau": "CTeSP",
        "uo": 2
      }
    ]

    if(!uo)
      return false;

    // uo
    let filtados;
    if(uo != "%")
      filtados = cursos.filter(function(c){
        return c.uo.toString() == uo
      });
    else
      return cursos;
    return filtados;
  }

  @Get("/getUCs")
  async getUCs(@Query('ano') ano: string, @Query('curso') curso: string){
    let dados = [];

    switch(curso){
      case "9119":
        dados = [
          {
            "cd_discip": "3003016",
            "ds_discip": "Administração Bases de Dados"
          },
          {
            "cd_discip": "3003001",
            "ds_discip": "Álgebra Linear e Geometria Analítica"
          },
          {
            "cd_discip": "3003002",
            "ds_discip": "Algoritmos e Estruturas de Dados "
          },
          {
            "cd_discip": "3003000",
            "ds_discip": "Análise Matemática"
          },
          {
            "cd_discip": "3003034",
            "ds_discip": "Aprendizagem Organizacional - Opção II"
          },
          {
            "cd_discip": "3003003",
            "ds_discip": "Arquitecturas e Sistemas de Computadores"
          },
          {
            "cd_discip": "3003013",
            "ds_discip": "Base de Dados"
          },
          {
            "cd_discip": "3003031",
            "ds_discip": "Computação Móvel"
          },
          {
            "cd_discip": "3003011",
            "ds_discip": "Engenharia de Software I"
          },
          {
            "cd_discip": "3003020",
            "ds_discip": "Engenharia de Software II"
          },
          {
            "cd_discip": "3003008",
            "ds_discip": "Estatística"
          },
          {
            "cd_discip": "3003084",
            "ds_discip": "Etica e Deontologia Profissional"
          },
          {
            "cd_discip": "3003085",
            "ds_discip": "Gestão de Projectos"
          },
          {
            "cd_discip": "3003025",
            "ds_discip": "Integração da Empresa - Opção I"
          },
          {
            "cd_discip": "3003024",
            "ds_discip": "Integração de Sistemas "
          },
          {
            "cd_discip": "3003019",
            "ds_discip": "Inteligência Artificial"
          },
          {
            "cd_discip": "3003018",
            "ds_discip": "Interacção Homem Máquina"
          },
          {
            "cd_discip": "3003010",
            "ds_discip": "Investigação Operacional"
          },
          {
            "cd_discip": "3003004",
            "ds_discip": "Matemática Discreta I"
          },
          {
            "cd_discip": "3003005",
            "ds_discip": "Matemática Discreta II"
          },
          {
            "cd_discip": "3003082",
            "ds_discip": "Princípios de Gestão Empresarial"
          },
          {
            "cd_discip": "3003006",
            "ds_discip": "Programação I"
          },
          {
            "cd_discip": "3003012",
            "ds_discip": "Programação II"
          },
          {
            "cd_discip": "3003015",
            "ds_discip": "Projecto I"
          },
          {
            "cd_discip": "3003021",
            "ds_discip": "Projecto II"
          },
          {
            "cd_discip": "3003029",
            "ds_discip": "Projecto III"
          },
          {
            "cd_discip": "3003037",
            "ds_discip": "Projecto IV"
          },
          {
            "cd_discip": "3003014",
            "ds_discip": "Redes de Computadores"
          },
          {
            "cd_discip": "3003032",
            "ds_discip": "Segurança de Redes e Sistemas"
          },
          {
            "cd_discip": "3003023",
            "ds_discip": "Sistemas de Informação em Rede"
          },
          {
            "cd_discip": "3003007",
            "ds_discip": "Sistemas Operativos"
          },
          {
            "cd_discip": "3003083",
            "ds_discip": "Technical English"
          },
          {
            "cd_discip": "3003017",
            "ds_discip": "Tecnologias Multimédia"
          }
        ]
        break;
      case "9286":
        dados = [
          {
            "cd_discip": "3008608",
            "ds_discip": "Business Analytics e Mineração de Dados"
          },
          {
            "cd_discip": "3008610",
            "ds_discip": "Computação Móvel e Multisensorial"
          },
          {
            "cd_discip": "3008605",
            "ds_discip": "Desenvolvimento Web e para a Cloud"
          },
          {
            "cd_discip": "3008601",
            "ds_discip": "Engenharia e Qualidade de Software"
          },
          {
            "cd_discip": "3008612",
            "ds_discip": "Gestão de Projetos de Software"
          },
          {
            "cd_discip": "3008607",
            "ds_discip": "Informação Geográfica e Visualização"
          },
          {
            "cd_discip": "3008606",
            "ds_discip": "Inovação e Empreendedorismo"
          },
          {
            "cd_discip": "3008604",
            "ds_discip": "Interação e Experiência de Utilizador"
          },
          {
            "cd_discip": "3008609",
            "ds_discip": "Programação de Interfaces Visuais"
          },
          {
            "cd_discip": "3008611",
            "ds_discip": "Segurança e Controlo de Sistemas Informáticos"
          },
          {
            "cd_discip": "3008602",
            "ds_discip": "Tecnologias de Organização de Dados"
          },
          {
            "cd_discip": "3008603",
            "ds_discip": "Tecnologias e Serviços de Redes e Virtualização"
          }
        ]
        break;
      case "5014":
        dados = [
          {
            "cd_discip": "3010301",
            "ds_discip": "Algoritmia e Programação"
          },
          {
            "cd_discip": "3010308",
            "ds_discip": "Arquitetura e Desenho de Software"
          },
          {
            "cd_discip": "3010309",
            "ds_discip": "Bases de Dados"
          },
          {
            "cd_discip": "3010318",
            "ds_discip": "Estágio"
          },
          {
            "cd_discip": "3010322",
            "ds_discip": "Fundamentos de Sistemas Informáticos"
          },
          {
            "cd_discip": "3010313",
            "ds_discip": "Gestão de Projetos"
          },
          {
            "cd_discip": "3010325",
            "ds_discip": "Gestão de Redes e Sistemas"
          },
          {
            "cd_discip": "3010304",
            "ds_discip": "Inglês Técnico"
          },
          {
            "cd_discip": "3010314",
            "ds_discip": "Programação Móvel e Ubíqua"
          },
          {
            "cd_discip": "3010310",
            "ds_discip": "Programação Orientada por Objetos"
          },
          {
            "cd_discip": "3010311",
            "ds_discip": "Programação Web"
          },
          {
            "cd_discip": "3010315",
            "ds_discip": "Projeto de Sistemas de Informação"
          },
          {
            "cd_discip": "3010323",
            "ds_discip": "Redes de Computadores"
          },
          {
            "cd_discip": "3010324",
            "ds_discip": "Segurança de Redes e Sistemas de Informação"
          },
          {
            "cd_discip": "3010316",
            "ds_discip": "Serviços Distribuídos"
          },
          {
            "cd_discip": "3010305",
            "ds_discip": "Técnicas de Expressão Oral e Escrita"
          },
          {
            "cd_discip": "3010307",
            "ds_discip": "Tópicos de Matemática"
          }
        ]
        break;
    }

    return dados;
  }

  @Get("/getPucs")
  async getPucs(@Query('ano') ano: string, @Query('uo') uo: string, @Query('curso') curso: string){
    let dados = [{
      cd_curso: "9111",
      curso: "EI",
      uc: 2020202,
      grupo_disciplinar: "EIM",
      ano_curricular: 1,
      periodo_curricular: "S1",
      NOME: "Uc teste"
    },{
      cd_curso: "9111",
      curso: "EI",
      uc: 2020202,
      grupo_disciplinar: "EIM",
      ano_curricular: 1,
      periodo_curricular: "S1",
      NOME: "Uc teste"
    },{
      cd_curso: "9111",
      curso: "EI",
      uc: 2020202,
      grupo_disciplinar: "EIM",
      ano_curricular: 1,
      periodo_curricular: "S1",
      NOME: "Uc teste"
    },{
      cd_curso: "9111",
      curso: "EI",
      uc: 2020202,
      grupo_disciplinar: "EIM",
      ano_curricular: 1,
      periodo_curricular: "S1",
      NOME: "Uc teste"
    }];



    return dados;
  }

  @Get("/getUserInfo")
  async getUserInfo(@Query('user') user: string){
    return {
      id_utilizador: "teste",
      id_curso: "9119",
      num_utilizador: 30000,
      nome_completo: "Nome Utilizador Completo",
      id_tipo_doc_id: "2", // 2 = CC,
      nr_doc_identificacao: "123456789",
      nr_nif: "111222333",
      email_interno: "aaa@ipvc.pt",
      email_externo: "aaa@servico.com",
      data_nascimento: "2000-01-01",
      data_criacao: "2023-01-01 00:00:00",
      observacoes: "",
      activo: 1,
      id_origem_dados: null,
      salt: null,
      morada1: "Rua abc 90",
      morada2: "",
      cod_postal: "4000-000",
      localidade: "Algures",
      pais: "Portugal",
      telemovel: "99999999",
      telefone: null,
      extensao: null,
      nome_apresentacao: "Nome Utilizador"
    };
  }

  @Get("/getUOUtilizador")
  async getUOUtilizador(@Query('user') user: string){
    return {
      "id": 3,
      "unidade_organica": "Escola Superior de Tecnologia e Gestão",
      "sigla": "ESTG"
    };
  }

  @Get("/getAnosLetivos")
  getAnosLectivos(){
    return[
      {
        "anolectivo": "202223",
        "ordenacao": 15
      },
      {
        "anolectivo": "202324",
        "ordenacao": 14
      },
      {
        "anolectivo": "202122",
        "ordenacao": 13
      },
      {
        "anolectivo": "202021",
        "ordenacao": 12
      },
      {
        "anolectivo": "201920",
        "ordenacao": 11
      },
      {
        "anolectivo": "201819",
        "ordenacao": 10
      },
      {
        "anolectivo": "201718",
        "ordenacao": 9
      },
      {
        "anolectivo": "201617",
        "ordenacao": 8
      },
      {
        "anolectivo": "201516",
        "ordenacao": 7
      },
      {
        "anolectivo": "201415",
        "ordenacao": 6
      },
      {
        "anolectivo": "201314",
        "ordenacao": 5
      },
      {
        "anolectivo": "201213",
        "ordenacao": 4
      },
      {
        "anolectivo": "201112",
        "ordenacao": 3
      },
      {
        "anolectivo": "201011",
        "ordenacao": 2
      },
      {
        "anolectivo": "200910",
        "ordenacao": 1
      }
    ]
  }
}
