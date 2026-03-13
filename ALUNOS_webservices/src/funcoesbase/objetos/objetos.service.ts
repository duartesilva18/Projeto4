import { Injectable } from '@nestjs/common';
import {PrismaService} from "../../prisma/prisma.service";
import { ObterPrivObjetosDto } from './dto';

@Injectable()
export class ObjetosService {
    constructor(private prisma: PrismaService) {}

    async getPrivObjetos(dto: ObterPrivObjetosDto){
        let devolver = [{
            ativo: 1,
            designacao: 'Área Módulo Exemplo',
            id_area: 1,
            id_modulo: 1,
            modulo: 'Módulo Exemplo',
            prefixo: 'exemplo',
            path: 'http://localhost:5173/exemplos',
            objetos: [{
                id_objeto: 1,
                descricao: "Página Inicial Módulo Exemplo",
                ficheiro: "http://localhost:5173/exemplos",
                data_ini: '2024-01-01',
                item_menu: 1, // controla se página aparece na barra lateral
                data_fim: null,
                txt_info: null,
                ativo: 1,
                permissao: 1,
                beta: 0
            },{
                id_objeto: 2,
                descricao: "Listagem Editoras",
                ficheiro: "http://localhost:5173/exemplos/editoras",
                data_ini: '2024-01-01',
                item_menu: 1,
                data_fim: null,
                txt_info: null,
                ativo: 1,
                permissao: 1,
                beta: 0
            }, {
                id_objeto: 3,
                descricao: "Nova Editora",
                ficheiro: "http://localhost:5173/exemplos/editoras/nova",
                data_ini: '2024-01-01',
                item_menu: 1,
                data_fim: null,
                txt_info: null,
                ativo: 1,
                permissao: 1,
                beta: 0
            }, {
                id_objeto: 4,
                descricao: "Editora",
                ficheiro: "http://localhost:5173/exemplos/editoras/{d+}", // {d+} indica que é um parâmetro numérico
                data_ini: '2024-01-01',
                item_menu: 0,
                data_fim: null,
                txt_info: null,
                ativo: 1,
                permissao: 1,
                beta: 0
            }]
        }, {
            ativo: 1,
            designacao: 'Área 2 Módulo Exemplo',
            id_area: 2,
            id_modulo: 1,
            modulo: 'Módulo Exemplo',
            prefixo: 'exemplo',
            path: 'http://localhost:5173/exemplos',
            objetos: [{
                id_objeto: 5,
                descricao: "Página exemplo 2",
                ficheiro: "http://localhost:5173/exemplos/base",
                data_ini: '2024-01-01',
                item_menu: 1, // controla se página aparece na barra lateral
                data_fim: null,
                txt_info: null,
                ativo: 1,
                permissao: 1,
                beta: 0
            }]
        }];

        return devolver;
    }
}