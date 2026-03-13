import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {PrismaService} from "../../prisma/prisma.service";
import { CriarLivroDto } from './dto/criar-livro.dto';
import { UpdateLivroDto } from './dto/update-livro.dto';

@Injectable()
export class EditoraService {
    constructor(private prisma: PrismaService) {}

    async getEditoras(){
        return await this.prisma.editora.findMany();
    }

    async getEditoraPorId(id: string) {
        const idNum = Number(id);
        if (!Number.isInteger(idNum) || idNum <= 0) {
            throw new BadRequestException('Dados em falta');
        }

        let res = await this.prisma.editora.findUnique({
            where: {
                id: idNum
            }
        });

        if(!res){
            throw new NotFoundException('Editora não encontrada');
        }

        return res;
    }

    async deleteEditoraPorId(id: string) {
        try {
            let res = await this.prisma.editora.delete({
                where: {
                    id: parseInt(id)
                }
            });

            if(!res){
                throw new NotFoundException('Editora não encontrada');
            }
            
            return {
                success: true,
                deleted: res
            };
        } catch(e){
            throw new NotFoundException('Editora não encontrada');
        }
    }

    async criarEditora(dto: CriarLivroDto) {
        const res = await this.prisma.editora.create({
            data: {
                designacao: dto.designacao,
                nif: dto.nif
            }
        });

        if(!res){
            throw new BadRequestException('Erro ao criar editora');
        }

        return {
            created: res,
            success: true 
        };
    }

    async atualizarEditora(id: string, dto: UpdateLivroDto) {
        const res = await this.prisma.editora.update({
            where: {
                id: parseInt(id)
            },
            data: dto
        });

        if(!res){
            throw new BadRequestException('Erro ao atualizar editora');
        }
        return {
            updated: res,
            success: true
        };
    }
    
}