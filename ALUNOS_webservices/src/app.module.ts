import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { FuncoesBaseModule } from "./funcoesbase/module";
import { ExemploModule } from "./modulo_exemplo/module";
import { AuthModule } from "./auth/auth.module";
import { PassportModule } from '@nestjs/passport';
import { VagasModule } from "./vagas/module";



@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PassportModule,
    AuthModule,
    // Funções Base
    FuncoesBaseModule,
    
    // Módulo Exemplo
    ExemploModule,

    // Módulo Vagas (ALUNOS_VAGAS)
    VagasModule,

    // Outros Módulos
    //...
    
  ]
})
export class AppModule {}
