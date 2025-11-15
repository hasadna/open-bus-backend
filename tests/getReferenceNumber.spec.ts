import { getReferenceNumber } from '../src/utils/getReferenceNumber';
import { cleanup } from './test.utils.spec';
import { jest } from '@jest/globals';
import axios from 'axios';

describe('getReferenceNumber', () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('should return the reference number', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({ data: '<span id="ReferenceNumber">1234567</span>' });
    const result = await getReferenceNumber();
    expect(result).toBe('1234567');
  });

  it('should return null if #ReferenceNumber not found', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({ data: '<div>No ref</div>' });
    const result = await getReferenceNumber();
    expect(result).toBeNull();
  });
});
