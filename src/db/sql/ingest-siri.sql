-- Execute with a JSON document as input in JSONAsString format.
-- table and database are identifiers; snapshot is YYYY/MM/DD/HH/mm.br.
INSERT INTO {database:Identifier}.{table:Identifier}
(siri_snapshot_id, recorded_at_time, line_ref, data_frame_ref,
 dated_vehicle_journey_ref, operator_ref, origin_aimed_departure_time,
 vehicle_location_longitude, vehicle_location_latitude, bearing, velocity,
 vehicle_ref, stop_point_ref, stop_order, distance_from_stop)
WITH
 JSONExtractRaw(visit, 'MonitoredVehicleJourney') AS journey,
 JSONExtractRaw(journey, 'FramedVehicleJourneyRef') AS frame,
 JSONExtractRaw(journey, 'VehicleLocation') AS location,
 JSONExtractRaw(journey, 'MonitoredCall') AS call
SELECT
 {snapshot:String},
 parseDateTimeBestEffort(JSONExtractString(visit, 'RecordedAtTime'), 'UTC'),
 JSONExtractString(journey, 'LineRef'),
 JSONExtractString(frame, 'DataFrameRef'),
 JSONExtractString(frame, 'DatedVehicleJourneyRef'),
 JSONExtractString(journey, 'OperatorRef'),
 parseDateTimeBestEffort(JSONExtractString(journey, 'OriginAimedDepartureTime'), 'UTC'),
 JSONExtractString(location, 'Longitude'), JSONExtractString(location, 'Latitude'),
 JSONExtractString(journey, 'Bearing'), JSONExtractString(journey, 'Velocity'),
 JSONExtractString(journey, 'VehicleRef'), JSONExtractString(call, 'StopPointRef'),
 JSONExtractString(call, 'Order'), JSONExtractString(call, 'DistanceFromStop')
FROM (
 SELECT arrayJoin(JSONExtractArrayRaw(delivery, 'MonitoredStopVisit')) AS visit
 FROM (
  SELECT arrayJoin(JSONExtractArrayRaw(payload, 'Siri', 'ServiceDelivery', 'StopMonitoringDelivery')) AS delivery
  FROM input('payload String')
 )
)
FORMAT JSONAsString
