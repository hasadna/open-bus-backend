import ky from 'ky';

/**
 * Health check handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */

export async function healthCheck(request, reply) {
  try {
    // Map URLs to friendly names
    const govApiMap = {
      form_server: 'https://forms.gov.il/globaldata/getsequence/setform.aspx',
      data_server: 'https://esb.gov.il/govServiceList/',
    };
    const govApiStatuses = {};
    await Promise.all(
      Object.entries(govApiMap).map(async ([name, url]) => {
        try {
          const res = await ky.get(url);
          govApiStatuses[name] = res.status === 200 ? 'alive' : `status_${res.status}`;
        } catch {
          govApiStatuses[name] = 'unreachable';
        }
      }),
    );

    const healthData = {
      status: 'alive',
      gov_api: govApiStatuses,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.0.0',
    };

    request.log.info('Health check requested', { status: healthData.status, gov_api: govApiStatuses });

    return reply.status(200).send(healthData);
  } catch (error) {
    request.log.error('Health check failed', error);

    return reply.status(500).send({
      error: 'Health check failed',
      status: 'unhealthy',
    });
  }
}
