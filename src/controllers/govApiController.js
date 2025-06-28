import axios from 'axios'

// Base URL for government services
const GOV_BASE_URL = 'https://esb.gov.il/govServiceList'

/**
 * Helper function to make government API requests
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request data
 * @param {object} options - Request options
 * @returns {Promise<object>} API response
 */
async function makeGovApiRequest(endpoint, data = null, options = {}) {
  const config = {
    timeout: 30000, // 30 second timeout
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'OpenBus-Backend/1.0',
    },
    ...options,
  }

  const url = `${GOV_BASE_URL}${endpoint}`

  if (data) {
    return axios.post(url, data, config)
  } else {
    return axios.get(url, config)
  }
}

/**
 * Get bus lines by station handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getLinesByStation(request, reply) {
  try {
    const { EventDate, OperatorId, StationId } = request.body

    request.log.info('Getting lines by station', {
      EventDate,
      OperatorId,
      StationId,
    })

    const response = await makeGovApiRequest('/trafficLicensing/GetLines', request.body)

    request.log.info('Lines by station retrieved successfully', {
      count: response.data?.length || 0,
    })

    return reply.status(200).send({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    request.log.error('Error getting lines by station', {
      error: error.message,
      body: request.body,
    })

    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
        timestamp: new Date().toISOString(),
      })
    }

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve lines by station',
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * Get stations by line handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getStationByLine(request, reply) {
  try {
    const { eventDate, OperatorId, OfficelineId, Directions } = request.body

    request.log.info('Getting stations by line', {
      eventDate,
      OperatorId,
      OfficelineId,
      directionsCount: Directions?.length,
    })

    const response = await makeGovApiRequest('/trafficLicensing/GetStationToLine', request.body)

    request.log.info('Stations by line retrieved successfully', {
      count: response.data?.length || 0,
    })

    return reply.status(200).send({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    request.log.error('Error getting stations by line', {
      error: error.message,
      body: request.body,
    })

    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
        timestamp: new Date().toISOString(),
      })
    }

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve stations by line',
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * Get subjects (vehicle types) handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getSubjects(request, reply) {
  try {
    const { listName } = request.body

    request.log.info('Getting subjects', { listName })

    const response = await makeGovApiRequest('/ListProvider/GetList', request.body)

    request.log.info('Subjects retrieved successfully', {
      count: response.data?.length || 0,
    })

    return reply.status(200).send({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    request.log.error('Error getting subjects', {
      error: error.message,
      body: request.body,
    })

    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
        timestamp: new Date().toISOString(),
      })
    }

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve subjects',
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * Get train stations handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getTrainStations(request, reply) {
  try {
    const { StationTypeId } = request.body

    request.log.info('Getting train stations', { StationTypeId })

    const response = await makeGovApiRequest('/trafficLicensing/GetTrainStations', request.body)

    request.log.info('Train stations retrieved successfully', {
      count: response.data?.length || 0,
    })

    return reply.status(200).send({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    request.log.error('Error getting train stations', {
      error: error.message,
      body: request.body,
    })

    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
        timestamp: new Date().toISOString(),
      })
    }

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve train stations',
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * Get pniya (vehicles type) handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getPniya(request, reply) {
  try {
    const { listName } = request.body

    request.log.info('Getting pniya', { listName })

    const response = await makeGovApiRequest('/ListProvider/GetList', request.body)

    request.log.info('Pniya retrieved successfully', {
      count: response.data?.length || 0,
    })

    return reply.status(200).send({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    request.log.error('Error getting pniya', {
      error: error.message,
      body: request.body,
    })

    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
        timestamp: new Date().toISOString(),
      })
    }

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve pniya',
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * Get not real numbers handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getNotRealNumbers(request, reply) {
  try {
    const { listName } = request.body

    request.log.info('Getting not real numbers', { listName })

    const response = await makeGovApiRequest('/ListProvider/GetList', request.body)

    request.log.info('Not real numbers retrieved successfully', {
      count: response.data?.length || 0,
    })

    return reply.status(200).send({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    request.log.error('Error getting not real numbers', {
      error: error.message,
      body: request.body,
    })

    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
        timestamp: new Date().toISOString(),
      })
    }

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve not real numbers',
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * Get lines by line ID handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getLinesByLine(request, reply) {
  try {
    const { eventDate, OperatorId, OperatorLineId } = request.body

    request.log.info('Getting lines by line ID', {
      eventDate,
      OperatorId,
      OperatorLineId,
    })

    const response = await makeGovApiRequest('/trafficLicensing/GetLines', request.body)

    request.log.info('Lines by line ID retrieved successfully', {
      count: response.data?.length || 0,
    })

    return reply.status(200).send({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    request.log.error('Error getting lines by line ID', {
      error: error.message,
      body: request.body,
    })

    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
        timestamp: new Date().toISOString(),
      })
    }

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve lines by line ID',
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * Get cities handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getCities(request, reply) {
  try {
    request.log.info('Getting cities')

    const response = await makeGovApiRequest('/trafficLicensing/GetCities')

    request.log.info('Cities retrieved successfully', {
      count: response.data?.length || 0,
    })

    return reply.status(200).send({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    request.log.error('Error getting cities', {
      error: error.message,
    })

    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
        timestamp: new Date().toISOString(),
      })
    }

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve cities',
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * Get current time handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getTime(request, reply) {
  try {
    request.log.info('Getting current time')

    const timestamp = Date.now()
    const response = await makeGovApiRequest(`/TSA/GetTime?_=${timestamp}`)

    request.log.info('Current time retrieved successfully')

    return reply.status(200).send({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        serverTime: response.data,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    request.log.error('Error getting current time', {
      error: error.message,
    })

    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
        timestamp: new Date().toISOString(),
      })
    }

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve current time',
      timestamp: new Date().toISOString(),
    })
  }
}
