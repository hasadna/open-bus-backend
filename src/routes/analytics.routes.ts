import * as controllers from '../controllers/analytics.controller.js';
import { handleStrideValidation } from '../middleware/strideValidation.js';
import * as schemas from '../schemas/analytics.schema.js';
import type { AppServer } from '../types.js';

export function analyticsRoutes(fastify: AppServer) {
  fastify.get(
    schemas.listRouteTimetableSchema.path,
    { schema: schemas.listRouteTimetableSchema.schema, errorHandler: handleStrideValidation },
    controllers.listRouteTimetable,
  );
  fastify.get(
    schemas.listStopArrivalsSchema.path,
    { schema: schemas.listStopArrivalsSchema.schema, errorHandler: handleStrideValidation },
    controllers.listStopArrivals,
  );
  fastify.get(
    schemas.listRidesExecutionSchema.path,
    { schema: schemas.listRidesExecutionSchema.schema, errorHandler: handleStrideValidation },
    controllers.listRidesExecution,
  );
  fastify.get(
    schemas.siriVelocityAggregationSchema.path,
    { schema: schemas.siriVelocityAggregationSchema.schema, errorHandler: handleStrideValidation },
    controllers.siriVelocityAggregation,
  );
  fastify.get(
    schemas.listGtfsRidesAggSchema.path,
    { schema: schemas.listGtfsRidesAggSchema.schema, errorHandler: handleStrideValidation },
    controllers.listGtfsRidesAgg,
  );
  fastify.get(
    schemas.groupByGtfsRidesAggSchema.path,
    { schema: schemas.groupByGtfsRidesAggSchema.schema, errorHandler: handleStrideValidation },
    controllers.groupByGtfsRidesAgg,
  );
}
