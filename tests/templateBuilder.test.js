import { expect } from 'chai';
import { describe, it } from 'mocha';

import { idValidator, mobileValidator } from '../src/utils/complaintsValidator.js';
import { templateBuilder } from '../src/utils/templateBuilder.js';

describe('templateBuilder', () => {
  it('should throw if input does not have data property', () => {
    expect(() => templateBuilder({})).to.throw('Input must have data property');
  });

  it('should throw if input id not valid', () => {
    expect(() =>
      templateBuilder({
        data: {
          personalDetails: {
            iDNum: '123456789',
            firstName: 'שם פרטי',
            lastName: 'משפחה',
            email: 'email@gmail.com',
            phone: '0502345678',
          },
          requestDetails: {
            busAndOther: {
              operator: { dataText: '5' },
            },
          },
        },
      }),
    ).to.throw('Invalid Id Number');
  });

  it('should support input structured as { data: FormDataModelSchema }', () => {
    const xml = templateBuilder({
      debug: true,
      data: {
        personalDetails: {
          iDNum: '123456782',
          firstName: 'שם פרטי',
          lastName: 'משפחה',
          email: 'email@gmail.com',
          mobile: '0502345678',
        },
        requestSubject: {
          applySubject: { dataCode: '0', dataText: 'אוטובוס' },
          applyType: { dataCode: '3', dataText: 'אי עצירה בתחנה' },
        },
        busAndOther: {
          operator: { dataText: '5' },
        },
      },
    });

    expect(xml).to.include('<FirstName>שם פרטי</FirstName>');
    expect(xml).to.include('<LastName>משפחה</LastName>');
    expect(xml).to.include('<IDNum>123456782</IDNum>');
    expect(xml).to.include('<Email>email@gmail.com</Email>');
    expect(xml).to.include('<Mobile>050-2345678</Mobile>');
    expect(xml).to.include('<Operator text="5"></Operator>');
  });

  const defaultPersonalDetails = {
    firstName: '',
    lastName: '',
    iDNum: '',
    email: '',
    mobile: '',
  };

  const defaultRequestSubject = {
    applySubject: { dataCode: '', dataText: '' },
    applyType: { dataCode: '', dataText: '' },
  };

  const defaultBusAndOther = {
    ravKav: false,
    singleTrip: false,
    ravKavNumber: '',
    reportdate: '',
    reportTime: '',
    addingFrequencyReason: [],
    operator: { dataCode: '', dataText: '' },
    addOrRemoveStation: '',
    driverName: '',
    licenseNum: '',
    eventDate: '',
    eventHour: '',
    fromHour: '',
    toHour: '',
    fillByMakatOrAddress: '',
    makatStation: '',
    lineNumberText: '',
    lineNumberFromList: { dataCode: '', dataText: '' },
    direction: { dataCode: '', dataText: '' },
    raisingStation: { dataCode: '', dataText: '' },
    applyContent: '',
    busDirectionFrom: '',
    busDirectionTo: '',
    raisingStationCity: { dataCode: '', dataText: '' },
    destinationStationCity: { dataCode: '', dataText: '' },
    raisingStationAddress: '',
    cityId: '',
    cityName: '',
    raisingStationCityCode: '',
    raisingStationCityName: '',
    destinationStationCityCode: '',
    destinationStationCityText: '',
    directionCode: '',
    stationName: '',
    lineCode: '',
  };

  const defaultTaxi = {
    eventDetails: '',
    invoice: '',
    evidence: '',
    otherFactors: '',
    taxiType: '',
    licenseNum: '',
    cap: '',
    eventDate: '',
    eventHour: '',
    eventLocation: '',
    firstDeclaration: false,
    secondDeclaration: false,
    applyContent: '',
  };

  const defaultBusData = {
    personalDetails: defaultPersonalDetails,
    requestSubject: defaultRequestSubject,
    busAndOther: defaultBusAndOther,
    documentsList: [],
  };

  const defaultTaxiData = {
    personalDetails: defaultPersonalDetails,
    requestSubject: defaultRequestSubject,
    taxi: defaultTaxi,
    documentsList: [],
  };

  const defaultTrain = {
    trainType: '1',
    eventDate: '',
    eventHour: '',
    startStation: { dataCode: '', dataText: '' },
    destinationStation: { dataCode: '', dataText: '' },
    number: '',
    applyContent: '',
  };

  const defaultTrainData = {
    personalDetails: defaultPersonalDetails,
    requestSubject: defaultRequestSubject,
    train: defaultTrain,
    documentsList: [],
  };

  const testData = {
    no_stop: {
      personalDetails: {
        firstName: 'שם פרטי',
        lastName: 'משפחה',
        iDNum: '212121214',
        mobile: '054-2234567',
        phone: '',
        email: 'email@gmail.com',
      },
      requestSubject: {
        applySubject: {
          dataCode: '0',
          dataText: 'אוטובוס',
        },
        applyType: {
          dataCode: '3',
          dataText: 'אי עצירה בתחנה',
        },
      },
      busAndOther: {
        ravKav: true,
        ravKavNumber: '',
        reportdate: '',
        reportTime: '',
        addingFrequencyReason: [],
        operator: {
          dataCode: 3,
          dataText: 'אגד',
        },
        addOrRemoveStation: '2',
        driverName: 'שם נהג',
        licenseNum: '11111111',
        eventDate: '28/10/2025',
        eventHour: '08:00',
        fromHour: '07:00',
        toHour: '09:00',
        fillByMakatOrAddress: '2',
        makatStation: '',
        lineNumberText: '1',
        lineNumberFromList: {
          dataText: '',
        },
        direction: {
          dataCode: 3,
          dataText: 'כרמיאל-כרמיאל',
        },
        raisingStation: {
          dataCode: 53664,
          dataText: 'אנפה/משעול אנפה',
        },
        applyContent: 'תוכן הפנייה',
        busDirectionFrom: 'נעסתי מ',
        busDirectionTo: 'אל',
        raisingStationCity: {
          dataText: '',
        },
        destinationStationCity: {
          dataText: '',
        },
        raisingStationAddress: '',
        cityId: '',
        cityName: '',
        raisingStationCityCode: '',
        raisingStationCityName: '',
        destinationStationCityCode: '',
        destinationStationCityText: '',
        directionCode: '',
        stationName: '',
        lineCode: '',
      },
      documentsList: [],
    },
    delay: {
      personalDetails: {
        firstName: 'שם פרטי',
        lastName: 'משפחה',
        iDNum: '212121214',
        mobile: '054-2234567',
        phone: '',
        email: 'email@gmail.com',
      },
      requestSubject: {
        applySubject: {
          dataCode: '0',
          dataText: 'אוטובוס',
        },
        applyType: {
          dataCode: '4',
          dataText: 'איחור',
        },
      },
      busAndOther: {
        ravKav: true,
        ravKavNumber: '',
        reportdate: '',
        reportTime: '',
        addingFrequencyReason: [],
        operator: {
          dataCode: 3,
          dataText: 'אגד',
        },
        addOrRemoveStation: '2',
        eventDate: '28/10/2025',
        eventHour: '08:00',
        fromHour: '07:00',
        toHour: '09:00',
        fillByMakatOrAddress: '2',
        makatStation: '',
        lineNumberText: '1',
        lineNumberFromList: {
          dataText: '',
        },
        direction: {
          dataCode: 3,
          dataText: 'כרמיאל-כרמיאל',
        },
        raisingStation: {
          dataCode: 58477,
          dataText: 'אנפה/סמטת טווס',
        },
        applyContent: 'תוכן פנייה',
        busDirectionFrom: 'מה',
        busDirectionTo: 'אל',
        raisingStationCity: {
          dataText: '',
        },
        destinationStationCity: {
          dataText: '',
        },
        raisingStationAddress: '',
        cityId: '',
        cityName: '',
        raisingStationCityCode: '',
        raisingStationCityName: '',
        destinationStationCityCode: '',
        destinationStationCityText: '',
        directionCode: '',
        stationName: '',
        lineCode: '',
      },
      documentsList: [],
    },
    taxi: {
      personalDetails: {
        firstName: 'firstName',
        lastName: 'lastName',
        iDNum: '212121214',
        mobile: '054-2234567',
        phone: '',
        email: 'email@gmail.com',
      },
      requestSubject: {
        applySubject: {
          dataCode: '6',
          dataText: 'מוניות',
        },
        applyType: {
          dataCode: '19',
          dataText: 'התנהגות נהג',
        },
      },
      taxi: {
        eventDetails: '1',
        invoice: '1',
        evidence: '1',
        otherFactors: '1',
        taxiType: '2',
        licenseNum: '321132132',
        cap: '231321211',
        eventDate: '23/10/2025',
        eventHour: '03:33',
        eventLocation: 'תל',
        firstDeclaration: true,
        secondDeclaration: true,
        applyContent: '',
      },
      documentsList: [],
    },
    train: {
      personalDetails: {
        firstName: 'שם פרטי',
        lastName: 'משפחה',
        iDNum: '123456782',
        mobile: '054-2234567',
        phone: '',
        email: 'email@gmail.com',
      },
      requestSubject: {
        applySubject: {
          dataCode: '1',
          dataText: 'רכבת',
        },
        applyType: {
          dataCode: '20',
          dataText: 'איחור',
        },
      },
      train: {
        trainType: '1',
        eventDate: '28/10/2025',
        eventHour: '08:00',
        startStation: {
          dataCode: '',
          dataText: 'תל אביב',
        },
        destinationStation: {
          dataCode: '',
          dataText: 'ירושלים',
        },
        number: '123',
        applyContent: 'תוכן פנייה',
      },
      documentsList: [],
    },
  };

  Object.keys(testData).forEach((complaintType) => {
    it(`should generate correct XML for ${complaintType} complaint type`, () => {
      let baseData = defaultBusData;
      if (complaintType === 'train') baseData = defaultTrainData;
      else if (complaintType === 'taxi') baseData = defaultTaxiData;

      const inputData = { ...baseData, ...testData[complaintType] };

      // Generate XML using templateBuilder
      const generatedXml = templateBuilder({ debug: true, data: inputData });

      // Basic XML structure validation
      expect(generatedXml).to.include('<form>');
      expect(generatedXml).to.include('</form>');
      expect(generatedXml).to.include('<dataModelSaver>');
      expect(generatedXml).to.include('</dataModelSaver>');
      expect(generatedXml).to.include('<?xml version="1.0" encoding="utf-8"?>');
      expect(generatedXml).to.include('<root');
      expect(generatedXml).to.include('</root>');

      // Extract and validate dataModelSaver JSON content
      const dataModelSaverMatch = generatedXml.match(/<dataModelSaver>(?<content>[\s\S]*?)<\/dataModelSaver>/u);
      expect(dataModelSaverMatch).to.not.be.null;

      const dataModelSaverJson = dataModelSaverMatch.groups.content.trim();
      expect(dataModelSaverJson).to.not.be.empty;

      // Parse and validate the JSON structure
      let parsedDataModelSaver;
      expect(() => {
        parsedDataModelSaver = JSON.parse(dataModelSaverJson);
      }).to.not.throw();

      // Validate dataModelSaver contains expected top-level properties
      expect(parsedDataModelSaver).to.have.property('contactType');
      expect(parsedDataModelSaver).to.have.property('personalDetails');
      expect(parsedDataModelSaver).to.have.property('requestSubject');
      expect(parsedDataModelSaver).to.have.property('requestDetails');
      expect(parsedDataModelSaver).to.have.property('documentAttachment');
      expect(parsedDataModelSaver).to.have.property('followStatus');
      expect(parsedDataModelSaver).to.have.property('containersViewModel');
      expect(parsedDataModelSaver).to.have.property('formInformation');

      // Validate personalDetails structure and values
      expect(parsedDataModelSaver.personalDetails).to.have.property('firstName', inputData.personalDetails.firstName);
      expect(parsedDataModelSaver.personalDetails).to.have.property('lastName', inputData.personalDetails.lastName);
      expect(parsedDataModelSaver.personalDetails).to.have.property('iDNum', inputData.personalDetails.iDNum);
      expect(parsedDataModelSaver.personalDetails).to.have.property('email', inputData.personalDetails.email);
      expect(parsedDataModelSaver.personalDetails).to.have.property('mobile', inputData.personalDetails.mobile);

      // Validate requestSubject structure and values
      // Note: fillTemplate only keeps properties that exist in the template
      expect(parsedDataModelSaver.requestSubject).to.have.property('applySubject');
      expect(parsedDataModelSaver.requestSubject.applySubject).to.have.property('dataText', inputData.requestSubject.applySubject.dataText);
      expect(parsedDataModelSaver.requestSubject.applySubject).to.have.property('dataCode', inputData.requestSubject.applySubject.dataCode);
      expect(parsedDataModelSaver.requestSubject).to.have.property('applyType');
      expect(parsedDataModelSaver.requestSubject.applyType).to.have.property('dataText', inputData.requestSubject.applyType.dataText);
      expect(parsedDataModelSaver.requestSubject.applyType).to.have.property('dataCode', inputData.requestSubject.applyType.dataCode);

      // Validate requestDetails structure
      expect(parsedDataModelSaver.requestDetails).to.have.property('name', 'requestDetails');
      expect(parsedDataModelSaver.requestDetails).to.have.property('state');
      expect(parsedDataModelSaver.requestDetails).to.have.property('busAndOther');
      expect(parsedDataModelSaver.requestDetails).to.have.property('taxi');
      expect(parsedDataModelSaver.requestDetails).to.have.property('train');

      // Validate complaint-type specific data in requestDetails
      if (complaintType === 'taxi') {
        // Only taxiType exists in the template, other properties are not preserved by fillTemplate
        expect(parsedDataModelSaver.requestDetails.taxi).to.have.property('taxiType', inputData.taxi.taxiType);
      } else if (complaintType === 'train') {
        expect(parsedDataModelSaver.requestDetails.train).to.have.property('trainType', inputData.train.trainType);
        expect(parsedDataModelSaver.requestDetails.train).to.have.property('eventDate', inputData.train.eventDate);
        expect(parsedDataModelSaver.requestDetails.train).to.have.property('eventHour', inputData.train.eventHour);
        expect(parsedDataModelSaver.requestDetails.train).to.have.property('startStation');
        expect(parsedDataModelSaver.requestDetails.train.startStation).to.have.property('dataText', inputData.train.startStation.dataText);
        expect(parsedDataModelSaver.requestDetails.train).to.have.property('destinationStation');
        expect(parsedDataModelSaver.requestDetails.train.destinationStation).to.have.property(
          'dataText',
          inputData.train.destinationStation.dataText,
        );
        expect(parsedDataModelSaver.requestDetails.train).to.have.property('number', inputData.train.number);
        expect(parsedDataModelSaver.requestDetails.train).to.have.property('applyContent', inputData.train.applyContent);
      } else {
        // For bus complaints (no_stop, delay)
        expect(parsedDataModelSaver.requestDetails.busAndOther).to.have.property('operator');
        expect(parsedDataModelSaver.requestDetails.busAndOther.operator).to.have.property('dataText', inputData.busAndOther.operator.dataText);
        expect(parsedDataModelSaver.requestDetails.busAndOther).to.have.property('applyContent', inputData.busAndOther.applyContent);
      }

      // Validate formInformation
      expect(parsedDataModelSaver.formInformation).to.have.property('referenceNumber');
      expect(parsedDataModelSaver.formInformation).to.have.property('stageStatus');
      expect(parsedDataModelSaver.formInformation).to.have.property('loadingDate');
      expect(parsedDataModelSaver.formInformation).to.have.property('isMobile', false);

      // Personal details validation
      expect(generatedXml).to.include(`<FirstName>${inputData.personalDetails.firstName}</FirstName>`);
      expect(generatedXml).to.include(`<LastName>${inputData.personalDetails.lastName}</LastName>`);
      expect(generatedXml).to.include(`<IDNum>${inputData.personalDetails.iDNum}</IDNum>`);
      expect(generatedXml).to.include(`<Email>${inputData.personalDetails.email}</Email>`);
      expect(generatedXml).to.include(`<Mobile>${inputData.personalDetails.mobile}</Mobile>`);

      // Complaint type specific validations
      if (complaintType === 'no_stop') {
        // Bus-specific validations for no_stop complaint
        expect(generatedXml).to.include(
          `<Operator text="${inputData.busAndOther.operator.dataText}">${inputData.busAndOther.operator.dataCode}</Operator>`,
        );
        expect(generatedXml).to.include(`<BusDriverName>${inputData.busAndOther.driverName}</BusDriverName>`);
        expect(generatedXml).to.include(`<BusLicenseNum>${inputData.busAndOther.licenseNum}</BusLicenseNum>`);
        expect(generatedXml).to.include(`<BusEventDate>${inputData.busAndOther.eventDate}</BusEventDate>`);
        expect(generatedXml).to.include(`<BusEventHour>${inputData.busAndOther.eventHour}</BusEventHour>`);
        expect(generatedXml).to.include(`<from>${inputData.busAndOther.fromHour}</from>`);
        expect(generatedXml).to.include(`<by>${inputData.busAndOther.toHour}</by>`);
        expect(generatedXml).to.include(`<CaseEssence>${inputData.busAndOther.applyContent}</CaseEssence>`);
        expect(generatedXml).to.include(`<LineNumberBoarding>${inputData.busAndOther.lineNumberText}</LineNumberBoarding>`);
      } else if (complaintType === 'delay') {
        // Bus-specific validations for delay complaint
        expect(generatedXml).to.include(
          `<Operator text="${inputData.busAndOther.operator.dataText}">${inputData.busAndOther.operator.dataCode}</Operator>`,
        );
        expect(generatedXml).to.include('<BusDriverName xsi:nil="true"></BusDriverName>');
        expect(generatedXml).to.include('<BusLicenseNum xsi:nil="true"></BusLicenseNum>');
        expect(generatedXml).to.include(`<BusEventDate>${inputData.busAndOther.eventDate}</BusEventDate>`);
        expect(generatedXml).to.include(`<BusEventHour>${inputData.busAndOther.eventHour}</BusEventHour>`);
        expect(generatedXml).to.include(`<from>${inputData.busAndOther.fromHour}</from>`);
        expect(generatedXml).to.include(`<by>${inputData.busAndOther.toHour}</by>`);
        expect(generatedXml).to.include(`<CaseEssence>${inputData.busAndOther.applyContent}</CaseEssence>`);
        expect(generatedXml).to.include(`<LineNumberBoarding>${inputData.busAndOther.lineNumberText}</LineNumberBoarding>`);
      } else if (complaintType === 'taxi') {
        // Taxi-specific validations
        expect(generatedXml).to.include(`<ETaxiType>${inputData.taxi.taxiType}</ETaxiType>`);
        expect(generatedXml).to.include('<TaxiEventLocation>תל</TaxiEventLocation>');

        expect(generatedXml).to.include('<DrivingLicense2>321132132</DrivingLicense2>');
        expect(generatedXml).to.include('<TaxiCap>231321211</TaxiCap>');
      } else if (complaintType === 'train') {
        // Train-specific validations
        expect(generatedXml).to.include(`<TrainType>${inputData.train.trainType}</TrainType>`);
        expect(generatedXml).to.include(`<EventDate2>${inputData.train.eventDate}</EventDate2>`);
        expect(generatedXml).to.include(`<EventHour2>${inputData.train.eventHour}</EventHour2>`);
        expect(generatedXml).to.include(`<StartStation text="${inputData.train.startStation.dataText}"></StartStation>`);
        expect(generatedXml).to.include(`<DestStation text="${inputData.train.destinationStation.dataText}"></DestStation>`);
        expect(generatedXml).to.include(`<TrainNumber>${inputData.train.number}</TrainNumber>`);
        expect(generatedXml).to.include(`<ApplyContent3>${inputData.train.applyContent}</ApplyContent3>`);
      }

      // Common validations for all complaint types
      expect(generatedXml).to.include('<FinanceRavKav>true</FinanceRavKav>');
      expect(generatedXml).to.include('<FinanceOther>false</FinanceOther>');
      expect(generatedXml).to.include('<SingleTrip>false</SingleTrip>');
      expect(generatedXml).to.include('<LoadTopics>false</LoadTopics>');
      expect(generatedXml).to.include('<LongWaiting>false</LongWaiting>');
      expect(generatedXml).to.include('<ExtensionHours>false</ExtensionHours>');
      if (complaintType === 'taxi') {
        expect(generatedXml).to.include('<FirstDeclaration>true</FirstDeclaration>');
        expect(generatedXml).to.include('<SecondDeclaration>true</SecondDeclaration>');
      } else {
        expect(generatedXml).to.include('<FirstDeclaration>false</FirstDeclaration>');
        expect(generatedXml).to.include('<SecondDeclaration>false</SecondDeclaration>');
      }
      expect(generatedXml).to.include('<Testimony>false</Testimony>');
      expect(generatedXml).to.include('<Courttestimony>false</Courttestimony>');
    });
  });
});

describe('idValidator', () => {
  it('should validate correct Israeli ID numbers', () => {
    expect(idValidator('123456782')).to.be.true;
    expect(idValidator('000000018')).to.be.true;
    expect(idValidator('212121214')).to.be.true;
  });

  it('should return false for invalid ID numbers', () => {
    expect(idValidator('123456789')).to.be.false;
    expect(idValidator('12345678')).to.be.false;
    expect(idValidator('1234567890')).to.be.false;
    expect(idValidator('invalid')).to.be.false;
    expect(idValidator('')).to.be.false;
    expect(idValidator(null)).to.be.false;
    expect(idValidator('000000000')).to.be.false;
  });
});

describe('mobileValidator', () => {
  it('should validate and format correct mobile numbers', () => {
    expect(mobileValidator('0523234567')).to.equal('052-3234567');
    expect(mobileValidator('052-3234567')).to.equal('052-3234567');
    expect(mobileValidator('0502345678')).to.equal('050-2345678');
    expect(mobileValidator('054-2234567')).to.equal('054-2234567');
  });

  it('should return false for invalid mobile numbers', () => {
    expect(mobileValidator('0521234567')).to.be.false;
    expect(mobileValidator('0511234567')).to.be.false;
    expect(mobileValidator('0501234567')).to.be.false;
    expect(mobileValidator('invalid')).to.be.false;
    expect(mobileValidator('')).to.be.false;
    expect(mobileValidator(null)).to.be.false;
    expect(mobileValidator('052123456')).to.be.false;
    expect(mobileValidator('05212345678')).to.be.false;
  });
});
