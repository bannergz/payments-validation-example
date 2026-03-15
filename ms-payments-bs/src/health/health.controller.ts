import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service.js';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Health check endpoint
   */
  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the health status of the service.',
  })
  @ApiOkResponse({
    description: 'Service is healthy',
    schema: {
      example: {
        status: 'ok',
        message: 'Payments Service is healthy!',
      },
    },
  })
  health() {
    return this.healthService.getHealth();
  }
}
