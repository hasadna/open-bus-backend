import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';

import {
  getCities,
  getLinesByLine,
  getLinesByStation,
  getNotRealNumbers,
  getPniya,
  getStationByLine,
  getSubjects,
  getTime,
  getTrainStations,
} from '../src/controllers/gov.controller.js';
import {
  getLinesByLineSchema,
  getLinesByStationSchema,
  getNotRealNumbersSchema,
  getPniyaSchema,
  getStationByLineSchema,
  getSubjectsSchema,
  getTrainStationsSchema,
} from '../src/schemas/gov.schema.js';

describe('Government API Controller', () => {
  let mockReply;
  let mockRequest;

  beforeEach(() => {
    // Create mock request and reply objects
    mockRequest = {
      body: {},
      log: {
        error: () => {},
      },
    };

    mockReply = {
      status: (code) => ({
        send: (data) => ({ data, statusCode: code }),
      }),
    };
  });

  describe('getLinesByStation', () => {
    it('should have correct function signature', () => {
      expect(getLinesByStation).to.be.a('function');
      expect(getLinesByStation.length).to.equal(2);
    });

    it('should handle request with required parameters', () => {
      mockRequest.body = {
        EventDate: '13/05/2025',
        OperatorId: 3,
        StationId: 57865,
      };

      // Test that the function can be called without throwing
      expect(() => {
        getLinesByStation(mockRequest, mockReply);
      }).to.not.throw();
    });
  });

  describe('getStationByLine', () => {
    it('should have correct function signature', () => {
      expect(getStationByLine).to.be.a('function');
      expect(getStationByLine.length).to.equal(2);
    });

    it('should handle request with required parameters', () => {
      mockRequest.body = {
        Directions: [1],
        OfficelineId: 12083,
        OperatorId: 3,
        eventDate: '13/05/2025',
      };

      expect(() => {
        getStationByLine(mockRequest, mockReply);
      }).to.not.throw();
    });
  });

  describe('getSubjects', () => {
    it('should have correct function signature', () => {
      expect(getSubjects).to.be.a('function');
      expect(getSubjects.length).to.equal(2);
    });

    it('should handle request with required parameters', () => {
      mockRequest.body = {
        listName: 'subject_type_vehicles',
      };

      expect(() => {
        getSubjects(mockRequest, mockReply);
      }).to.not.throw();
    });

    it('should not have a body schema for getSubjects', () => {
      const schema = getSubjectsSchema;
      expect(schema).to.not.have.property('body');
    });
  });

  describe('getTrainStations', () => {
    it('should have correct function signature', () => {
      expect(getTrainStations).to.be.a('function');
      expect(getTrainStations.length).to.equal(2);
    });

    it('should handle request with required parameters', () => {
      mockRequest.body = {
        StationTypeId: 7,
      };

      expect(() => {
        getTrainStations(mockRequest, mockReply);
      }).to.not.throw();
    });
  });

  describe('getPniya', () => {
    it('should have correct function signature', () => {
      expect(getPniya).to.be.a('function');
      expect(getPniya.length).to.equal(2);
    });

    it('should handle request with required parameters', () => {
      mockRequest.body = {
        listName: 'pniya',
      };

      expect(() => {
        getPniya(mockRequest, mockReply);
      }).to.not.throw();
    });
  });

  describe('getNotRealNumbers', () => {
    it('should have correct function signature', () => {
      expect(getNotRealNumbers).to.be.a('function');
      expect(getNotRealNumbers.length).to.equal(2);
    });

    it('should handle request with required parameters', () => {
      mockRequest.body = {
        listName: 'notrealnumbers',
      };

      expect(() => {
        getNotRealNumbers(mockRequest, mockReply);
      }).to.not.throw();
    });
  });

  describe('getLinesByLine', () => {
    it('should have correct function signature', () => {
      expect(getLinesByLine).to.be.a('function');
      expect(getLinesByLine.length).to.equal(2);
    });

    it('should handle request with required parameters', () => {
      mockRequest.body = {
        OperatorId: 3,
        OperatorLineId: 83,
        eventDate: '13/05/2025',
      };

      expect(() => {
        getLinesByLine(mockRequest, mockReply);
      }).to.not.throw();
    });
  });

  describe('getCities', () => {
    it('should have correct function signature', () => {
      expect(getCities).to.be.a('function');
      expect(getCities.length).to.equal(2);
    });

    it('should handle request without body', () => {
      expect(() => {
        getCities(mockRequest, mockReply);
      }).to.not.throw();
    });
  });

  describe('getTime', () => {
    it('should have correct function signature', () => {
      expect(getTime).to.be.a('function');
      expect(getTime.length).to.equal(2);
    });

    it('should handle request without body', () => {
      expect(() => {
        getTime(mockRequest, mockReply);
      }).to.not.throw();
    });
  });

  describe('Schema validation', () => {
    it('should validate required fields for getLinesByStation', () => {
      const schema = getLinesByStationSchema;

      expect(schema.body.required).to.include('EventDate');
      expect(schema.body.required).to.include('OperatorId');
      expect(schema.body.required).to.include('StationId');
    });

    it('should validate required fields for getStationByLine', () => {
      const schema = getStationByLineSchema;

      expect(schema.body.required).to.include('eventDate');
      expect(schema.body.required).to.include('OperatorId');
      expect(schema.body.required).to.include('OfficelineId');
      expect(schema.body.required).to.include('Directions');
    });

    it('should validate required fields for getSubjects', () => {
      const schema = getSubjectsSchema;

      expect(schema).to.not.have.property('body');
    });

    it('should validate required fields for getTrainStations', () => {
      const schema = getTrainStationsSchema;

      expect(schema.body.required).to.include('StationTypeId');
    });

    it('should validate required fields for getPniya', () => {
      const schema = getPniyaSchema;

      expect(schema).to.not.have.property('body');
    });

    it('should validate required fields for getNotRealNumbers', () => {
      const schema = getNotRealNumbersSchema;

      expect(schema).to.not.have.property('body');
    });

    it('should validate required fields for getLinesByLine', () => {
      const schema = getLinesByLineSchema;

      expect(schema.body.required).to.include('eventDate');
      expect(schema.body.required).to.include('OperatorId');
      expect(schema.body.required).to.include('OperatorLineId');
    });
  });
});
