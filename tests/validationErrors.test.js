import { expect } from 'chai';
import { describe, it } from 'mocha';

import { createServer } from '../src/config/server.config.js';
import { globalErrorHandler } from '../src/middleware/errorHandler.js';
import { registerRoutes } from '../src/routes/index.js';

describe('validation error responses', () => {
  it('returns all invalid complaint fields and preserves their messages through serialization', async () => {
    const app = await createServer();
    app.setErrorHandler(globalErrorHandler);
    registerRoutes(app);
    try {
      const response = await app.inject({
        method: 'POST',
        url: '/complaints/send',
        headers: { 'pair-key': '12345678-1234-4123-8123-123456789abc' },
        payload: {
          debug: true,
          data: {
            firstName: 'אביב',
            lastName: 'אבאצי',
            id: 'redc',
            email: 'redc',
            mobile: 'redc',
            eventHour: '13:45',
            eventDate: '2026-11-09T11:45:39.000Z',
            details: 'dsadas',
            title: 'Test complaint',
            lang: 'he',
            transport: { dataText: 'Bus', dataCode: '0' },
            subject: { dataText: 'Missed trip', dataCode: '2' },
            bus: {
              lineNumberText: '1',
              operator: { dataText: 'Egged', dataCode: '3' },
              direction: { dataText: 'A<->B', dataCode: '30001' },
              raisingStation: { dataText: 'Station', dataCode: '41749' },
            },
          },
        },
      });
      expect(response.statusCode).to.equal(400);
      const body = response.json();
      expect(body.error).to.equal('Validation failed');
      expect(body.details.map(({ field }) => field)).to.include.members(['data.id', 'data.email', 'data.mobile']);
      expect(body.details.every(({ message }) => typeof message === 'string' && message.length > 0)).to.equal(true);

      const missing = await app.inject({
        method: 'POST',
        url: '/complaints/send',
        headers: { 'pair-key': '12345678-1234-4123-8123-123456789abc' },
        payload: {},
      });
      expect(missing.statusCode).to.equal(400);
      expect(missing.json().details).to.deep.include.members([
        {
          instancePath: '',
          schemaPath: '#/required',
          keyword: 'required',
          params: { missingProperty: 'data' },
          message: "must have required property 'data'",
          field: 'data',
        },
      ]);
    } finally {
      await app.close();
    }
  });
});
