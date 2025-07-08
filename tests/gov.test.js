import { expect } from 'chai';
import sinon from 'sinon';

import * as govController from '../src/controllers/gov.controller.js';
import { cleanup, createMockReply, createMockRequest } from './test.utils.js';

describe('Government API Controller', () => {
  let reply;
  let request;
  let post;
  let get;

  beforeEach(() => {
    request = createMockRequest();
    reply = createMockReply();
    post = sinon.stub(govController.govRequest, 'post');
    get = sinon.stub(govController.govRequest, 'get');
  });

  afterEach(() => {
    sinon.restore();
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
    post.resolves({ data: { Data: [mockLine] } });
    request.body = { EventDate: 1747083600000, OperatorId: 3, StationId: 57865 };
    await govController.getLinesByStation(request, reply);
    expect(reply.sendCalledWith).to.deep.equal(expected);
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
    post.resolves({ data: { Data: [mockStation] } });
    request.body = { EventDate: 1747083600000, OperatorId: 3, OfficelineId: 12083, Directions: 1 };
    await govController.getStationByLine(request, reply);
    expect(reply.sendCalledWith).to.deep.equal(expected);
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
    post.resolves({ data: { Data: { List: [mockSubject] } } });
    await govController.getSubjects(request, reply);
    expect(reply.sendCalledWith).to.deep.equal(expected);
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
    post.resolves({ data: { Data: [mockTrainStation] } });
    request.body = { StationTypeId: 7 };
    await govController.getTrainStations(request, reply);
    expect(reply.sendCalledWith).to.deep.equal(expected);
  });

  it('getPniya should return expected data', async () => {
    const mockPniya = { RowNumber: '1', code: '0', pniya: 'אוטובוס' };
    const expected = { data: [mockPniya], success: true };
    post.resolves({ data: { Data: { List: [mockPniya] } } });
    await govController.getPniya(request, reply);
    expect(reply.sendCalledWith).to.deep.equal(expected);
  });

  it('getNotRealNumbers should return expected data', async () => {
    const mockNotReal = { RowNumber: '1', Code: '1', IdNum: '123456782' };
    const expected = { data: [mockNotReal], success: true };
    post.resolves({ data: { Data: { List: [mockNotReal] } } });
    await govController.getNotRealNumbers(request, reply);
    expect(reply.sendCalledWith).to.deep.equal(expected);
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
    post.resolves({ data: { Data: [mockLine] } });
    request.body = {
      EventDate: 1747083600000,
      OperatorId: 3,
      OperatorLineId: 83,
    };
    await govController.getLinesByLine(request, reply);
    expect(reply.sendCalledWith).to.deep.equal(expected);
  });

  it('getCities should return expected data', async () => {
    const mockCity = { DataCode: 5000, DataText: 'תל אביב יפו' };
    const expected = { data: [mockCity], success: true };
    post.resolves({ data: { Data: [mockCity] } });
    await govController.getCities(request, reply);
    expect(reply.sendCalledWith).to.deep.equal(expected);
  });

  it('getOperators should return expected data', async () => {
    const mockOperator = { DataCode: 3, DataText: 'אגד' };
    const expected = { data: [mockOperator], success: true };
    post.resolves({ data: { Data: [mockOperator] } });
    await govController.getOperators(request, reply);
    expect(reply.sendCalledWith).to.deep.equal(expected);
  });

  it('getTime should return expected data', async () => {
    const mockTime = '7/8/2025 10:09:25 PM';
    const expected = { data: { serverTime: mockTime }, success: true };
    get.resolves({ data: mockTime });
    await govController.getTime(request, reply);
    expect(reply.sendCalledWith).to.deep.equal(expected);
  });
});
