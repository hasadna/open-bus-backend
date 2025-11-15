import { IsString, IsNumber, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HealthResponse {
  @ApiProperty({ example: 'alive' })
  @IsString()
  status: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string' },
    example: { form_server: 'alive', data_server: 'alive' },
  })
  @IsObject()
  gov_api: { [key: string]: string };

  @ApiProperty({ example: '2025-07-01T13:09:05.570Z' })
  @IsString()
  timestamp: string;

  @ApiProperty({ example: 23.1655282 })
  @IsNumber()
  uptime: number;

  @ApiProperty({ example: '2.0.0' })
  @IsString()
  version: string;
}

export class HealthError {
  @ApiProperty()
  @IsString()
  error: string;

  @ApiProperty()
  @IsString()
  status: string;
}
