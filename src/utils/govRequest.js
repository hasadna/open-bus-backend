import ky from 'ky';

/**
 * Helper object to make government API requests
 */
export class GovRequest {
  static #url = 'https://esb.gov.il/govServiceList';
  static #timeout = 30000;
  static #keyMap = { DataCode: 'dataCode', DataText: 'dataText' };

  static #toCamelCase(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map((item) => this.#toCamelCase(item));
    const result = {};
    for (const key of Object.keys(obj)) {
      result[this.#keyMap[key] || key] = this.#toCamelCase(obj[key]);
    }
    return result;
  }

  static async get(endpoint, options = {}) {
    const url = `${this.#url}${endpoint}`;
    const response = await ky.get(url, { timeout: this.#timeout, ...options });
    return this.#toCamelCase(await response.json());
  }
  static async post(endpoint, data, options = {}) {
    const url = `${this.#url}${endpoint}`;
    const response = await ky.post(url, { timeout: this.#timeout, json: data, ...options });
    return this.#toCamelCase(await response.json());
  }
}
