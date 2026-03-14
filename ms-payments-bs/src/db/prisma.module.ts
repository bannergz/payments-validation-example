import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Module({
  imports: [],
  providers: [PrismaService],
})
export class PrismaModule {}
