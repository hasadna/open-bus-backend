-- Adapted from open-bus-stride-clickhouse/stride_dbt/macros/ingest_siri_vehicle_location.sql.
-- ClickHouse expands one day's URL pattern and inserts only observations not stored yet.
-- source_url can also be one .br URL for direct SQL use.
INSERT INTO {database:Identifier}.siri_vehicle_location
(
    siri_snapshot_id, recorded_at_time, line_ref, data_frame_ref,
    dated_vehicle_journey_ref, operator_ref, origin_aimed_departure_time,
    vehicle_location_longitude, vehicle_location_latitude, bearing, velocity,
    vehicle_ref, stop_point_ref, stop_order, distance_from_stop
)
WITH
    substring({source_url:String}, position({source_url:String}, 'stride-siri-requester/') + length('stride-siri-requester/'), 10) AS archive_day,
    incoming AS (
SELECT
    replaceRegexpOne(substring(_path, position(_path, 'stride-siri-requester/') + length('stride-siri-requester/')), '[.]br$', '') AS siri_snapshot_id,
    parseDateTime32BestEffort(MonitoredStopVisit.RecordedAtTime, 'UTC') AS recorded_at_time,
    MonitoredStopVisit.MonitoredVehicleJourney.LineRef AS line_ref,
    MonitoredStopVisit.MonitoredVehicleJourney.FramedVehicleJourneyRef.DataFrameRef AS data_frame_ref,
    MonitoredStopVisit.MonitoredVehicleJourney.FramedVehicleJourneyRef.DatedVehicleJourneyRef AS dated_vehicle_journey_ref,
    MonitoredStopVisit.MonitoredVehicleJourney.OperatorRef AS operator_ref,
    parseDateTime32BestEffort(MonitoredStopVisit.MonitoredVehicleJourney.OriginAimedDepartureTime, 'UTC') AS origin_aimed_departure_time,
    MonitoredStopVisit.MonitoredVehicleJourney.VehicleLocation.Longitude AS vehicle_location_longitude,
    MonitoredStopVisit.MonitoredVehicleJourney.VehicleLocation.Latitude AS vehicle_location_latitude,
    MonitoredStopVisit.MonitoredVehicleJourney.Bearing AS bearing,
    MonitoredStopVisit.MonitoredVehicleJourney.Velocity AS velocity,
    MonitoredStopVisit.MonitoredVehicleJourney.VehicleRef AS vehicle_ref,
    MonitoredStopVisit.MonitoredVehicleJourney.MonitoredCall.StopPointRef AS stop_point_ref,
    MonitoredStopVisit.MonitoredVehicleJourney.MonitoredCall.Order AS stop_order,
    MonitoredStopVisit.MonitoredVehicleJourney.MonitoredCall.DistanceFromStop AS distance_from_stop
FROM url(
    {source_url:String},
    'JSONEachRow',
    'Siri Tuple(
        ServiceDelivery Tuple(
            Status String,
            ErrorCondition String,
            StopMonitoringDelivery Array(
                Tuple(
                    Status String,
                    ErrorCondition String,
                    MonitoredStopVisit Array(
                        Tuple(
                            RecordedAtTime String,
                            MonitoredVehicleJourney Tuple(
                                LineRef String,
                                FramedVehicleJourneyRef Tuple(
                                    DataFrameRef String,
                                    DatedVehicleJourneyRef String
                                ),
                                OperatorRef String,
                                OriginAimedDepartureTime String,
                                VehicleLocation Tuple(
                                    Longitude String,
                                    Latitude String
                                ),
                                Bearing String,
                                Velocity String,
                                VehicleRef String,
                                MonitoredCall Tuple(
                                    StopPointRef String,
                                    Order String,
                                    DistanceFromStop String
                                )
                            )
                        )
                    )
                )
            )
        )
    )',
    'br'
)
ARRAY JOIN if(throwIf(
    Siri.ServiceDelivery.Status = 'false' OR Siri.ServiceDelivery.ErrorCondition != '',
    'Invalid SIRI service delivery') = 0,
    Siri.ServiceDelivery.StopMonitoringDelivery, []) AS StopMonitoringDelivery
ARRAY JOIN if(throwIf(
    StopMonitoringDelivery.Status = 'false' OR StopMonitoringDelivery.ErrorCondition != '',
    'Invalid SIRI stop monitoring delivery') = 0,
    StopMonitoringDelivery.MonitoredStopVisit, []) AS MonitoredStopVisit
WHERE throwIf(
    NOT match(MonitoredStopVisit.RecordedAtTime, '(Z|[+-][0-9]{2}:[0-9]{2})$')
    OR NOT match(MonitoredStopVisit.MonitoredVehicleJourney.OriginAimedDepartureTime, '(Z|[+-][0-9]{2}:[0-9]{2})$')
    OR MonitoredStopVisit.MonitoredVehicleJourney.FramedVehicleJourneyRef.DataFrameRef = ''
    OR MonitoredStopVisit.MonitoredVehicleJourney.FramedVehicleJourneyRef.DatedVehicleJourneyRef = ''
    OR MonitoredStopVisit.MonitoredVehicleJourney.MonitoredCall.StopPointRef = '',
    'Invalid SIRI journey or observation timestamp'
) = 0
)
SELECT incoming.*
FROM incoming
LEFT ANTI JOIN (
    SELECT
        replaceRegexpOne(siri_snapshot_id, '[.]br$', '') AS siri_snapshot_id,
        recorded_at_time, line_ref, data_frame_ref, dated_vehicle_journey_ref,
        operator_ref, origin_aimed_departure_time, vehicle_location_longitude,
        vehicle_location_latitude, bearing, velocity, vehicle_ref, stop_point_ref,
        stop_order, distance_from_stop
    FROM {database:Identifier}.siri_vehicle_location
    WHERE format('{0}/{1}', splitByChar('/', siri_snapshot_id)[1], splitByChar('/', siri_snapshot_id)[2]) = substring(archive_day, 1, 7)
      AND startsWith(siri_snapshot_id, concat(archive_day, '/'))
) AS existing
USING (
    siri_snapshot_id, recorded_at_time, line_ref, data_frame_ref,
    dated_vehicle_journey_ref, operator_ref, origin_aimed_departure_time,
    vehicle_location_longitude, vehicle_location_latitude, bearing, velocity,
    vehicle_ref, stop_point_ref, stop_order, distance_from_stop
)
SETTINGS
    input_format_skip_unknown_fields = 1,
    input_format_json_read_bools_as_strings = 1,
    input_format_json_read_objects_as_strings = 1,
    glob_expansion_max_elements = 1440,
    join_algorithm = 'grace_hash',
    max_bytes_in_join = 0,
    max_bytes_before_external_join = 268435456,
    max_bytes_ratio_before_external_join = 0,
    max_threads = 2,
    max_download_threads = 2,
    max_insert_threads = 1,
    max_memory_usage = 1073741824,
    input_format_parallel_parsing = 0
