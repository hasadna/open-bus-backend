import { GovController } from '../src/gov/gov.controller';
import { cleanup, createMockRequest } from './test.utils.spec';
import { jest } from '@jest/globals';

describe('Government API Controller', () => {
  const mockGovRequest = {
    globalOptions: { timeout: 30000 },
    get: jest.fn() as any,
    post: jest.fn() as any,
    getLinesByStation: jest.fn() as any,
    getCities: jest.fn() as any,
    getOperators: jest.fn() as any,
    getStationByLine: jest.fn() as any,
    getSubjects: jest.fn() as any,
    getTrainStations: jest.fn() as any,
    getPniya: jest.fn() as any,
    getNotRealNumbers: jest.fn() as any,
    getLinesByLine: jest.fn() as any,
    getTime: jest.fn() as any,
  };

  const controller = new GovController(mockGovRequest as any);
  let request: any;

  beforeEach(() => {
    request = createMockRequest();
    (mockGovRequest.post as jest.Mock).mockClear();
    (mockGovRequest.get as jest.Mock).mockClear();
    (mockGovRequest.getLinesByStation as jest.Mock).mockClear();
    (mockGovRequest.getCities as jest.Mock).mockClear();
    (mockGovRequest.getOperators as jest.Mock).mockClear();
    (mockGovRequest.getStationByLine as jest.Mock).mockClear();
    (mockGovRequest.getSubjects as jest.Mock).mockClear();
    (mockGovRequest.getTrainStations as jest.Mock).mockClear();
    (mockGovRequest.getPniya as jest.Mock).mockClear();
    (mockGovRequest.getNotRealNumbers as jest.Mock).mockClear();
    (mockGovRequest.getLinesByLine as jest.Mock).mockClear();
    (mockGovRequest.getTime as jest.Mock).mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('getLinesByStation should return expected data', async () => {
    const mockLine = {
      lineCode: 11005,
      lineText: '5',
      operatorId: 3,
      eventDate: '2025-05-13T00:00:00',
      directionCode: 3,
      directionText: null,
      destinationCity: { DataCode: 2800, DataText: 'קרית שמונה' },
      originCity: { DataCode: 2800, DataText: 'קרית שמונה' },
      message: null,
    };
    const expected = { data: [mockLine], success: true };
    mockGovRequest.getLinesByStation.mockResolvedValue(expected);
    request.body = { EventDate: 1747083600000, OperatorId: 3, StationId: 57865 };
    const result = await controller.getLinesByStation(request.body);
    expect(result).toEqual(expected);
  });

  it('getStationByLine should return expected data', async () => {
    const mockStation = {
      stationId: 52298,
      stationName: 'בית ספר קורצק/יהודה הלוי',
      cityId: 2800,
      cityName: 'קרית שמונה',
      stationFullName: 'בית ספר קורצק/יהודה הלוי, קרית שמונה',
    };
    const expected = { data: [mockStation], success: true };
    mockGovRequest.getStationByLine.mockResolvedValue(expected);
    request.body = { EventDate: 1747083600000, OperatorId: 3, OfficelineId: 12083, Directions: 1 };
    const result = await controller.getStationByLine(request.body);
    expect(result).toEqual(expected);
  });

  it('getSubjects should return expected data', async () => {
    const mockSubject = {
      RowNumber: '2',
      code: '2',
      vehicles_type_: 'אוטובוס',
      vehicles_type_code: '0',
      request_subject: 'אי ביצוע נסיעה',
      subject_code: '3',
    };
    const expected = { data: [mockSubject], success: true };
    mockGovRequest.getSubjects.mockResolvedValue(expected);
    const result = await controller.getSubjects();
    expect(result).toEqual(expected);
  });

  it('getTrainStations should return expected data', async () => {
    const mockTrainStation = {
      stationId: 17109,
      stationName: 'אופקים',
      cityId: 0,
      cityName: 'אופקים',
      stationFullName: null,
    };
    const expected = { data: [mockTrainStation], success: true };
    mockGovRequest.getTrainStations.mockResolvedValue(expected);
    request.body = { StationTypeId: 7 };
    const result = await controller.getTrainStations(request.body);
    expect(result).toEqual(expected);
  });

  it('getPniya should return expected data', async () => {
    const mockPniya = { RowNumber: '1', code: '0', pniya: 'אוטובוס' };
    const expected = { data: [mockPniya], success: true };
    mockGovRequest.getPniya.mockResolvedValue(expected);
    const result = await controller.getPniya();
    expect(result).toEqual(expected);
  });

  it('getNotRealNumbers should return expected data', async () => {
    const mockNotReal = { RowNumber: '1', Code: '1', IdNum: '123456782' };
    const expected = { data: [mockNotReal], success: true };
    mockGovRequest.getNotRealNumbers.mockResolvedValue(expected);
    const result = await controller.getNotRealNumbers();
    expect(result).toEqual(expected);
  });

  it('getLinesByLine should return expected data', async () => {
    const mockLine = {
      lineCode: 10083,
      lineText: '83',
      operatorId: 3,
      eventDate: '2025-05-13T00:00:00',
      directionCode: 2,
      directionText: 'חיפה-חיפה',
      destinationCity: { DataCode: 4000, DataText: 'חיפה' },
      originCity: { DataCode: 4000, DataText: 'חיפה' },
      message: null,
    };
    const expected = { data: [mockLine], success: true };
    mockGovRequest.getLinesByLine.mockResolvedValue(expected);
    request.body = {
      EventDate: 1747083600000,
      OperatorId: 3,
      OperatorLineId: 83,
    };
    const result = await controller.getLinesByLine(request.body);
    expect(result).toEqual(expected);
  });

  it('getCities should return expected data', async () => {
    const mockCity = { DataCode: 5000, DataText: 'תל אביב יפו' };
    const expected = { data: [mockCity], success: true };
    mockGovRequest.getCities.mockResolvedValue(expected);
    const result = await controller.getCities();
    expect(result).toEqual(expected);
  });

  it('getOperators should return expected data', async () => {
    const mockOperator = { DataCode: 3, DataText: 'אגד' };
    const expected = { data: [mockOperator], success: true };
    mockGovRequest.getOperators.mockResolvedValue(expected);
    const result = await controller.getOperators();
    expect(result).toEqual(expected);
  });

  it('getTime should return expected data', async () => {
    const mockTime = '7/8/2025 10:09:25 PM';
    const expected = { data: { serverTime: mockTime }, success: true };
    mockGovRequest.getTime.mockResolvedValue(expected);
    const result = await controller.getTime();
    expect(result).toEqual(expected);
  });
});
