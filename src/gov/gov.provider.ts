import axios, { AxiosRequestConfig } from 'axios';
import { Injectable } from '@nestjs/common';
import { GetLinesByStation, GetStationByLine, GetTrainStations, GetLinesByLine, LineModel } from './gov.dto';
import { handleGovResponse, handleGovError, formatDate } from '../utils/govHelpers';

@Injectable()
export class GovProvider {
  private GOV_BASE_URL = 'https://esb.gov.il/govServiceList';
  globalOptions: AxiosRequestConfig = { timeout: 30000 };

  private get(endpoint: string, options: AxiosRequestConfig = {}) {
    const url = `${this.GOV_BASE_URL}${endpoint}`;
    return axios.get(url, { ...this.globalOptions, ...options });
  }

  private post(endpoint: string, data: any = {}, options: AxiosRequestConfig = {}) {
    const url = `${this.GOV_BASE_URL}${endpoint}`;
    return axios.post(url, data, { ...this.globalOptions, ...options });
  }

  async getLinesByStation(body: GetLinesByStation) {
    try {
      const { EventDate, OperatorId, StationId } = body;
      const date = formatDate(new Date(EventDate));
      const response = await this.post('/trafficLicensing/GetLines', { EventDate: date, OperatorId, StationId });
      return handleGovResponse<LineModel[]>(response.data.Data);
    } catch (error) {
      handleGovError(error, 'Failed to retrieve lines by station');
    }
  }

  async getCities() {
    try {
      const response = await this.post('/trafficLicensing/GetCities');
      return handleGovResponse(response.data.Data);
    } catch (error) {
      handleGovError(error, 'Failed to retrieve cities');
    }
  }

  async getOperators() {
    try {
      const response = await this.post('/trafficLicensing/GetOperators');
      return handleGovResponse(response.data.Data);
    } catch (error) {
      handleGovError(error, 'Failed to retrieve operators');
    }
  }

  async getStationByLine(body: GetStationByLine) {
    try {
      const { EventDate, OperatorId, OfficelineId, Directions } = body;
      const date = formatDate(new Date(EventDate));
      const response = await this.post('/trafficLicensing/GetStationToLine', {
        EventDate: date,
        OperatorId,
        OfficelineId,
        Directions: [Directions],
      });
      return handleGovResponse(response.data.Data);
    } catch (error) {
      handleGovError(error, 'Failed to retrieve stations by line');
    }
  }

  async getSubjects() {
    try {
      const response = await this.post('/ListProvider/GetList', { listName: 'subject_type_vehicles' });
      return handleGovResponse(response.data.Data.List);
    } catch (error) {
      handleGovError(error, 'Failed to retrieve subjects');
    }
  }

  async getTrainStations(body: GetTrainStations) {
    try {
      const { StationTypeId } = body;
      const response = await this.post('/trafficLicensing/GetTrainStations', { StationTypeId });
      return handleGovResponse(response.data.Data);
    } catch (error) {
      handleGovError(error, 'Failed to retrieve train stations');
    }
  }

  async getPniya() {
    try {
      const response = await this.post('/ListProvider/GetList', { listName: 'pniya' });
      return handleGovResponse(response.data.Data.List);
    } catch (error) {
      handleGovError(error, 'Failed to retrieve pniya');
    }
  }

  async getNotRealNumbers() {
    try {
      const response = await this.post('/ListProvider/GetList', { listName: 'notrealnumbers' });
      return handleGovResponse(response.data.Data.List);
    } catch (error) {
      handleGovError(error, 'Failed to retrieve not real numbers');
    }
  }

  async getLinesByLine(body: GetLinesByLine) {
    try {
      const { EventDate, OperatorId, OperatorLineId } = body;
      const date = formatDate(new Date(EventDate));
      const response = await this.post('/trafficLicensing/GetLines', { EventDate: date, OperatorId, OperatorLineId });
      return handleGovResponse(response.data.Data);
    } catch (error) {
      handleGovError(error, 'Failed to retrieve lines by line ID');
    }
  }

  async getTime() {
    try {
      const timestamp = Date.now();
      const response = await this.get(`/TSA/GetTime?_=${timestamp}`);
      return handleGovResponse({ serverTime: response.data });
    } catch (error) {
      handleGovError(error, 'Failed to retrieve current time');
    }
  }
}
