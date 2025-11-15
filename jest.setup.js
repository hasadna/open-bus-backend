/* global jest */

// Mock localStorage for Node environment
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock cheerio to avoid ES module issues
jest.mock('cheerio', () => ({
  load: jest.fn((html) =>
    jest.fn((selector) => {
      if (selector === '#ReferenceNumber' && html.includes('ReferenceNumber')) {
        return { text: jest.fn(() => '1234567'), length: 1 };
      }
      return { text: jest.fn(() => ''), length: 0 };
    }),
  ),
}));
