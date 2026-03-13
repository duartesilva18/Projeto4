import { PartialType } from '@nestjs/swagger';
import { CriarLivroDto } from './criar-livro.dto';


export class UpdateLivroDto extends PartialType(CriarLivroDto) {}