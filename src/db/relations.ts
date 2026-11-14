import { defineRelations } from "drizzle-orm";
import * as schema from "./schema.js";

export const relations = defineRelations(schema, (r) => ({
	gtfsDataTask: {
		gtfsDatum: r.one.gtfsData({
			from: r.gtfsDataTask.gtfsDataId,
			to: r.gtfsData.id
		}),
	},
	gtfsData: {
		gtfsDataTasks: r.many.gtfsDataTask(),
	},
	gtfsRide: {
		gtfsRideStopFirstGtfsRideStopId: r.one.gtfsRideStop({
			from: r.gtfsRide.firstGtfsRideStopId,
			to: r.gtfsRideStop.id,
			alias: "gtfsRide_firstGtfsRideStopId_gtfsRideStop_id"
		}),
		gtfsRoute: r.one.gtfsRoute({
			from: r.gtfsRide.gtfsRouteId,
			to: r.gtfsRoute.id
		}),
		gtfsRideStopLastGtfsRideStopId: r.one.gtfsRideStop({
			from: r.gtfsRide.lastGtfsRideStopId,
			to: r.gtfsRideStop.id,
			alias: "gtfsRide_lastGtfsRideStopId_gtfsRideStop_id"
		}),
		gtfsStops: r.many.gtfsStop({
			from: r.gtfsRide.id.through(r.gtfsRideStop.gtfsRideId),
			to: r.gtfsStop.id.through(r.gtfsRideStop.gtfsStopId)
		}),
		gtfsRideStops: r.many.gtfsRideStop({
			alias: "gtfsRideStop_gtfsRideId_gtfsRide_id"
		}),
		siriRidesGtfsRideId: r.many.siriRide({
			alias: "siriRide_gtfsRideId_gtfsRide_id"
		}),
		siriRidesJourneyGtfsRideId: r.many.siriRide({
			alias: "siriRide_journeyGtfsRideId_gtfsRide_id"
		}),
		siriRidesRouteGtfsRideId: r.many.siriRide({
			alias: "siriRide_routeGtfsRideId_gtfsRide_id"
		}),
		siriRidesScheduledTimeGtfsRideId: r.many.siriRide({
			alias: "siriRide_scheduledTimeGtfsRideId_gtfsRide_id"
		}),
	},
	gtfsRideStop: {
		gtfsRidesFirstGtfsRideStopId: r.many.gtfsRide({
			alias: "gtfsRide_firstGtfsRideStopId_gtfsRideStop_id"
		}),
		gtfsRidesLastGtfsRideStopId: r.many.gtfsRide({
			alias: "gtfsRide_lastGtfsRideStopId_gtfsRideStop_id"
		}),
		gtfsRide: r.one.gtfsRide({
			from: r.gtfsRideStop.gtfsRideId,
			to: r.gtfsRide.id,
			alias: "gtfsRideStop_gtfsRideId_gtfsRide_id"
		}),
		gtfsStop: r.one.gtfsStop({
			from: r.gtfsRideStop.gtfsStopId,
			to: r.gtfsStop.id
		}),
	},
	gtfsRoute: {
		gtfsRides: r.many.gtfsRide(),
	},
	gtfsStop: {
		gtfsRides: r.many.gtfsRide(),
		gtfsRideStops: r.many.gtfsRideStop(),
		gtfsStopMotIds: r.many.gtfsStopMotId(),
		siriRideStops: r.many.siriRideStop(),
	},
	gtfsStopMotId: {
		gtfsStop: r.one.gtfsStop({
			from: r.gtfsStopMotId.gtfsStopId,
			to: r.gtfsStop.id
		}),
	},
	siriRide: {
		gtfsRideGtfsRideId: r.one.gtfsRide({
			from: r.siriRide.gtfsRideId,
			to: r.gtfsRide.id,
			alias: "siriRide_gtfsRideId_gtfsRide_id"
		}),
		gtfsRideJourneyGtfsRideId: r.one.gtfsRide({
			from: r.siriRide.journeyGtfsRideId,
			to: r.gtfsRide.id,
			alias: "siriRide_journeyGtfsRideId_gtfsRide_id"
		}),
		gtfsRideRouteGtfsRideId: r.one.gtfsRide({
			from: r.siriRide.routeGtfsRideId,
			to: r.gtfsRide.id,
			alias: "siriRide_routeGtfsRideId_gtfsRide_id"
		}),
		gtfsRideScheduledTimeGtfsRideId: r.one.gtfsRide({
			from: r.siriRide.scheduledTimeGtfsRideId,
			to: r.gtfsRide.id,
			alias: "siriRide_scheduledTimeGtfsRideId_gtfsRide_id"
		}),
		siriRoute: r.one.siriRoute({
			from: r.siriRide.siriRouteId,
			to: r.siriRoute.id
		}),
		siriRideStops: r.many.siriRideStop(),
	},
	siriRoute: {
		siriRides: r.many.siriRide(),
	},
	siriRideStop: {
		gtfsStop: r.one.gtfsStop({
			from: r.siriRideStop.gtfsStopId,
			to: r.gtfsStop.id
		}),
		siriRide: r.one.siriRide({
			from: r.siriRideStop.siriRideId,
			to: r.siriRide.id
		}),
		siriStop: r.one.siriStop({
			from: r.siriRideStop.siriStopId,
			to: r.siriStop.id
		}),
	},
	siriStop: {
		siriRideStops: r.many.siriRideStop(),
	},
	siriVehicleLocation: {
		siriSnapshot: r.one.siriSnapshot({
			from: r.siriVehicleLocation.siriSnapshotId,
			to: r.siriSnapshot.id
		}),
	},
	siriSnapshot: {
		siriVehicleLocations: r.many.siriVehicleLocation(),
	},
}))