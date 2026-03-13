import { Module } from '@nestjs/common';
import { EditoraController } from './editoras/controller';
import { EditoraService } from './editoras/service';
import { OutrosExemplosController } from './outras_paginas_exemplo/controller';
import { OutrosExemplosService } from './outras_paginas_exemplo/service';


@Module({
  controllers: [EditoraController, OutrosExemplosController],
  providers: [EditoraService, OutrosExemplosService]
})
export class ExemploModule {}
