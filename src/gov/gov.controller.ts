import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import {
  GetLinesByStation,
  GetStationByLine,
  GetTrainStations,
  GetLinesByLine,
  GovLinesResponse,
  GovStationsResponse,
  GovDataResponse,
  GovSubjectsResponse,
  GovPniyaResponse,
  GovNotRealNumbersResponse,
  GovTimeResponse,
} from './gov.dto';
import { GovProvider } from './gov.provider';

@ApiTags('Government Transportation')
@ApiExtraModels()
@Controller('gov')
export class GovController {
  constructor(private readonly govRequest: GovProvider) {}

  @Post('lines-by-station')
  @ApiOperation({ summary: 'Get bus lines by station', description: 'Retrieve bus lines available at a specific station' })
  @ApiResponse({ status: 200, description: 'Lines retrieved successfully', type: GovLinesResponse })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getLinesByStation(@Body() body: GetLinesByStation) {
    return await this.govRequest.getLinesByStation(body);
  }

  @Get('cities')
  @ApiOperation({ summary: 'Get cities' })
  @ApiResponse({ status: 200, description: 'Cities retrieved successfully', type: GovDataResponse })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getCities() {
    return await this.govRequest.getCities();
  }

  @Get('operators')
  @ApiOperation({ summary: 'Get operators' })
  @ApiResponse({ status: 200, description: 'Operators retrieved successfully', type: GovDataResponse })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getOperators() {
    return await this.govRequest.getOperators();
  }

  @Post('stations-by-line')
  @ApiOperation({ summary: 'Get stations by line', description: 'Retrieve stations for a specific bus line' })
  @ApiResponse({ status: 200, description: 'Stations retrieved successfully', type: GovStationsResponse })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getStationByLine(@Body() body: GetStationByLine) {
    return await this.govRequest.getStationByLine(body);
  }

  @Get('subjects')
  @ApiOperation({ summary: 'Get subjects' })
  @ApiResponse({ status: 200, description: 'Subjects retrieved successfully', type: GovSubjectsResponse })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getSubjects() {
    return await this.govRequest.getSubjects();
  }

  @Post('train-stations')
  @ApiOperation({
    summary: 'Get train stations',
    description: 'Retrieve train stations by station type\n7 - Israel Train\n4 - Kfir Light Train\n13 - Tevel Ligh Train',
  })
  @ApiResponse({ status: 200, description: 'Train stations retrieved successfully', type: GovStationsResponse })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTrainStations(@Body() body: GetTrainStations) {
    return await this.govRequest.getTrainStations(body);
  }

  @Get('pniya')
  @ApiOperation({ summary: 'Get pniya' })
  @ApiResponse({ status: 200, description: 'Pniya retrieved successfully', type: GovPniyaResponse })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPniya() {
    return await this.govRequest.getPniya();
  }

  @Get('not-real-numbers')
  @ApiOperation({ summary: 'Get not real numbers' })
  @ApiResponse({ status: 200, description: 'Not real numbers retrieved successfully', type: GovNotRealNumbersResponse })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getNotRealNumbers() {
    return await this.govRequest.getNotRealNumbers();
  }

  @Post('lines-by-line')
  @ApiOperation({ summary: 'Get lines by line ID', description: 'Retrieve bus lines by specific line ID' })
  @ApiResponse({ status: 200, description: 'Lines retrieved successfully', type: GovLinesResponse })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getLinesByLine(@Body() body: GetLinesByLine) {
    return await this.govRequest.getLinesByLine(body);
  }

  @Get('time')
  @ApiOperation({ summary: 'Get current time' })
  @ApiResponse({ status: 200, description: 'Time retrieved successfully', type: GovTimeResponse })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTime() {
    return await this.govRequest.getTime();
  }
}
