/**
 * Send complaint handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export function sendComplaint(request, reply) {
  request.log.info('Complaint submission is not implemented');
  return reply.status(501).send({ error: 'Not implemented', message: 'Complaint submission is not available yet' });
}
