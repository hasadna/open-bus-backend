import { optionalObject, Type } from './index.js';

/** @type {import('fastify').FastifySchema} */
export const healthCheckSchema = {
  tags: ['Health'],
  summary: 'Health check endpoint',
  description: 'Returns the health status of the API',
  response: {
    200: optionalObject({
      status: Type.String({ examples: ['alive'] }),
      timestamp: Type.String({ format: 'date-time', examples: ['2025-07-01T13:09:05.570Z'] }),
      uptime: Type.Number({ examples: [23.1655282] }),
      version: Type.String({ examples: ['2.0.0'] }),
    }),
    500: optionalObject({ error: Type.String(), status: Type.String() }),
  },
};
