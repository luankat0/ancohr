import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export interface JwtPayload {
    sub: string;
    email: string;
    userType: 'CANDIDATE' | 'COMPANY';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        @InjectRepository(User),
        private userRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.userRepository.findOne({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                userType: true,
                isActive: true,
            },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Usuário não encontrado ou inativo');
        }

        return {
            userId: user.id,
            email: user.email,
            userType: user.userType,
        };
    }
}
