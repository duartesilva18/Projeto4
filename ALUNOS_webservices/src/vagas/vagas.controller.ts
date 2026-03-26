import { Body, Controller, Delete, Get, Patch, Param, Post, Put } from '@nestjs/common';
import { VagasService } from './vagas.service';

@Controller('vagas')
export class VagasController {
  constructor(private readonly vagasService: VagasService) {}

  @Get('tabela')
  listarResumoTabela() {
    return this.vagasService.listarResumoTabela();
  }

  @Post('novo-ano')
  criarAnoLetivoSeguinte() {
    return this.vagasService.criarAnoLetivoSeguinte();
  }

  @Get('novo-ano')
  previewAnoLetivoSeguinte() {
    return this.vagasService.previewAnoLetivoSeguinte();
  }

  @Get('anos')
  listarAnos() {
    return this.vagasService.listarAnos();
  }

  @Delete('ano/:anoInicio')
  apagarAno(@Param('anoInicio') anoInicio: string) {
    return this.vagasService.apagarAno(Number(anoInicio));
  }

  @Put('ano/:anoInicio/reset')
  resetAno(@Param('anoInicio') anoInicio: string) {
    return this.vagasService.resetAno(Number(anoInicio));
  }

  @Patch('curso/:id')
  atualizarCnaCurso(
    @Param('id') id: string,
    @Body()
    body: {
      vagas1F?: number;
      candidatos1F?: number;
      colocados1F?: number;
      candidatos1Opcao1F?: number;
      classificacaoUltimo1F?: number;
      mediaEntrada1F?: number;
      vagas2F?: number;
      candidatos2F?: number;
      colocados2F?: number;
      candidatos1Opcao2F?: number;
      classificacaoUltimo2F?: number;
      vagas3F?: number;
      candidatos3F?: number;
      colocados3F?: number;
      candidatos1Opcao3F?: number;
      classificacaoUltimo3F?: number;
      sobrasPos3F?: number;
      diffVagasMatAntes3F?: number;
      percOcupacaoCna?: number;
    }
  ) {
    return this.vagasService.atualizarCnaCurso(id, body);
  }

  @Patch('concursos/:id')
  atualizarConcursosEspeciais(
    @Param('id') id: string,
    @Body()
    body: {
      over23Vagas?: number;
      over23Candidatos?: number;
      over23Colocados?: number;
      over23Matriculados?: number;
      cetVagas?: number;
      cetCandidatos?: number;
      cetColocados?: number;
      cetMatriculados?: number;
      ctespVagas?: number;
      ctespCandidatos?: number;
      ctespColocados?: number;
      ctespMatriculados?: number;
      otherHigherVagas?: number;
      otherHigherCandidatos?: number;
      otherHigherColocados?: number;
      otherHigherMatriculados?: number;
      dualCertVagas?: number;
      dualCertCandidatos?: number;
      dualCertColocados?: number;
      dualCertMatriculados?: number;
    }
  ) {
    return this.vagasService.atualizarConcursosEspeciais(id, body);
  }

  @Patch('regimes-esp-internacionais/:id')
  atualizarRegimesEspInternacionais(
    @Param('id') id: string,
    @Body()
    body: {
      regimesEspVagas?: number;
      regimesEspCandidatos?: number;
      regimesEspMatriculados?: number;
      internationalVagas?: number;
      internationalCandidatos?: number;
      internationalMatriculados?: number;
    }
  ) {
    return this.vagasService.atualizarRegimesEspInternacionais(id, body);
  }

  @Patch('reingresso-mudanca/:id')
  atualizarReingressoMudanca(
    @Param('id') id: string,
    @Body()
    body: {
      reingressoVagas?: number;
      reingressoCandidatos?: number;
      reingressoAno1?: number;
      reingressoAno2?: number;
      reingressoAno3?: number;
      reingressoAno4?: number;

      mudancaVagas?: number;
      mudancaCandidatos?: number;
      mudancaColocadosMatriculados?: number;
    }
  ) {
    return this.vagasService.atualizarReingressoMudanca(id, body);
  }
}

