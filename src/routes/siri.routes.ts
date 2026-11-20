import * as controllers from '../controllers/siri.controller.js';
import { handleStrideValidation } from '../middleware/strideValidation.js';
import * as schemas from '../schemas/siri.schema.js';
import type { AppServer } from '../types.js';

export function siriRoutes(fastify: AppServer) {
  fastify.get(
    schemas.listSiriRoutesSchema.path,
    { schema: schemas.listSiriRoutesSchema.schema, errorHandler: handleStrideValidation },
    controllers.listSiriRoutes,
  );
  fastify.get(
    schemas.getSiriRoutesSchema.path,
    { schema: schemas.getSiriRoutesSchema.schema, errorHandler: handleStrideValidation },
    controllers.getSiriRoutes,
  );
  fastify.get(
    schemas.listSiriRidesSchema.path,
    { schema: schemas.listSiriRidesSchema.schema, errorHandler: handleStrideValidation },
    controllers.listSiriRides,
  );
  fastify.get(
    schemas.getSiriRidesSchema.path,
    { schema: schemas.getSiriRidesSchema.schema, errorHandler: handleStrideValidation },
    controllers.getSiriRides,
  );
  fastify.get(
    schemas.listSiriStopsSchema.path,
    { schema: schemas.listSiriStopsSchema.schema, errorHandler: handleStrideValidation },
    controllers.listSiriStops,
  );
  fastify.get(
    schemas.getSiriStopsSchema.path,
    { schema: schemas.getSiriStopsSchema.schema, errorHandler: handleStrideValidation },
    controllers.getSiriStops,
  );
  fastify.get(
    schemas.listSiriRideStopsSchema.path,
    { schema: schemas.listSiriRideStopsSchema.schema, errorHandler: handleStrideValidation },
    controllers.listSiriRideStops,
  );
  fastify.get(
    schemas.getSiriRideStopsSchema.path,
    { schema: schemas.getSiriRideStopsSchema.schema, errorHandler: handleStrideValidation },
    controllers.getSiriRideStops,
  );
  fastify.get(
    schemas.listSiriVehicleLocationsSchema.path,
    { schema: schemas.listSiriVehicleLocationsSchema.schema, errorHandler: handleStrideValidation },
    controllers.listSiriVehicleLocations,
  );
  fastify.get(
    schemas.getSiriVehicleLocationsSchema.path,
    { schema: schemas.getSiriVehicleLocationsSchema.schema, errorHandler: handleStrideValidation },
    controllers.getSiriVehicleLocations,
  );
  fastify.get(
    schemas.listSiriSnapshotsSchema.path,
    { schema: schemas.listSiriSnapshotsSchema.schema, errorHandler: handleStrideValidation },
    controllers.listSiriSnapshots,
  );
  fastify.get(
    schemas.getSiriSnapshotsSchema.path,
    { schema: schemas.getSiriSnapshotsSchema.schema, errorHandler: handleStrideValidation },
    controllers.getSiriSnapshots,
  );
}
