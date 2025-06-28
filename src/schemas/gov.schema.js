// Common response schemas
export const commonErrorResponse = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    message: { type: 'string' },
  },
};

export const commonSuccessResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: { type: 'object' },
  },
};

/**
 * GetLinesByStation endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getLinesByStationSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get bus lines by station',
  description: 'Retrieve bus lines available at a specific station',
  body: {
    type: 'object',
    required: ['EventDate', 'OperatorId', 'StationId'],
    properties: {
      EventDate: {
        type: 'string',
        example: '13/05/2025',
        pattern: '^\\d{2}/\\d{2}/\\d{4}$',
        description: 'Event date in DD/MM/YYYY format',
      },
      OperatorId: {
        type: 'number',
        example: 3,
        minimum: 1,
        description: 'Operator ID',
      },
      StationId: {
        type: 'number',
        example: 57865,
        minimum: 1,
        description: 'Station ID',
      },
    },
  },
  response: {
    200: {
      ...commonSuccessResponse,
      properties: {
        ...commonSuccessResponse.properties,
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              lineId: { type: 'number' },
              lineName: { type: 'string' },
              operatorId: { type: 'number' },
              operatorName: { type: 'string' },
            },
          },
        },
      },
    },
    400: commonErrorResponse,
    500: commonErrorResponse,
  },
};

/**
 * GetStationByLine endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getStationByLineSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get stations by line',
  description: 'Retrieve stations for a specific bus line',
  body: {
    type: 'object',
    required: ['eventDate', 'OperatorId', 'OfficelineId', 'Directions'],
    properties: {
      eventDate: {
        type: 'string',
        example: '13/05/2025',
        pattern: '^\\d{2}/\\d{2}/\\d{4}$',
        description: 'Event date in DD/MM/YYYY format',
      },
      OperatorId: {
        type: 'number',
        example: 3,
        minimum: 1,
        description: 'Operator ID',
      },
      OfficelineId: {
        type: 'number',
        example: 12083,
        minimum: 1,
        description: 'Official line ID',
      },
      Directions: {
        type: 'array',
        items: {
          type: 'number',
          minimum: 1,
        },
        example: [1],
        minItems: 1,
        description: 'Array of direction IDs',
      },
    },
  },
  response: {
    200: {
      ...commonSuccessResponse,
      properties: {
        ...commonSuccessResponse.properties,
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              stationId: { type: 'number' },
              stationName: { type: 'string' },
              direction: { type: 'number' },
              sequence: { type: 'number' },
            },
          },
        },
      },
    },
    400: commonErrorResponse,
    500: commonErrorResponse,
  },
};

/**
 * GetSubjects endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getSubjectsSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get subject types for vehicles',
  description: 'Retrieve subject types for vehicles from the government list',
  response: {
    200: {
      ...commonSuccessResponse,
      properties: {
        ...commonSuccessResponse.properties,
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              RowNumber: { type: 'string' },
              code: { type: 'string' },
              vehicles_type_: { type: 'string' },
              vehicles_type_code: { type: 'string' },
              request_subject: { type: 'string' },
              subject_code: { type: 'string' },
            },
          },
        },
      },
    },
    400: commonErrorResponse,
    500: commonErrorResponse,
  },
};

/**
 * GetTrainStations endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getTrainStationsSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get train stations',
  description: 'Retrieve train stations by station type\n7 - Israel Train\n4 - Kfir Light Train\n13 - Tevel Ligh Train',
  body: {
    type: 'object',
    properties: {
      StationTypeId: { type: 'number' },
    },
    required: ['StationTypeId'],
  },
  response: {
    200: {
      ...commonSuccessResponse,
      properties: {
        ...commonSuccessResponse.properties,
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              stationId: { type: 'number' },
              stationName: { type: 'string' },
              cityId: { type: 'number' },
              cityName: { type: 'string' },
              stationFullName: { type: 'null' },
            },
          },
        },
      },
    },
    400: commonErrorResponse,
    500: commonErrorResponse,
  },
};

/**
 * GetPniya endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getPniyaSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get Pniya (Vehicles type)',
  description: 'Retrieve pniya list for vehicles',
  response: {
    200: {
      ...commonSuccessResponse,
      properties: {
        ...commonSuccessResponse.properties,
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              RowNumber: { type: 'string' },
              code: { type: 'string' },
              pniya: { type: 'string' },
            },
          },
        },
      },
    },
    400: commonErrorResponse,
    500: commonErrorResponse,
  },
};

/**
 * GetNotRealNumbers endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getNotRealNumbersSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get not real numbers (Testing)',
  description: 'Retrieve not real numbers list for testing',

  response: {
    200: {
      ...commonSuccessResponse,
      properties: {
        ...commonSuccessResponse.properties,
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              RowNumber: { type: 'string' },
              Code: { type: 'string' },
              IdNum: { type: 'string' },
            },
          },
        },
      },
    },
    400: commonErrorResponse,
    500: commonErrorResponse,
  },
};

/**
 * GetLinesByLine endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getLinesByLineSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get lines by line ID',
  description: 'Retrieve bus lines by specific line ID',
  body: {
    type: 'object',
    required: ['eventDate', 'OperatorId', 'OperatorLineId'],
    properties: {
      eventDate: {
        type: 'string',
        example: '13/05/2025',
        pattern: '^\\d{2}/\\d{2}/\\d{4}$',
        description: 'Event date in DD/MM/YYYY format',
      },
      OperatorId: {
        type: 'number',
        example: 3,
        minimum: 1,
        description: 'Operator ID',
      },
      OperatorLineId: {
        type: 'number',
        example: 83,
        minimum: 1,
        description: 'Operator line ID',
      },
    },
  },
  response: {
    200: {
      ...commonSuccessResponse,
      properties: {
        ...commonSuccessResponse.properties,
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              lineId: { type: 'number' },
              lineName: { type: 'string' },
              operatorId: { type: 'number' },
              operatorName: { type: 'string' },
              direction: { type: 'number' },
            },
          },
        },
      },
    },
    400: commonErrorResponse,
    500: commonErrorResponse,
  },
};

/**
 * GetCities endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getCitiesSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get cities',
  description: 'Retrieve list of cities',
  response: {
    200: {
      ...commonSuccessResponse,
      properties: {
        ...commonSuccessResponse.properties,
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              DataCode: { type: 'number' },
              DataText: { type: 'string' },
            },
          },
        },
      },
    },
    500: commonErrorResponse,
  },
};

/**
 * GetOperators endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getOperatorsSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get operators',
  description: 'Retrieve list of operators',
  response: {
    200: {
      ...commonSuccessResponse,
      properties: {
        ...commonSuccessResponse.properties,
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              DataCode: { type: 'number' },
              DataText: { type: 'string' },
            },
          },
        },
      },
    },
    500: commonErrorResponse,
  },
};

/**
 * GetTime endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getTimeSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get current time',
  description: 'Retrieve current server time',
  response: {
    200: {
      ...commonSuccessResponse,
      properties: {
        ...commonSuccessResponse.properties,
        data: {
          type: 'object',
          properties: {
            serverTime: { type: 'string' },
          },
        },
      },
    },
    500: commonErrorResponse,
  },
};
