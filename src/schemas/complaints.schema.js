/**
 * Send complaint endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const sendComplaintSchema = {
  tags: ['Complaints'],
  summary: 'Send a complaint',
  description: 'Submits a complaint to the government forms system',
  body: {
    type: 'object',
    properties: {
      debug: {
        type: 'boolean',
        description: 'Enable debug mode to return XML without sending',
        default: false,
      },
      userData: {
        type: 'object',
        required: ['firstName', 'lastName', 'id', 'email', 'phone'],
        properties: {
          firstName: {
            type: 'string',
            description: 'First name of the complainant',
            minLength: 1,
            maxLength: 100,
          },
          lastName: {
            type: 'string',
            description: 'Last name of the complainant',
            minLength: 1,
            maxLength: 100,
          },
          id: {
            type: 'string',
            description: 'ID number of the complainant',
            pattern: '^[0-9]{9}$',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email address of the complainant',
          },
          phone: {
            type: 'string',
            description: 'Phone number of the complainant',
            pattern: '^[0-9\\-\\+\\s\\(\\)]{7,20}$',
          },
          complaintType: {
            type: 'string',
            description: 'Type of complaint (e.g., no_stop)',
            enum: ['no_stop', 'late', 'crowded', 'other'],
          },
          description: {
            type: 'string',
            description: 'Detailed description of the complaint',
            minLength: 10,
            maxLength: 1000,
          },
        },
      },
      databusData: {
        type: 'object',
        required: ['operator'],
        properties: {
          operator: {
            type: 'number',
            description: 'Bus operator ID',
            minimum: 1,
          },
          loc: {
            type: 'array',
            items: { type: 'number' },
            minItems: 2,
            maxItems: 2,
            description: 'Location coordinates [longitude, latitude]',
          },
          color: {
            type: 'number',
            description: 'Bus color code',
            minimum: 0,
          },
          bearing: {
            type: 'number',
            description: 'Direction bearing in degrees',
            minimum: 0,
            maximum: 360,
          },
          recorded_at_time: {
            type: 'number',
            description: 'Timestamp when the incident was recorded',
            minimum: 0,
          },
          point: {
            type: 'object',
            description: 'Detailed point information from the bus tracking system',
            properties: {
              id: { type: 'number' },
              siri_snapshot_id: { type: 'number' },
              siri_ride_stop_id: { type: 'number' },
              recorded_at_time: { type: 'string', format: 'date-time' },
              lon: { type: 'number' },
              lat: { type: 'number' },
              bearing: { type: 'number' },
              velocity: { type: 'number' },
              distance_from_journey_start: { type: 'number' },
              distance_from_siri_ride_stop_meters: { type: 'number' },
            },
          },
        },
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        debug: { type: 'boolean' },
        xml: { type: 'string', description: 'Generated XML (only in debug mode)' },
        data: { type: 'object', description: 'Response data from the government forms system' },
        referenceNumber: { type: 'string', description: 'Generated reference number' },
      },
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        details: { type: 'object' },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
};
