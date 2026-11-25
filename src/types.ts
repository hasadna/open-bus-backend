import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import type {
  ContextConfigDefault,
  FastifyBaseLogger,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifySchema,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  RouteGenericInterface,
} from 'fastify';
import type { Static } from 'typebox';

import type { busSchema, complaintFormSchema, sendComplaintSchema, trainSchema } from './schemas/complaints.schema.js';
import type { dataCodeModel } from './schemas/index.js';

type ComplaintModels = {
  DataCodeModel: typeof dataCodeModel;
  BusSchema: typeof busSchema;
  TrainSchema: typeof trainSchema;
  ComplaintFormSchema: typeof complaintFormSchema;
};

export type DataCode = Static<typeof dataCodeModel>;
export type ComplaintData = Static<typeof complaintFormSchema, ComplaintModels>;
export type ComplaintBody = Static<typeof sendComplaintSchema.body, ComplaintModels>;
export type ComplaintHeaders = Static<typeof sendComplaintSchema.headers>;

export type AppServer = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>;

export type SchemaRequest<S extends FastifySchema> = FastifyRequest<
  RouteGenericInterface,
  RawServerDefault,
  RawRequestDefaultExpression,
  S,
  TypeBoxTypeProvider
>;
export type SchemaReply<S extends FastifySchema> = FastifyReply<
  RouteGenericInterface,
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  ContextConfigDefault,
  S,
  TypeBoxTypeProvider
>;
