import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: 'ok',
      message: 'Payments Service is healthy!',
    };
  }
}
