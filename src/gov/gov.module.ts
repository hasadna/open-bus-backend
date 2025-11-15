import { Module } from '@nestjs/common';
import { GovController } from './gov.controller';
import { GovProvider } from './gov.provider';

@Module({
  controllers: [GovController],
  providers: [GovProvider],
})
export class GovModule {}
