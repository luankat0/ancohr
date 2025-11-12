import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterCompanyDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    companyName: string;

    @IsString()
    cnpj: string;

    @IsOptional()
    @IsString()
    website?: string;

    @IsOptional()
    @IsString()
    phone?: string;
}
