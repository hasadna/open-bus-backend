import { IsString, IsOptional, IsArray, IsEnum, IsEmail, MinLength, MaxLength, isURL, isString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Reproducibility {
  ALWAYS = 'always',
  SOMETIMES = 'sometimes',
  RARELY = 'rarely',
  ONCE = 'once',
}

export enum Issuestats {
  OPEN = 'open',
  CLOSE = 'close',
}

export class CreateIssue {
  @ApiProperty({
    description: 'Title of the issue',
    minLength: 5,
    maxLength: 200,
    example: 'Application crashes on startup',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Name of the person reporting the issue',
    minLength: 1,
    maxLength: 100,
    example: 'John Doe',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  contactName: string;

  @ApiProperty({
    description: 'Email of the person reporting the issue',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  contactEmail: string;

  @ApiProperty({
    description: 'Detailed description of the issue',
    minLength: 10,
    maxLength: 5000,
    example: 'When I try to start the application, it crashes immediately...',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description: string;

  @ApiProperty({
    description: 'Environment where the issue occurred',
    minLength: 1,
    maxLength: 200,
    example: 'Windows 11, Chrome 120.0',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  environment: string;

  @ApiProperty({
    description: 'What was expected to happen',
    minLength: 5,
    maxLength: 1000,
    example: 'The application should start normally',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  expectedBehavior: string;

  @ApiProperty({
    description: 'What actually happened',
    minLength: 5,
    maxLength: 1000,
    example: 'The application crashed with an error message',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  actualBehavior: string;

  @ApiProperty({
    enum: Reproducibility,
    description: 'How often the issue can be reproduced',
    example: Reproducibility.ALWAYS,
  })
  @IsEnum(Reproducibility)
  reproducibility: Reproducibility;

  @ApiPropertyOptional({
    description: 'Optional attachments (URLs)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({
    description: 'Debug mode - skips GitHub API call',
    example: true,
  })
  @IsOptional()
  debug?: boolean;
}

export class GithubIssue {
  @ApiProperty({
    enum: Issuestats,
    example: Issuestats.OPEN,
  })
  @IsEnum(Issuestats)
  stats: Issuestats;

  @ApiProperty()
  url: string;

  [key: string]: any;
}

export class CreateIssueResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data: GithubIssue;
}
