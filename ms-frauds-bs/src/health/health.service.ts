import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: 'ok',
      message: 'Frauds Service is healthy!',
    };
  }
}
