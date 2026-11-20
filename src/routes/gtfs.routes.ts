import * as controllers from '../controllers/gtfs.controller.js';
import { handleStrideValidation } from '../middleware/strideValidation.js';
import * as schemas from '../schemas/gtfs.schema.js';
import type { AppServer } from '../types.js';

export function gtfsRoutes(fastify: AppServer) {
  fastify.get(
    schemas.listGtfsRoutesSchema.path,
    { schema: schemas.listGtfsRoutesSchema.schema, errorHandler: handleStrideValidation },
    controllers.listGtfsRoutes,
  );
  fastify.get(
    schemas.getGtfsRoutesSchema.path,
    { schema: schemas.getGtfsRoutesSchema.schema, errorHandler: handleStrideValidation },
    controllers.getGtfsRoutes,
  );
  fastify.get(
    schemas.listGtfsStopsSchema.path,
    { schema: schemas.listGtfsStopsSchema.schema, errorHandler: handleStrideValidation },
    controllers.listGtfsStops,
  );
  fastify.get(
    schemas.getGtfsStopsSchema.path,
    { schema: schemas.getGtfsStopsSchema.schema, errorHandler: handleStrideValidation },
    controllers.getGtfsStops,
  );
  fastify.get(
    schemas.listGtfsRidesSchema.path,
    { schema: schemas.listGtfsRidesSchema.schema, errorHandler: handleStrideValidation },
    controllers.listGtfsRides,
  );
  fastify.get(
    schemas.getGtfsRidesSchema.path,
    { schema: schemas.getGtfsRidesSchema.schema, errorHandler: handleStrideValidation },
    controllers.getGtfsRides,
  );
  fastify.get(
    schemas.listGtfsAgenciesSchema.path,
    { schema: schemas.listGtfsAgenciesSchema.schema, errorHandler: handleStrideValidation },
    controllers.listGtfsAgencies,
  );
  fastify.get(
    schemas.listGtfsRideStopsSchema.path,
    { schema: schemas.listGtfsRideStopsSchema.schema, errorHandler: handleStrideValidation },
    controllers.listGtfsRideStops,
  );
  fastify.get(
    schemas.getGtfsRideStopsSchema.path,
    { schema: schemas.getGtfsRideStopsSchema.schema, errorHandler: handleStrideValidation },
    controllers.getGtfsRideStops,
  );
}
