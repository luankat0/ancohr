import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
    name = 'InitialMigration1700000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Criar enum UserType
        await queryRunner.query(`
            CREATE TYPE "user_type_enum" AS ENUM('CANDIDATE', 'COMPANY')
        `);

        // Criar tabela users
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "userType" "user_type_enum" NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela candidates
        await queryRunner.query(`
            CREATE TABLE "candidates" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "fullName" character varying NOT NULL,
                "phone" character varying,
                "cpf" character varying,
                "dateOfBirth" TIMESTAMP,
                "address" jsonb,
                "linkedinUrl" character varying,
                "resumeUrl" character varying,
                "skills" text array NOT NULL DEFAULT '{}',
                "bio" text,
                "metadata" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_candidates_userId" UNIQUE ("userId"),
                CONSTRAINT "UQ_candidates_cpf" UNIQUE ("cpf"),
                CONSTRAINT "PK_candidates_id" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela companies
        await queryRunner.query(`
            CREATE TABLE "companies" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "companyName" character varying NOT NULL,
                "cnpj" character varying NOT NULL,
                "website" character varying,
                "industry" character varying,
                "size" character varying,
                "phone" character varying,
                "address" jsonb,
                "description" text,
                "logoUrl" character varying,
                "metadata" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_companies_userId" UNIQUE ("userId"),
                CONSTRAINT "UQ_companies_cnpj" UNIQUE ("cnpj"),
                CONSTRAINT "PK_companies_id" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela refresh_tokens
        await queryRunner.query(`
            CREATE TABLE "refresh_tokens" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "token" character varying NOT NULL,
                "userId" character varying NOT NULL,
                "expiresAt" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_refresh_tokens_token" UNIQUE ("token"),
                CONSTRAINT "PK_refresh_tokens_id" PRIMARY KEY ("id")
            )
        `);

        // Criar índices
        await queryRunner.query(`
            CREATE INDEX "IDX_refresh_tokens_userId" ON "refresh_tokens" ("userId")
        `);

        // Adicionar foreign keys
        await queryRunner.query(`
            ALTER TABLE "candidates"
            ADD CONSTRAINT "FK_candidates_userId"
            FOREIGN KEY ("userId") REFERENCES "users"("id")
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "companies"
            ADD CONSTRAINT "FK_companies_userId"
            FOREIGN KEY ("userId") REFERENCES "users"("id")
            ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover foreign keys
        await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT "FK_companies_userId"`);
        await queryRunner.query(`ALTER TABLE "candidates" DROP CONSTRAINT "FK_candidates_userId"`);

        // Remover índices
        await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_userId"`);

        // Remover tabelas
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE "companies"`);
        await queryRunner.query(`DROP TABLE "candidates"`);
        await queryRunner.query(`DROP TABLE "users"`);

        // Remover enum
        await queryRunner.query(`DROP TYPE "user_type_enum"`);
    }
}