import type { FastifyReply, FastifyRequest } from 'fastify';

export function sendComplaint(request: FastifyRequest, reply: FastifyReply) {
  request.log.info('Complaint submission is not implemented');
  return reply.status(501).send({ error: 'Not implemented', message: 'Complaint submission is not available yet' });
}
