import { IsOptional, IsBoolean, IsObject, IsString, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserData {
  @ApiProperty({
    description: 'First name of the complainant',
    minLength: 1,
    maxLength: 100,
    example: 'John',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    description: 'Last name of the complainant',
    minLength: 1,
    maxLength: 100,
    example: 'Doe',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    description: 'ID number of the complainant',
    pattern: '^[0-9]{9}$',
    example: '123456789',
  })
  @IsString()
  @Matches(/^[0-9]{9}$/)
  id: string;

  @ApiProperty({
    description: 'Email address of the complainant',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Phone number of the complainant',
    example: '050-4567890',
  })
  @IsString()
  @Matches(/^05\d(\-)?[2-9]\d{6}$/)
  phone: string;

  @ApiPropertyOptional({
    description: 'Type of complaint (e.g., no_stop)',
  })
  @IsOptional()
  @IsString()
  complaintType?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the complaint',
    minLength: 10,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description?: string;
}

export class SendComplaint {
  @ApiPropertyOptional({
    description: 'Enable debug mode to return XML without sending',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  debug?: boolean;

  @ApiProperty()
  userData: UserData;

  @ApiProperty()
  @IsObject()
  databusData: any;
}

export class SendComplaintResponse {
  @ApiProperty()
  @IsBoolean()
  success: boolean;

  @ApiProperty()
  @IsBoolean()
  debug: boolean;

  @ApiPropertyOptional({
    description: 'Generated XML (only in debug mode)',
  })
  @IsOptional()
  @IsString()
  xml?: string;

  @ApiPropertyOptional({
    description: 'Response data from the government forms system',
  })
  @IsOptional()
  @IsObject()
  data?: any;

  @ApiPropertyOptional({
    description: 'Generated reference number',
  })
  @IsOptional()
  @IsString()
  referenceNumber?: string;
}
