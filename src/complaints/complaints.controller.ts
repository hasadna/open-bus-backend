import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import axios from 'axios';
import { SendComplaint, SendComplaintResponse } from './complaints.dto';
import { getReferenceNumber } from '../utils/getReferenceNumber';
import { templateBuilder } from '../utils/templateBuilder';

const URL = 'https://forms.gov.il/globaldata/getsequence/setform.aspx?formtype=PniotMot%40mot.gov.il';

@ApiTags('Complaints')
@Controller('complaints')
export class ComplaintsController {
  @Post()
  @ApiOperation({ summary: 'Send complaint', description: 'Submits a complaint to the government forms system' })
  @ApiResponse({ status: 200, description: 'Complaint sent successfully', type: SendComplaintResponse })
  async sendComplaint(@Body() body: SendComplaint) {
    try {
      const { debug, userData, databusData } = body;
      const isDebug = Boolean(debug) || process.env.NODE_ENV === 'test' || process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

      const referenceNumber = isDebug ? '1234567' : await getReferenceNumber();
      const xml = templateBuilder({ ...body, ReferenceNumber: referenceNumber });

      if (isDebug) {
        return { success: true, debug: true, xml };
      }

      const response = await axios.post(URL, xml, { headers: { 'Content-Type': 'application/xml' }, timeout: 30000 });

      return { success: true, debug: false, data: response.data, referenceNumber };
    } catch (error) {
      if (error.validation) {
        throw new HttpException(error.validation, HttpStatus.BAD_REQUEST);
      }

      if (error.response) {
        throw new HttpException(
          { error: 'Government API error', message: `Status: ${error.response.status} - ${error.response.statusText}` },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (error.code === 'ECONNABORTED') {
        throw new HttpException({ error: 'Request timeout', message: 'The government API request timed out' }, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      throw new HttpException(
        { error: 'Internal server error', message: 'An unexpected error occurred while processing the complaint' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
