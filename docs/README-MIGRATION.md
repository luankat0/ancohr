# 🔄 Migração Prisma → TypeORM

Este guia detalha a migração completa do Prisma para TypeORM.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:
- Docker e Docker Compose instalados
- Node.js 24+ e pnpm instalado

## 🚀 Passos para Migração

### 1. Pare e limpe o ambiente atual

```bash
# Pare todos os containers
pnpm dev:stop

# Limpe volumes e dados antigos
pnpm dev:clean

# Ou manualmente:
docker-compose down -v
docker system prune -f
```

### 2. Remova arquivos do Prisma

```bash
# Remova a pasta prisma e arquivos relacionados
rm -rf prisma/
rm -f prisma.config.ts
rm -rf src/prisma/
```

### 3. Atualize as dependências

```bash
# Remova node_modules e reinstale
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 4. Crie a estrutura de pastas TypeORM

```bash
mkdir -p src/config
mkdir -p src/entities
mkdir -p src/database
mkdir -p src/migrations
```

### 5. Copie os arquivos das entidades

Copie os seguintes arquivos dos artifacts:
- `src/entities/user.entity.ts`
- `src/entities/candidate.entity.ts`
- `src/entities/company.entity.ts`
- `src/entities/refresh-token.entity.ts`
- `src/config/typeorm.config.ts`
- `src/database/database.module.ts`
- `src/migrations/1700000000000-InitialMigration.ts`

### 6. Atualize os módulos

Substitua os seguintes arquivos:
- `src/app.module.ts` - Adicione DatabaseModule
- `src/modules/auth/auth.module.ts` - Use TypeORM
- `src/modules/auth/auth.service.ts` - Use Repository
- `src/modules/auth/strategies/jwt.strategy.ts` - Use TypeORM

### 7. Suba o ambiente

```bash
# Build e suba os containers
pnpm dev

# Ou separadamente:
pnpm docker:build
pnpm docker:up
```

## 📁 Nova Estrutura de Pastas

```
ancohr/
├── src/
│   ├── config/
│   │   └── typeorm.config.ts          # Configuração do TypeORM
│   ├── database/
│   │   └── database.module.ts         # Módulo do banco
│   ├── entities/                      # Entidades TypeORM
│   │   ├── user.entity.ts
│   │   ├── candidate.entity.ts
│   │   ├── company.entity.ts
│   │   └── refresh-token.entity.ts
│   ├── migrations/                    # Migrations do TypeORM
│   │   └── 1700000000000-InitialMigration.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts        # Atualizado para TypeORM
│   │   │   ├── auth.service.ts       # Usa Repository
│   │   │   └── strategies/
│   │   │       └── jwt.strategy.ts   # Atualizado
│   │   ├── candidates/
│   │   ├── companies/
│   │   └── ...
│   ├── app.module.ts                  # Importa DatabaseModule
│   └── main.ts
├── scripts/
│   └── migrate.sh                     # Helper para migrations
├── .env
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## 🎯 Comandos Úteis

### Desenvolvimento

```bash
# Iniciar projeto
pnpm dev

# Parar projeto
pnpm dev:stop

# Limpar tudo
pnpm dev:clean

# Ver logs
pnpm docker:logs
```

### Migrations

```bash
# Gerar migration automaticamente
pnpm migration:generate ./src/migrations/NomeDaMigration

# Executar migrations
pnpm migration:run

# Reverter última migration
pnpm migration:revert

# Ou use o script helper:
chmod +x scripts/migrate.sh
./scripts/migrate.sh generate AddNewTable
./scripts/migrate.sh run
./scripts/migrate.sh revert
```

### Database

```bash
# Acessar shell do banco
pnpm docker:db:shell

# Acessar shell da aplicação
pnpm docker:shell

# Sincronizar schema (apenas dev)
pnpm schema:sync
```

## 🔍 Diferenças Principais

### Antes (Prisma)

```typescript
// prisma.service.ts
await this.prisma.user.findUnique({ where: { id } });
```

### Depois (TypeORM)

```typescript
// Injete o Repository
@InjectRepository(User)
private userRepository: Repository<User>

// Use o repository
await this.userRepository.findOne({ where: { id } });
```

## ⚠️ Notas Importantes

1. **Migrations automáticas removidas**: TypeORM não tem `synchronize: true` em produção
2. **Relations devem ser explícitas**: Use `relations: ['candidate']` ao buscar
3. **Arrays vs JSON**: TypeORM trata arrays diferente do Prisma
4. **Cascading**: Configure explicitamente nas entidades

## 🐛 Solução de Problemas

### Erro: "relation does not exist"

```bash
# Execute as migrations
pnpm migration:run
```

### Erro: "Cannot find module @prisma/client"

```bash
# Reinstale as dependências
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Erro de conexão com banco

```bash
# Verifique se o banco está rodando
docker-compose ps

# Reinicie o banco
docker-compose restart db
```

## ✅ Checklist de Migração

- [ ] Parou e limpou ambiente antigo
- [ ] Removeu arquivos do Prisma
- [ ] Instalou dependências atualizadas
- [ ] Criou estrutura de pastas
- [ ] Copiou arquivos das entidades
- [ ] Atualizou módulos
- [ ] Testou build do Docker
- [ ] Executou migrations
- [ ] Testou endpoints da API
- [ ] Verificou logs

## 📚 Recursos

- [TypeORM Documentation](https://typeorm.io/)
- [NestJS TypeORM](https://docs.nestjs.com/techniques/database)
- [Migration Guide](https://typeorm.io/migrations)

## 🆘 Ajuda

Se encontrar problemas, verifique:
1. Logs do Docker: `pnpm docker:logs`
2. Logs do banco: `pnpm docker:db:logs`
3. Conexão com banco: `.env` está correto?