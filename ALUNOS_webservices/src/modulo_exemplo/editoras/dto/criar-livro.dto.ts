import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsNumberString } from 'class-validator';
import { IsValidNIF } from 'src/_uteis/validators/nif.validator';

export class CriarLivroDto {

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  designacao: string;

  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty()
  @MinLength(9)
  @IsValidNIF()
  nif: string;

  
  logo:any

}