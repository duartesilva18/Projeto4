import {Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {ObjetosService} from "./objetos.service";
import { ObterPrivObjetosDto } from './dto';

@ApiTags('Dashboard:Funções Base:Priv-Objetos')
@Controller('objetos')
export class ObjetosController {
    constructor(private service: ObjetosService) {}

    @Post()
    getPrivObjetos(@Body() dto: ObterPrivObjetosDto){
        return this.service.getPrivObjetos(dto);
    }

}
