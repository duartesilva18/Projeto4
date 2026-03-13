import { Controller, Get, Post } from '@nestjs/common';
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
}

