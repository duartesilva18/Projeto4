import {ForbiddenException, Injectable} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {LoginDto} from "./dto";
import {JwtService} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";
import {Token} from "./types";
import {encryptToken} from "./utils";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private config: ConfigService
    ) {}

    async signIn(dto: LoginDto) {
        // Tentar obter o utilizador; se não existir, cria um utilizador "dummy"
        let user = await this.prisma.im_utilizador.findUnique({
            where: {
                id_utilizador: dto.id_utilizador
            }
        });

        if (!user) {
            user = await this.prisma.im_utilizador.create({
                data: {
                    id_utilizador: dto.id_utilizador,
                    nome_completo: dto.id_utilizador
                }
            });
        }

        // Neste contexto de projeto, não validamos password para facilitar o acesso
        const token = await this.signToken(
            user.id_utilizador,
            user.num_utilizador ?? user.id_utilizador
        );
        const encryptedToken = await encryptToken(token.access_token.toString(), this.config);
        return token;
    }

    async signToken(userId: string, user_number: string): Promise<Token> {
        let payload = {
            sub: userId,
            num_utilizador: user_number
        }
        let secret = this.config.get('JWT_SECRET');
        let token = await this.jwtService.signAsync(payload, {
            expiresIn: '300d',
            secret: secret
        })
        
        payload = {
            sub: userId,
            num_utilizador: user_number
        }
        token = await this.jwtService.signAsync(payload, {
            expiresIn: '1h',
            secret: secret
        })

        return {
            access_token: token
        }
    }



}
