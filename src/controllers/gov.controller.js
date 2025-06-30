import axios from 'axios';

// Base URL for government services
const GOV_BASE_URL = 'https://esb.gov.il/govServiceList';

/**
 * Helper object to make government API requests
 */
export const govRequest = {
  get(endpoint, options = {}) {
    const config = { timeout: 30000, ...options };
    const url = `${GOV_BASE_URL}${endpoint}`;
    return axios.get(url, config);
  },
  post(endpoint, data, options = {}) {
    const config = { timeout: 30000, ...options };
    const url = `${GOV_BASE_URL}${endpoint}`;
    return axios.post(url, data, config);
  },
};

/**
 * Formats a Date object into a string in the format 'DD/MM/YYYY'.
 *
 * @param {Date} date - The Date object to format.
 */
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Get bus lines by station handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getLinesByStation(request, reply) {
  try {
    const { EventDate, OperatorId, StationId } = request.body;
    const date = formatDate(new Date(EventDate));
    request.log.info('Getting lines by station', { EventDate: date, OperatorId, StationId });
    const response = await govRequest.post('/trafficLicensing/GetLines', { EventDate: date, OperatorId, StationId });
    return reply.status(200).send({ data: response.data, success: true });
  } catch (error) {
    request.log.error('Error getting lines by station', { body: request.body, error: error.message });
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
    const { EventDate, OperatorId, OfficelineId, Directions } = request.body;
    const date = formatDate(new Date(EventDate));
    request.log.info('Getting stations by line', {
      EventDate: date,
      OfficelineId,
      OperatorId,
      Directions,
    });
    const response = await govRequest.post('/trafficLicensing/GetStationToLine', {
      EventDate: date,
      OperatorId,
      OfficelineId,
      Directions: [Directions],
    });
    return reply.status(200).send({ data: response.data, success: true });
  } catch (error) {
    request.log.error('Error getting stations by line', { body: request.body, error: error.message });
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
    return reply.status(200).send({ data: response.data.Data.List, success: true });
  } catch (error) {
    request.log.error('Error getting subjects', { body: request.body, error: error.message });
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
    return reply.status(200).send({ data: response.data.Data, success: true });
  } catch (error) {
    request.log.error('Error getting train stations', { body: request.body, error: error.message });
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
    return reply.status(200).send({ data: response.data.Data.List, success: true });
  } catch (error) {
    request.log.error('Error getting pniya', { body: request.body, error: error.message });
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
    return reply.status(200).send({ data: response.data.Data.List, success: true });
  } catch (error) {
    request.log.error('Error getting not real numbers', { body: request.body, error: error.message });
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
    const { EventDate, OperatorId, OperatorLineId } = request.body;
    const date = formatDate(new Date(EventDate));
    request.log.info('Getting lines by line ID', { EventDate: date, OperatorId, OperatorLineId });
    const response = await govRequest.post('/trafficLicensing/GetLines', { EventDate: date, OperatorId, OperatorLineId });
    return reply.status(200).send({ data: response.data.Data, success: true });
  } catch (error) {
    request.log.error('Error getting lines by line ID', { body: request.body, error: error.message });
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
    return reply.status(200).send({ data: response.data.Data, success: true });
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
    return reply.status(200).send({ data: response.data.Data, success: true });
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
    return reply.status(200).send({ data: { serverTime: response.data }, success: true });
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
