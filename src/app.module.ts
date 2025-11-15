import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { GovModule } from './gov/gov.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { IssuesModule } from './issues/issues.module';

@Module({
  imports: [HealthModule, GovModule, ComplaintsModule, IssuesModule],
})
export class AppModule {}
