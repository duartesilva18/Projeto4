import { Module } from '@nestjs/common';
import { VagasModule } from '../vagas/module';
import { IaController } from './ia.controller';
import { IaContextBuilder } from './ia-context.builder';
import { IaForecastService } from './ia-forecast.service';
import { IaAnalysisService } from './ia-analysis.service';
import { IaChatService } from './ia-chat.service';
import { IaOpenAiClient } from './ia-openai.client';

@Module({
  imports: [VagasModule],
  controllers: [IaController],
  providers: [
    IaContextBuilder,
    IaForecastService,
    IaAnalysisService,
    IaChatService,
    IaOpenAiClient
  ]
})
export class IaModule {}
