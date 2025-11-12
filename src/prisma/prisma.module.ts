import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Torna o PrismaService visível globalmente
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule {}
