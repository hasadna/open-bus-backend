import { Module } from '@nestjs/common';
import { ComplaintsController } from './complaints.controller';

@Module({
  controllers: [ComplaintsController],
})
export class ComplaintsModule {}
