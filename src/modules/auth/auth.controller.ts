import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterCandidateDto } from './dto/register-candidate.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register/candidate')
    @HttpCode(HttpStatus.CREATED)
    async registerCandidate(@Body() dto: RegisterCandidateDto) {
        return this.authService.registerCandidate(dto);
    }

    @Post('register/company')
    @HttpCode(HttpStatus.CREATED)
    async registerCompany(@Body() dto: RegisterCompanyDto) {
        return this.authService.RegisterCompanyDto(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body('refreshToken') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@CurrentUser() user: any) {
        return {
            userId: user.userId,
            email: user.email,
            userType: user.userType,
        };
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout() {
        // TODO: Inválidar o token no Redis quando implementar Redis
        return { message: 'Logout realizado com sucesso' };
    }
}
