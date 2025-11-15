import { Module } from '@nestjs/common';
import { IssuesController } from './issues.controller';

@Module({
  controllers: [IssuesController],
})
export class IssuesModule {}
