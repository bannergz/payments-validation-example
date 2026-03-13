import { Module } from '@nestjs/common';
import { join } from 'path';
import { HealthModule } from './health/health.module.js';
import { FraudsModule } from './frauds/frauds.module.js';

@Module({
  imports: [
    HealthModule,
    FraudsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
