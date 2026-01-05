import ky from 'ky';

// Base URL for government services
const GOV_BASE_URL = 'https://esb.gov.il/govServiceList';

/**
 * Helper object to make government API requests
 */
export const govRequest = {
  globalOptions: { timeout: 30000 },
  get(endpoint, options = {}) {
    const config = { ...this.globalOptions, ...options };
    const url = `${GOV_BASE_URL}${endpoint}`;
    return ky.get(url, config);
  },
  post(endpoint, data, options = {}) {
    const config = { ...this.globalOptions, ...options };
    const url = `${GOV_BASE_URL}${endpoint}`;
    return ky.post(url, { json: data, ...config });
  },
};
