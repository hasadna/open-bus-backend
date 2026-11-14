import { pgTable, pgEnum, bigserial, serial, varchar, integer, date, bigint, timestamp, doublePrecision, boolean, uniqueIndex, index, foreignKey, primaryKey, pgMaterializedView, type PgTableExtraConfigValue } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const artifactstatusenum = pgEnum("artifactstatusenum", ["uploading", "error", "success"])
export const etlstatusenum = pgEnum("etlstatusenum", ["loading", "loaded", "error", "deleted", "pending"])


export const alembicVersion = pgTable("alembic_version", {
	versionNum: varchar("version_num", { length: 32 }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.versionNum], name: "alembic_version_pkc"}),
]);

export const artifact = pgTable("artifact", {
	id: serial().notNull(),
	filePrefix: varchar("file_prefix"),
	status: artifactstatusenum(),
	metadataJson: varchar("metadata_json"),
	error: varchar(),
	url: varchar(),
	createdAt: timestamp("created_at"),
	fileSizeBytes: integer("file_size_bytes"),
}, (table) => [
	primaryKey({ columns: [table.id], name: "pk_artifact"}),
	index("ix_artifact_created_at").using("btree", table.createdAt.asc().nullsLast()),
	index("ix_artifact_file_prefix").using("btree", table.filePrefix.asc().nullsLast()),
	index("ix_artifact_status").using("btree", table.status.asc().nullsLast()),
]);

export const clustertoline = pgTable("clustertoline", {
	operatorname: varchar({ length: 50 }),
	officelineid: integer(),
	operatorlineid: integer(),
	clustername: varchar({ length: 50 }),
	fromdate: varchar({ length: 50 }),
	todate: varchar({ length: 50 }),
	clusterid: integer(),
	linetype: integer(),
	linetypedesc: varchar({ length: 50 }),
	clustersubdesc: varchar({ length: 50 }),
});

export const gtfsData = pgTable("gtfs_data", {
	id: serial().notNull(),
	date: date(),
	processingStartedAt: timestamp("processing_started_at"),
	processingCompletedAt: timestamp("processing_completed_at"),
	processingError: varchar("processing_error"),
	processingSuccess: boolean("processing_success"),
	processingUsedStrideDate: date("processing_used_stride_date"),
	downloadUploadStartedAt: timestamp("download_upload_started_at"),
	downloadUploadCompletedAt: timestamp("download_upload_completed_at"),
	downloadUploadError: varchar("download_upload_error"),
	downloadUploadSuccess: boolean("download_upload_success"),
}, (table) => [
	primaryKey({ columns: [table.id], name: "pk_gtfs_data"}),
	uniqueIndex("ix_gtfs_data_date").using("btree", table.date.asc().nullsLast()),
	index("ix_gtfs_data_download_upload_started_at").using("btree", table.downloadUploadStartedAt.asc().nullsLast()),
	index("ix_gtfs_data_processing_started_at").using("btree", table.processingStartedAt.asc().nullsLast()),
]);

export const gtfsDataTask = pgTable("gtfs_data_task", {
	id: serial().notNull(),
	gtfsDataId: integer("gtfs_data_id"),
	taskName: varchar("task_name"),
	startedAt: timestamp("started_at"),
	completedAt: timestamp("completed_at"),
	error: varchar(),
	success: boolean(),
}, (table) => [
	primaryKey({ columns: [table.id], name: "pk_gtfs_data_task"}),
	foreignKey({
		columns: [table.gtfsDataId],
		foreignColumns: [gtfsData.id],
		name: "fk_gtfs_data_task_gtfs_data_id_gtfs_data"
	}),
	uniqueIndex("idx_gtfs_data_task_id_name").using("btree", table.gtfsDataId.asc().nullsLast(), table.taskName.asc().nullsLast()),
	index("ix_gtfs_data_task_task_name").using("btree", table.taskName.asc().nullsLast()),
]);

export const gtfsRide = pgTable("gtfs_ride", {
	id: serial().notNull(),
	gtfsRouteId: integer("gtfs_route_id"),
	journeyRef: varchar("journey_ref"),
	firstGtfsRideStopId: bigint("first_gtfs_ride_stop_id", { mode: 'number' }),
	lastGtfsRideStopId: bigint("last_gtfs_ride_stop_id", { mode: 'number' }),
	startTime: timestamp("start_time"),
	endTime: timestamp("end_time"),
}, (table): PgTableExtraConfigValue[] => [
	primaryKey({ columns: [table.id], name: "pk_gtfs_ride"}),
	foreignKey({
		columns: [table.firstGtfsRideStopId],
		foreignColumns: [gtfsRideStop.id],
		name: "fk_gtfs_ride_first_gtfs_ride_stop_id_gtfs_ride_stop"
	}),
	foreignKey({
		columns: [table.gtfsRouteId],
		foreignColumns: [gtfsRoute.id],
		name: "fk_gtfs_ride_gtfs_route_id_gtfs_route"
	}),
	foreignKey({
		columns: [table.lastGtfsRideStopId],
		foreignColumns: [gtfsRideStop.id],
		name: "fk_gtfs_ride_last_gtfs_ride_stop_id_gtfs_ride_stop"
	}),
	index("ix_gtfs_ride_gtfs_route_id").using("btree", table.gtfsRouteId.asc().nullsLast()),
	index("ix_gtfs_ride_journey_ref").using("btree", table.journeyRef.asc().nullsLast()),
	index("ix_gtfs_ride_start_time").using("btree", table.startTime.asc().nullsLast()),
]);

export const gtfsRideStop = pgTable("gtfs_ride_stop", {
	id: bigserial({ mode: 'number' }).notNull(),
	gtfsStopId: integer("gtfs_stop_id"),
	gtfsRideId: integer("gtfs_ride_id"),
	stopSequence: integer("stop_sequence"),
	pickupType: integer("pickup_type"),
	dropOffType: integer("drop_off_type"),
	shapeDistTraveled: integer("shape_dist_traveled"),
	arrivalTime: timestamp("arrival_time"),
	departureTime: timestamp("departure_time"),
}, (table): PgTableExtraConfigValue[] => [
	primaryKey({ columns: [table.id], name: "pk_gtfs_ride_stop"}),
	foreignKey({
		columns: [table.gtfsRideId],
		foreignColumns: [gtfsRide.id],
		name: "fk_gtfs_ride_stop_gtfs_ride_id_gtfs_ride"
	}),
	foreignKey({
		columns: [table.gtfsStopId],
		foreignColumns: [gtfsStop.id],
		name: "fk_gtfs_ride_stop_gtfs_stop_id_gtfs_stop"
	}),
	index("ix_gtfs_ride_stop_arrival_time").using("btree", table.arrivalTime.asc().nullsLast()),
	index("ix_gtfs_ride_stop_gtfs_ride_id").using("btree", table.gtfsRideId.asc().nullsLast()),
	index("ix_gtfs_ride_stop_gtfs_stop_id").using("btree", table.gtfsStopId.asc().nullsLast()),
]);

export const gtfsRoute = pgTable("gtfs_route", {
	id: serial().notNull(),
	date: date(),
	lineRef: integer("line_ref"),
	operatorRef: integer("operator_ref"),
	routeShortName: varchar("route_short_name"),
	routeLongName: varchar("route_long_name"),
	routeMkt: varchar("route_mkt"),
	routeDirection: varchar("route_direction"),
	routeAlternative: varchar("route_alternative"),
	agencyName: varchar("agency_name"),
	routeType: varchar("route_type"),
}, (table) => [
	primaryKey({ columns: [table.id], name: "pk_gtfs_route"}),
	index("ix_gtfs_route_date").using("btree", table.date.asc().nullsLast()),
	index("ix_gtfs_route_line_ref").using("btree", table.lineRef.asc().nullsLast()),
	index("ix_gtfs_route_operator_ref").using("btree", table.operatorRef.asc().nullsLast()),
]);

export const gtfsStop = pgTable("gtfs_stop", {
	id: serial().notNull(),
	date: date(),
	code: integer(),
	lat: doublePrecision(),
	lon: doublePrecision(),
	name: varchar(),
	city: varchar(),
}, (table) => [
	primaryKey({ columns: [table.id], name: "pk_gtfs_stop"}),
	index("ix_gtfs_stop_code").using("btree", table.code.asc().nullsLast()),
	index("ix_gtfs_stop_date").using("btree", table.date.asc().nullsLast()),
	index("ix_gtfs_stop_lat").using("btree", table.lat.asc().nullsLast()),
	index("ix_gtfs_stop_lon").using("btree", table.lon.asc().nullsLast()),
]);

export const gtfsStopMotId = pgTable("gtfs_stop_mot_id", {
	id: serial().notNull(),
	gtfsStopId: integer("gtfs_stop_id"),
	motId: integer("mot_id"),
}, (table) => [
	primaryKey({ columns: [table.id], name: "pk_gtfs_stop_mot_id"}),
	foreignKey({
		columns: [table.gtfsStopId],
		foreignColumns: [gtfsStop.id],
		name: "fk_gtfs_stop_mot_id_gtfs_stop_id_gtfs_stop"
	}),
	index("ix_gtfs_stop_mot_id_gtfs_stop_id").using("btree", table.gtfsStopId.asc().nullsLast()),
	index("ix_gtfs_stop_mot_id_mot_id").using("btree", table.motId.asc().nullsLast()),
]);

export const siriRide = pgTable("siri_ride", {
	id: serial().notNull(),
	siriRouteId: integer("siri_route_id"),
	journeyRef: varchar("journey_ref"),
	scheduledStartTime: timestamp("scheduled_start_time"),
	vehicleRef: varchar("vehicle_ref"),
	updatedFirstLastVehicleLocations: timestamp("updated_first_last_vehicle_locations", { withTimezone: true }),
	firstVehicleLocationId: bigint("first_vehicle_location_id", { mode: 'number' }),
	lastVehicleLocationId: bigint("last_vehicle_location_id", { mode: 'number' }),
	updatedDurationMinutes: timestamp("updated_duration_minutes", { withTimezone: true }),
	durationMinutes: integer("duration_minutes"),
	journeyGtfsRideId: integer("journey_gtfs_ride_id"),
	routeGtfsRideId: integer("route_gtfs_ride_id"),
	gtfsRideId: integer("gtfs_ride_id"),
	scheduledTimeGtfsRideId: integer("scheduled_time_gtfs_ride_id"),
}, (table) => [
	primaryKey({ columns: [table.id], name: "pk_siri_ride"}),
	foreignKey({
		columns: [table.gtfsRideId],
		foreignColumns: [gtfsRide.id],
		name: "fk_siri_ride_gtfs_ride_id_gtfs_ride"
	}),
	foreignKey({
		columns: [table.journeyGtfsRideId],
		foreignColumns: [gtfsRide.id],
		name: "fk_siri_ride_journey_gtfs_ride_id_gtfs_ride"
	}),
	foreignKey({
		columns: [table.routeGtfsRideId],
		foreignColumns: [gtfsRide.id],
		name: "fk_siri_ride_route_gtfs_ride_id_gtfs_ride"
	}),
	foreignKey({
		columns: [table.scheduledTimeGtfsRideId],
		foreignColumns: [gtfsRide.id],
		name: "fk_siri_ride_scheduled_time_gtfs_ride_id_gtfs_ride"
	}),
	foreignKey({
		columns: [table.siriRouteId],
		foreignColumns: [siriRoute.id],
		name: "fk_siri_ride_siri_route_id_siri_route"
	}),
	uniqueIndex("idx_route_journey_ref_vehicle_ref").using("btree", table.siriRouteId.asc().nullsLast(), table.journeyRef.asc().nullsLast(), table.vehicleRef.asc().nullsLast()),
	index("idx_siri_ride_scheduled_start_date").using("btree", sql`date_trunc('day'::text, scheduled_start_time)`),
	index("ix_siri_ride_duration_minutes").using("btree", table.durationMinutes.asc().nullsLast()),
	index("ix_siri_ride_journey_ref").using("btree", table.journeyRef.asc().nullsLast()),
	index("ix_siri_ride_route_gtfs_ride_id").using("btree", table.routeGtfsRideId.asc().nullsLast()),
	index("ix_siri_ride_scheduled_start_time").using("btree", table.scheduledStartTime.asc().nullsLast()),
	index("ix_siri_ride_scheduled_time_gtfs_ride_id").using("btree", table.scheduledTimeGtfsRideId.asc().nullsLast()),
	index("ix_siri_ride_siri_route_id").using("btree", table.siriRouteId.asc().nullsLast()),
	index("ix_siri_ride_updated_duration_minutes").using("btree", table.updatedDurationMinutes.asc().nullsLast()),
	index("ix_siri_ride_updated_first_last_vehicle_locations").using("btree", table.updatedFirstLastVehicleLocations.asc().nullsLast()),
	index("ix_siri_ride_vehicle_ref").using("btree", table.vehicleRef.asc().nullsLast()),
]);

export const siriRideStop = pgTable("siri_ride_stop", {
	id: bigserial({ mode: 'number' }).notNull(),
	siriStopId: integer("siri_stop_id"),
	siriRideId: integer("siri_ride_id"),
	order: integer(),
	gtfsStopId: integer("gtfs_stop_id"),
	nearestSiriVehicleLocationId: bigint("nearest_siri_vehicle_location_id", { mode: 'number' }),
}, (table) => [
	primaryKey({ columns: [table.id], name: "pk_siri_ride_stop"}),
	foreignKey({
		columns: [table.gtfsStopId],
		foreignColumns: [gtfsStop.id],
		name: "fk_siri_ride_stop_gtfs_stop_id_gtfs_stop"
	}),
	foreignKey({
		columns: [table.siriRideId],
		foreignColumns: [siriRide.id],
		name: "fk_siri_ride_stop_siri_ride_id_siri_ride"
	}),
	foreignKey({
		columns: [table.siriStopId],
		foreignColumns: [siriStop.id],
		name: "fk_siri_ride_stop_siri_stop_id_siri_stop"
	}),
	uniqueIndex("idx_ride_stop_order").using("btree", table.siriRideId.asc().nullsLast(), table.siriStopId.asc().nullsLast(), table.order.asc().nullsLast()),
	index("ix_siri_ride_stop_gtfs_stop_id").using("btree", table.gtfsStopId.asc().nullsLast()),
	index("ix_siri_ride_stop_nearest_siri_vehicle_location_id").using("btree", table.nearestSiriVehicleLocationId.asc().nullsLast()),
	index("ix_siri_ride_stop_order").using("btree", table.order.asc().nullsLast()),
	index("ix_siri_ride_stop_siri_ride_id").using("btree", table.siriRideId.asc().nullsLast()),
	index("ix_siri_ride_stop_siri_stop_id").using("btree", table.siriStopId.asc().nullsLast()),
]);

export const siriRoute = pgTable("siri_route", {
	id: serial().notNull(),
	lineRef: integer("line_ref"),
	operatorRef: integer("operator_ref"),
}, (table) => [
	primaryKey({ columns: [table.id], name: "pk_siri_route"}),
	uniqueIndex("idx_operator_ref_line_ref").using("btree", table.operatorRef.asc().nullsLast(), table.lineRef.asc().nullsLast()),
	index("ix_siri_route_line_ref").using("btree", table.lineRef.asc().nullsLast()),
	index("ix_siri_route_operator_ref").using("btree", table.operatorRef.asc().nullsLast()),
]);

export const siriSnapshot = pgTable("siri_snapshot", {
	id: serial().notNull(),
	snapshotId: varchar("snapshot_id"),
	etlStatus: etlstatusenum("etl_status"),
	etlStartTime: timestamp("etl_start_time"),
	etlEndTime: timestamp("etl_end_time"),
	error: varchar(),
	numFailedParseVehicleLocations: integer("num_failed_parse_vehicle_locations"),
	numSuccessfulParseVehicleLocations: integer("num_successful_parse_vehicle_locations"),
	numAddedSiriRides: integer("num_added_siri_rides"),
	numAddedSiriRideStops: integer("num_added_siri_ride_stops"),
	numAddedSiriRoutes: integer("num_added_siri_routes"),
	numAddedSiriStops: integer("num_added_siri_stops"),
	lastHeartbeat: timestamp("last_heartbeat"),
	createdBy: varchar("created_by"),
	etlPendingTime: timestamp("etl_pending_time"),
}, (table) => [
	primaryKey({ columns: [table.id], name: "pk_siri_snapshot"}),
	index("ix_siri_snapshot_etl_start_time").using("btree", table.etlStartTime.asc().nullsLast()),
	uniqueIndex("ix_siri_snapshot_snapshot_id").using("btree", table.snapshotId.asc().nullsLast()),
]);

export const siriStop = pgTable("siri_stop", {
	id: serial().notNull(),
	code: integer(),
}, (table) => [
	primaryKey({ columns: [table.id], name: "pk_siri_stop"}),
	uniqueIndex("ix_siri_stop_code").using("btree", table.code.asc().nullsLast()),
]);

export const siriVehicleLocation = pgTable("siri_vehicle_location", {
	id: bigserial({ mode: 'number' }).notNull(),
	siriSnapshotId: integer("siri_snapshot_id"),
	siriRideStopId: bigint("siri_ride_stop_id", { mode: 'number' }),
	recordedAtTime: timestamp("recorded_at_time"),
	lon: doublePrecision(),
	lat: doublePrecision(),
	bearing: integer(),
	velocity: integer(),
	distanceFromJourneyStart: integer("distance_from_journey_start"),
	distanceFromSiriRideStopMeters: integer("distance_from_siri_ride_stop_meters"),
}, (table) => [
	primaryKey({ columns: [table.id], name: "pk_siri_vehicle_location"}),
	foreignKey({
		columns: [table.siriSnapshotId],
		foreignColumns: [siriSnapshot.id],
		name: "fk_siri_vehicle_location_siri_snapshot_id_siri_snapshot"
	}),
	index("ix_siri_vehicle_location_lat").using("btree", table.lat.asc().nullsLast()),
	index("ix_siri_vehicle_location_lon").using("btree", table.lon.asc().nullsLast()),
	index("ix_siri_vehicle_location_recorded_at_time").using("btree", table.recordedAtTime.asc().nullsLast()),
	index("ix_siri_vehicle_location_siri_ride_stop_id").using("btree", table.siriRideStopId.asc().nullsLast()),
	index("ix_siri_vehicle_location_siri_snapshot_id").using("btree", table.siriSnapshotId.asc().nullsLast()),
]);
export const gtfsRidesAgg = pgMaterializedView("gtfs_rides_agg", {	gtfsRouteId: integer("gtfs_route_id"),
	gtfsRouteDate: timestamp("gtfs_route_date"),
	numPlannedRides: bigint("num_planned_rides", { mode: 'number' }),
	numActualRides: bigint("num_actual_rides", { mode: 'number' }),
}).as(sql`SELECT a.id AS gtfs_route_id, a.day AS gtfs_route_date, a.cnt AS num_planned_rides, b.cnt AS num_actual_rides FROM ( SELECT gtfs_ride.gtfs_route_id AS id, date_trunc('day'::text, gtfs_ride.start_time + '04:00:00'::interval) AS day, count(1) AS cnt FROM gtfs_ride GROUP BY gtfs_ride.gtfs_route_id, (date_trunc('day'::text, gtfs_ride.start_time + '04:00:00'::interval))) a, ( SELECT gtfs_ride.gtfs_route_id AS id, date_trunc('day'::text, gtfs_ride.start_time + '04:00:00'::interval) AS day, count(1) AS cnt FROM gtfs_ride, siri_ride WHERE siri_ride.gtfs_ride_id = gtfs_ride.id GROUP BY gtfs_ride.gtfs_route_id, (date_trunc('day'::text, gtfs_ride.start_time + '04:00:00'::interval))) b WHERE a.id = b.id AND a.day = b.day`);

export const gtfsRidesAggByHour = pgMaterializedView("gtfs_rides_agg_by_hour", {	gtfsRouteId: integer("gtfs_route_id"),
	gtfsRouteHour: timestamp("gtfs_route_hour"),
	gtfsRouteDate: timestamp("gtfs_route_date"),
	numPlannedRides: bigint("num_planned_rides", { mode: 'number' }),
	numActualRides: bigint("num_actual_rides", { mode: 'number' }),
}).as(sql`SELECT gtfs_ride.gtfs_route_id, date_trunc('hour'::text, gtfs_ride.start_time) AS gtfs_route_hour, date_trunc('day'::text, gtfs_ride.start_time) AS gtfs_route_date, count(*) AS num_planned_rides, count(*) FILTER (WHERE sr.scheduled_time_gtfs_ride_id IS NOT NULL) AS num_actual_rides FROM gtfs_ride LEFT JOIN siri_ride sr ON gtfs_ride.id = sr.scheduled_time_gtfs_ride_id GROUP BY gtfs_ride.gtfs_route_id, (date_trunc('hour'::text, gtfs_ride.start_time)), (date_trunc('day'::text, gtfs_ride.start_time))`);