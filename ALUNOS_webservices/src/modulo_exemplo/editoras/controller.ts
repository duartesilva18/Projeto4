import {Body, Controller, Delete, Get, Param, Patch, Post, Res, UploadedFile, UseInterceptors, Headers} from '@nestjs/common';
import {ApiTags} from "@nestjs/swagger";
import {EditoraService} from "./service";
import { CriarLivroDto } from './dto/criar-livro.dto';
import { UpdateLivroDto } from './dto/update-livro.dto';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { getUtilizadorJWT } from 'src/uteis';

@ApiTags('Exemplos - Editoras')
@Controller('exemplos/editoras')
export class EditoraController {
    constructor(private service: EditoraService) {}

    @Get()
    getEditoras(@Headers("authorization") auth?: string){
        // Autenticação opcional: só tenta ler o token se o header existir
        if (auth && auth.startsWith('Bearer ')) {
            const authToken = auth.split(' ')[1];
            try {
                let id_utilizador = getUtilizadorJWT(authToken);
                console.log(id_utilizador);
            } catch (e) {
                // se o token for inválido, ignora e continua
            }
        }
        return this.service.getEditoras();
    }

    @Get(':id')
    getEditoraPorId(@Param('id') id: string){
        return this.service.getEditoraPorId(id);
    }

    @Delete(':id')
    deleteEditoraPorId(@Param('id') id: string){
        return this.service.deleteEditoraPorId(id);
    }


    @Post()
    @UseInterceptors(FileInterceptor('logo', {
        storage : diskStorage({
            destination : (req , file , cb) => {
                let caminho = `./uploads/exemplos/editoras`
                fs.mkdirSync(caminho,{recursive:true})
                cb(null , caminho)
            },
            filename : (req , file , cb) => {
                cb(null , `${file.originalname}`)
            }
        }),
        limits: { fileSize: 1 * 1024 * 1024 }
    }))
    async criarEditora(@Body() dto: CriarLivroDto, @UploadedFile() logo){
        let res = await this.service.criarEditora(dto);

        if(res){
            fs.rename(`./uploads/exemplos/editoras/` + logo.originalname, `./uploads/exemplos/editoras/${res.created.id}.jpg`, function(err) {
                if ( err ) console.log('ERROR: ' + err);
            });
        }

        return res;
    }

    @Patch(':id')
    atualizarEditora(@Param('id') id: string, @Body() dto: UpdateLivroDto){
        return this.service.atualizarEditora(id, dto);
    }

    private readonly uploadPath = `${__dirname}\\..\\..\\..\\uploads\\exemplos\\editoras`;
    @Get('logotipo/:id')
    async get_image_doc_resource(@Param('id') id: string, @Res() res: Response) {
        try {
            const filePath = this.uploadPath + `\\${id}.jpg`; // só jpg...
            
            console.log(filePath)
            if (!fs.existsSync(filePath)) {
                res.status(404).send('Imagem não encontrada');
                return;
            }

            res.sendFile(path.resolve(filePath));
        } catch (e){
            console.log(e)
            res.status(500).send('Erro interno ao procurar a imagem');
        }
    }
}
