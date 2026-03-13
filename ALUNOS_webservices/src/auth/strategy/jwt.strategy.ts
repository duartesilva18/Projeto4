import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {ForbiddenException, Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(config: ConfigService, private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get('JWT_SECRET')
        });
    }

    async validate(payload: {
        sub: string;
    }){
        console.log('Prisma client ok?', !!this.prisma, 'payload.sub=', payload.sub);

        // Try query, if connection error try to reconnect once then retry
        try {
            const user = await this.prisma.im_utilizador.findUnique({
                where: { id_utilizador: payload.sub }
            });
            if (!user) throw new ForbiddenException('Utilizador não existe');
            delete user.salt;
            return user;
        } catch (err) {
            // P1001 = Can't reach database server
            const isPrismaConnError = (err && (err.code === 'P1001' || /Can't reach database server/i.test(err.message)));
            if (isPrismaConnError) {
                try {
                    console.warn('Prisma not connected, attempting $connect() and retrying...');
                    await this.prisma.$connect();
                    const user = await this.prisma.im_utilizador.findUnique({
                        where: { id_utilizador: payload.sub }
                    });
                    if (!user) throw new ForbiddenException('Utilizador não existe');
                    delete user.salt;
                    return user;
                } catch (err2) {
                    console.error('Retry after $connect() failed:', err2);
                    throw new ForbiddenException('Database unreachable');
                }
            }
            throw err;
        }
    }
}