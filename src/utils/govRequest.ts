import axios, { AxiosRequestConfig } from 'axios';

// Base URL for government services
const GOV_BASE_URL = 'https://esb.gov.il/govServiceList';

/**
 * Helper object to make government API requests
 */
export const govRequest = {
  globalOptions: { timeout: 30000 },
  get<T>(endpoint: string, options: AxiosRequestConfig<T> = {}) {
    const config = { ...this.globalOptions, ...options };
    const url = `${GOV_BASE_URL}${endpoint}`;
    return axios.get(url, config);
  },
  post<T>(endpoint: string, data?: T, options: AxiosRequestConfig<T> = {}) {
    const config = { ...this.globalOptions, ...options };
    const url = `${GOV_BASE_URL}${endpoint}`;
    return axios.post(url, data, config);
  },
};
