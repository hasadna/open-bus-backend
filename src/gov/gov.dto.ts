import { IsNumber, IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetLinesByStation {
  @ApiProperty({
    description: 'Event date in timestamp format (e.g., new Date("2025-05-13T00:00:00").getTime())',
    example: 1747083600000,
    default: 1747083600000,
  })
  @IsNumber()
  EventDate: number;

  @ApiProperty({
    description: 'Operator ID (e.g., 3 for Egede)',
    example: 3,
    default: 3,
  })
  @IsNumber()
  OperatorId: number;

  @ApiProperty({
    description: 'Station ID (e.g., 57865)',
    example: 57865,
    default: 57865,
  })
  @IsNumber()
  StationId: number;
}

export class GetStationByLine {
  @ApiProperty({
    description: 'Event date in timestamp format',
    example: 1747083600000,
  })
  @IsNumber()
  EventDate: number;

  @ApiProperty({
    description: 'Operator ID',
    example: 3,
  })
  @IsNumber()
  OperatorId: number;

  @ApiProperty({
    description: 'Official line ID (e.g., 12083)',
    example: 12083,
    default: 12083,
  })
  @IsNumber()
  OfficelineId: number;

  @ApiProperty({
    description: 'Direction code (e.g., 1)',
    example: 1,
    default: 1,
  })
  @IsNumber()
  Directions: number;
}

export class GetTrainStations {
  @ApiProperty({
    description: 'Station type ID (e.g., 7 for Israel Train)',
    example: 7,
    default: 7,
  })
  @IsNumber()
  StationTypeId: number;
}

export class GetLinesByLine {
  @ApiProperty({
    description: 'Event date in timestamp format',
    example: 1747083600000,
  })
  @IsNumber()
  EventDate: number;

  @ApiProperty({
    description: 'Operator ID',
    example: 3,
  })
  @IsNumber()
  OperatorId: number;

  @ApiProperty({
    description: 'Operator line ID (e.g., 83)',
    example: 83,
    default: 83,
  })
  @IsNumber()
  OperatorLineId: number;
}

// Response DTOs
export class DataModel {
  @ApiProperty()
  @IsNumber()
  DataCode: number;

  @ApiProperty()
  @IsString()
  DataText: string;
}

export class LineModel {
  @ApiProperty()
  @IsNumber()
  lineCode: number;

  @ApiProperty()
  @IsString()
  lineText: string;

  @ApiProperty()
  @IsNumber()
  operatorId: number;

  @ApiProperty()
  @IsString()
  eventDate: string;

  @ApiProperty()
  @IsNumber()
  directionCode: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  directionText?: string | null;

  @ApiProperty()
  destinationCity: DataModel;

  @ApiProperty()
  originCity: DataModel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string | null;
}

export class StationModel {
  @ApiProperty()
  @IsNumber()
  stationId: number;

  @ApiProperty()
  @IsString()
  stationName: string;

  @ApiProperty()
  @IsNumber()
  cityId: number;

  @ApiProperty()
  @IsString()
  cityName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stationFullName?: string | null;
}

export class SubjectModel {
  @ApiProperty()
  @IsString()
  RowNumber: string;

  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  vehicles_type_: string;

  @ApiProperty()
  @IsString()
  vehicles_type_code: string;

  @ApiProperty()
  @IsString()
  request_subject: string;

  @ApiProperty()
  @IsString()
  subject_code: string;
}

export class PniyaModel {
  @ApiProperty()
  @IsString()
  RowNumber: string;

  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  pniya: string;
}

export class NotRealNumberModel {
  @ApiProperty()
  @IsString()
  RowNumber: string;

  @ApiProperty()
  @IsString()
  Code: string;

  @ApiProperty()
  @IsString()
  IdNum: string;
}

export class GovSuccessResponse<T> {
  @ApiProperty()
  @IsArray()
  data: T[];

  @ApiProperty({ example: true })
  success: boolean;
}

export class GovLinesResponse {
  @ApiProperty({ type: [LineModel] })
  data: LineModel[];

  @ApiProperty({ example: true })
  success: boolean;
}

export class GovStationsResponse {
  @ApiProperty({ type: [StationModel] })
  data: StationModel[];

  @ApiProperty({ example: true })
  success: boolean;
}

export class GovDataResponse {
  @ApiProperty({ type: [DataModel] })
  data: DataModel[];

  @ApiProperty({ example: true })
  success: boolean;
}

export class GovSubjectsResponse {
  @ApiProperty({ type: [SubjectModel] })
  data: SubjectModel[];

  @ApiProperty({ example: true })
  success: boolean;
}

export class GovPniyaResponse {
  @ApiProperty({ type: [PniyaModel] })
  data: PniyaModel[];

  @ApiProperty({ example: true })
  success: boolean;
}

export class GovNotRealNumbersResponse {
  @ApiProperty({ type: [NotRealNumberModel] })
  data: NotRealNumberModel[];

  @ApiProperty({ example: true })
  success: boolean;
}

export class GovTimeData {
  @ApiProperty()
  @IsString()
  serverTime: string;
}

export class GovTimeResponse {
  @ApiProperty()
  data: GovTimeData;

  @ApiProperty({ example: true })
  success: boolean;
}
