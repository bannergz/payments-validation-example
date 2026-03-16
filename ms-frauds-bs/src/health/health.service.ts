import { Injectable } from '@nestjs/common';
import { Health } from './model/health.model.js';

@Injectable()
export class HealthService {
  getHealth(): Health {
    return {
      status: 'ok',
      message: 'Frauds Service is healthy!',
    };
  }
}
