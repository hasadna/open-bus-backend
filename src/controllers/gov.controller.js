import axios from 'axios';

// Base URL for government services
const GOV_BASE_URL = 'https://esb.gov.il/govServiceList';

/**
 * Helper object to make government API requests
 */
export const govRequest = {
  post(endpoint, data, options = {}) {
    const config = { timeout: 30000, ...options };
    const url = `${GOV_BASE_URL}${endpoint}`;
    return axios.post(url, data, config);
  },
  get(endpoint, options = {}) {
    const config = { timeout: 30000, ...options };
    const url = `${GOV_BASE_URL}${endpoint}`;
    return axios.get(url, config);
  },
};

/**
 * Get bus lines by station handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getLinesByStation(request, reply) {
  try {
    const { EventDate, OperatorId, StationId } = request.body;
    request.log.info('Getting lines by station', { EventDate, OperatorId, StationId });
    const response = await govRequest.post('/trafficLicensing/GetLines', request.body);
    return reply.status(200).send({ success: true, data: response.data });
  } catch (error) {
    request.log.error('Error getting lines by station', { error: error.message, body: request.body });
    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
      });
    }
    return reply.status(500).send({ error: 'Internal server error', message: 'Failed to retrieve lines by station' });
  }
}

/**
 * Get stations by line handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getStationByLine(request, reply) {
  try {
    const { eventDate, OperatorId, OfficelineId, Directions } = request.body;
    request.log.info('Getting stations by line', {
      eventDate,
      OperatorId,
      OfficelineId,
      directionsCount: Directions?.length,
    });

    const response = await govRequest.post('/trafficLicensing/GetStationToLine', request.body);
    return reply.status(200).send({ success: true, data: response.data });
  } catch (error) {
    request.log.error('Error getting stations by line', { error: error.message, body: request.body });
    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
      });
    }
    return reply.status(500).send({ error: 'Internal server error', message: 'Failed to retrieve stations by line' });
  }
}

/**
 * Get subjects (vehicle types) handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getSubjects(request, reply) {
  try {
    request.log.info('Getting subjects');
    const response = await govRequest.post('/ListProvider/GetList', { listName: 'subject_type_vehicles' });
    return reply.status(200).send({ success: true, data: response.data.Data.List });
  } catch (error) {
    request.log.error('Error getting subjects', { error: error.message, body: request.body });
    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
      });
    }
    return reply.status(500).send({ error: 'Internal server error', message: 'Failed to retrieve subjects' });
  }
}

/**
 * Get train stations handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getTrainStations(request, reply) {
  try {
    const { StationTypeId } = request.body;
    request.log.info('Getting train stations', { StationTypeId });
    const response = await govRequest.post('/trafficLicensing/GetTrainStations', { StationTypeId });
    return reply.status(200).send({ success: true, data: response.data.Data });
  } catch (error) {
    request.log.error('Error getting train stations', { error: error.message, body: request.body });
    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
      });
    }
    return reply.status(500).send({ error: 'Internal server error', message: 'Failed to retrieve train stations' });
  }
}

/**
 * Get pniya (vehicles type) handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getPniya(request, reply) {
  try {
    request.log.info('Getting pniya');
    const response = await govRequest.post('/ListProvider/GetList', { listName: 'pniya' });
    return reply.status(200).send({ success: true, data: response.data.Data.List });
  } catch (error) {
    request.log.error('Error getting pniya', { error: error.message, body: request.body });
    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
      });
    }
    return reply.status(500).send({ error: 'Internal server error', message: 'Failed to retrieve pniya' });
  }
}

/**
 * Get not real numbers handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getNotRealNumbers(request, reply) {
  try {
    request.log.info('Getting not real numbers');
    const response = await govRequest.post('/ListProvider/GetList', { listName: 'notrealnumbers' });
    return reply.status(200).send({ success: true, data: response.data.Data.List });
  } catch (error) {
    request.log.error('Error getting not real numbers', { error: error.message, body: request.body });
    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
      });
    }
    return reply.status(500).send({ error: 'Internal server error', message: 'Failed to retrieve not real numbers' });
  }
}

/**
 * Get lines by line ID handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getLinesByLine(request, reply) {
  try {
    const { eventDate, OperatorId, OperatorLineId } = request.body;
    request.log.info('Getting lines by line ID', { eventDate, OperatorId, OperatorLineId });
    const response = await govRequest.post('/trafficLicensing/GetLines');
    return reply.status(200).send({ success: true, data: response.data });
  } catch (error) {
    request.log.error('Error getting lines by line ID', { error: error.message, body: request.body });
    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
      });
    }
    return reply.status(500).send({ error: 'Internal server error', message: 'Failed to retrieve lines by line ID' });
  }
}

/**
 * Get cities handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getCities(request, reply) {
  try {
    request.log.info('Getting cities');
    const response = await govRequest.post('/trafficLicensing/GetCities');
    return reply.status(200).send({ success: true, data: response.data.Data });
  } catch (error) {
    request.log.error('Error getting cities', { error: error.message });

    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
      });
    }

    return reply.status(500).send({ error: 'Internal server error', message: 'Failed to retrieve cities' });
  }
}

/**
 * Get operators handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getOperators(request, reply) {
  try {
    request.log.info('Getting operators');
    const response = await govRequest.post('/trafficLicensing/GetOperators');
    return reply.status(200).send({ success: true, data: response.data.Data });
  } catch (error) {
    request.log.error('Error getting operators', { error: error.message });

    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
      });
    }

    return reply.status(500).send({ error: 'Internal server error', message: 'Failed to retrieve cities' });
  }
}

/**
 * Get current time handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getTime(request, reply) {
  try {
    request.log.info('Getting current time');
    const timestamp = Date.now();
    const response = await govRequest.get(`/TSA/GetTime?_=${timestamp}`);
    return reply.status(200).send({ success: true, data: { serverTime: response.data } });
  } catch (error) {
    request.log.error('Error getting current time', { error: error.message });
    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
      });
    }
    return reply.status(500).send({ error: 'Internal server error', message: 'Failed to retrieve current time' });
  }
}
