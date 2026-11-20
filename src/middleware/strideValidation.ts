import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export function handleStrideValidation(error: FastifyError, _request: FastifyRequest, reply: FastifyReply) {
  if (!error.validation) throw error;

  return reply.code(422).send({
    detail: error.validation.map(({ instancePath, keyword, message, params }) => ({
      loc: [
        'query',
        ...instancePath
          .split('/')
          .slice(1)
          .map((part) => part.replace(/~1/g, '/').replace(/~0/g, '~')),
        ...(keyword === 'required' ? [params.missingProperty] : []),
      ],
      msg: message ?? 'Invalid value',
      type: keyword,
    })),
  });
}
