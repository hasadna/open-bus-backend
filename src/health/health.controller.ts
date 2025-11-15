import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import axios from 'axios';
import { HealthResponse } from './health.dto';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Health status', type: HealthResponse })
  @ApiResponse({ status: 500, description: 'Health check failed' })
  async healthCheck(): Promise<HealthResponse> {
    try {
      const govApiMap = {
        form_server: 'https://forms.gov.il/globaldata/getsequence/setform.aspx',
        data_server: 'https://esb.gov.il/govServiceList/',
      };
      const govApiStatuses: { [key: string]: string } = {};
      await Promise.all(
        Object.entries(govApiMap).map(async ([name, url]) => {
          try {
            const res = await axios.get(url, { timeout: 3000 });
            govApiStatuses[name] = res.status === 200 ? 'alive' : `status_${res.status}`;
          } catch {
            govApiStatuses[name] = 'unreachable';
          }
        }),
      );

      const healthData: HealthResponse = {
        status: 'alive',
        gov_api: govApiStatuses,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '0.0.0',
      };

      return healthData;
    } catch (error) {
      throw new HttpException(
        {
          error: 'Health check failed',
          status: 'unhealthy',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
