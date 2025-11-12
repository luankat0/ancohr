import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterCandidateDto } from './dto/register-candidate.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { LoginDto } from './dto/login.dto';

interface JwtPayload {
    sub: string;
    email: string;
    userType: 'CANDIDATE' | 'COMPANY';
}

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async registerCandidate(dto: RegisterCandidateDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email já cadastrado');
        }

        if (dto.cpf) {
            const existingCpf = await this.prisma.candidate.findUnique({
                where: { cpf: dto.cpf },
            });

            if (existingCpf) {
                throw new ConflictException('CPF já cadastrado');
            }
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                userType: 'CANDIDATE',
                candidate: {
                    create: {
                        fullName: dto.fullName,
                        phone: dto.phone,
                        cpf: dto.phone,
                        dataOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
                    },
                },
            },
            include: {
                candidate: true,
            },
        });

        const tokens = await this.generateTokens(user.id, user.email, user.userType);

        return {
            user: {
                id: user.id,
                email: user.email,
                userType: user.userType,
                candidate: {
                    id: user.candidate!.id,
                    fullName: user.candidate!.fullName,
                },
            },
            ...tokens,
        };

    }

    async RegisterCompanyDto(dto: RegisterCompanyDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email já cadastrado');
        }

        const existingCnpj = await this.prisma.company.findUnique({
            where: { cnpj: dto.cnpj },
        });

        if (existingCnpj) {
            throw new ConflictException('CNPJ já cadastrado');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                userType: 'COMPANY',
                company: {
                    create: {
                        companyName: dto.companyName,
                        cnpj: dto.cnpj,
                        website: dto.website,
                        phone: dto.phone,
                    },
                },
            },
            include: {
                company: true,
            },
        });

        const tokens = this.generateTokens(user.id, user.email, user.userType);

        return {
            user: {
                id: user.id,
                email: user.email,
                userType: user.userType,
                company: {
                    id: user.company!.id,
                    companyName: user.company!.companyName,
                },
            },
            ...tokens,
        };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: {
                candidate: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
                company: {
                    select: {
                        id: true,
                        companyName: true,
                    },
                },
            },
        });

        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Conta desativada');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const tokens = this.generateTokens(user.id, user.email, user.userType);

        return {
            user: {
                id: user.id,
                email: user.email,
                userType: user.userType,
                ...(user.candidate && { candidate: user.candidate }),
                ...(user.company && { company: user.company }),
            },
            ...tokens,
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
            });

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });

            if (!user || !user.isActive) {
                throw new UnauthorizedException('Usuário inválido');
            }

            return this.generateTokens(user.id, user.email, user.userType);
        } catch (error) {
            throw new UnauthorizedException('Token inválido ou expirado');
        }
    }

    private generateTokens(
        userId: string,
        email: string,
        userType: 'CANDIDATE' | 'COMPANY',
    ) {
        const payload: JwtPayload = { sub: userId, email, userType};

        const jwtSecret = this.configService.get<string>('JWT_SECRET', 'default-secret-key');
        const jwtExpiration = this.configService.get<string>('JWT_EXPIRATION', '15m');
        const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET', 'default-secret-key');
        const jwtRefreshExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d')

        const acessToken = this.jwtService.sign(payload, {
            secret: jwtSecret,
            expiresIn: jwtExpiration as unknown as JwtSignOptions['expiresIn'],
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: jwtRefreshSecret,
            expiresIn: jwtRefreshExpiration as unknown as JwtSignOptions['expiresIn'],
        });

        return {
            acessToken,
            refreshToken,
        };
    }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return null;
        }

        const { password: _, ...result } = user;
        return result;
    }
}
