import { IsDateString, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterCandidateDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    fullName: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    cpf?: string;

    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;
}
