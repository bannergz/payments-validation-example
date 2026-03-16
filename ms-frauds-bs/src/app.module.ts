import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module.js';
import { FraudsModule } from './frauds/frauds.module.js';

@Module({
  imports: [HealthModule, FraudsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
