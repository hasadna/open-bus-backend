import { idValidator, mobileValidator } from './complaintsValidator.js';

const defualt = {
  contactType: {
    selectContactType: '1',
    isChosenType: true,
  },
  personalDetails: {
    firstName: '',
    lastName: '',
    iDNum: '',
    mobile: '',
    phone: '',
    contactOptions: '1',
    fax: '',
    email: '',
    city: { dataCode: -1, dataText: '' },
    street: '',
    houseNumber: '',
    appartment: '',
    postBox: '',
    zipCode: '',
    name: 'personalDetails',
    state: 'completed',
    next: '',
    prev: '',
    isClosed: true,
  },
  requestSubject: {
    applySubject: { dataCode: '', dataText: '' },
    applyType: { dataCode: '', dataText: '' },
    name: 'requestSubject',
    state: 'completed',
    next: '',
    prev: '',
    isClosed: true,
  },
  requestDetails: {
    taxi: { taxiType: '2' },
    busAndOther: {
      ravKav: true,
      ravKavNumber: '',
      reportdate: '',
      reportTime: '',
      addingFrequencyReason: [],
      operator: { dataCode: '', dataText: '' },
      addOrRemoveStation: '2',
      driverName: '',
      licenseNum: '',
      eventDate: '',
      eventHour: '',
      fromHour: '',
      toHour: '',
      fillByMakatOrAddress: '2',
      makatStation: '',
      lineNumberText: '',
      lineNumberFromList: { dataText: '' },
      direction: { dataText: '' },
      raisingStation: { dataText: '' },
      applyContent: '',
      busDirectionFrom: '',
      busDirectionTo: '',
      raisingStationCity: { dataText: '' },
      destinationStationCity: { dataText: '' },
      raisingStationAddress: '',
      cityId: '',
      cityName: '',
      originCityCode: '',
      originCityName: '',
      destinationCityCode: '',
      destinationCityText: '',
      directionCode: '',
      stationName: '',
      lineCode: '',
      firstDeclaration: false,
      secondDeclaration: false,
    },
    train: {
      trainType: '1',
      eventDate: '',
      eventHour: '',
      startStation: { dataText: '' },
      destinationStation: { dataText: '' },
      number: '',
      applyContent: '',
    },
    requestSubjectCode: '0',
    requestTypeCode: '0',
    title: '',
    name: 'requestDetails',
    state: 'completed',
    next: '',
    prev: '',
    isClosed: true,
  },
  documentAttachment: {
    documentsList: [{ attacmentName: '' }],
    name: 'documentAttachment',
    state: 'completed',
    next: '',
    prev: '',
    isClosed: false,
  },
  containersViewModel: {
    showPrintButton: true,
    currentContainerName: 'documentAttachment',
    validatedStatus: true,
  },
  formInformation: {
    isFormSent: false,
    referenceNumber: '',
    stageStatus: 'UserToOffice',
    loadingDate: '',
    firstLoadingDate: '',
    isMobile: false,
    language: 'hebrew',
  },
};
Object.freeze(defualt);

function formatDateTime(dateTime) {
  return new Date(dateTime).toLocaleDateString('en-GB');
}

function fillTemplate(template, data = {}) {
  if (Array.isArray(template)) {
    return template.map((item, idx) => fillTemplate(item, (data && data[idx]) || {}));
  }
  if (typeof template === 'object' && template !== null) {
    const result = {};

    for (const key of Object.keys(template)) {
      if (typeof template[key] === 'object' && template[key] !== null) {
        result[key] = fillTemplate(template[key], data && Object.hasOwn(data, key) ? data[key] : undefined);
      } else {
        result[key] = data && Object.hasOwn(data, key) ? data[key] : template[key];
      }
    }

    if (data && typeof data === 'object') {
      for (const key of Object.keys(data)) {
        if (!Object.hasOwn(result, key)) {
          result[key] = data[key];
        }
      }
    }

    return result;
  }
  return data === undefined ? template : data;
}

/**
 * Build an XML element.
 *
 * @param {string} tagName - Name of the XML tag.
 * @param {string|undefined} value - Optional string value.
 * @param {Object.<string, string>} attributes - XML attributes.
 * @returns {string} XML string.
 */
export function buildXmlElement(tagName, value = undefined) {
  const attrs = value === null || value === undefined || value === '' ? ' xsi:nil="true" ' : '';

  const val = value === null || value === undefined ? '' : value;
  return `<${tagName}${attrs}>${val}</${tagName}>`;
}

export function templateBuilder(body, ref) {
  if (!body.data) {
    throw new Error('Input must have data property');
  }

  if (!idValidator(body.data.personalDetails.iDNum)) {
    throw new Error('Invalid Id Number');
  }

  const validatedMobile = mobileValidator(body.data.personalDetails.mobile);
  if (!validatedMobile) {
    throw new Error('Invalid Mobile Number');
  }
  body.data.personalDetails.mobile = validatedMobile;

  const fillData = fillTemplate(defualt, body.data);
  fillData.formInformation.loadingDate = new Date().toLocaleDateString('en-us');
  fillData.formInformation.referenceNumber = ref;
  fillData.requestDetails.title = fillData.title;
  delete fillData.title;

  // Fill busAndOther if present
  if (body.data.busAndOther) {
    fillData.requestDetails.busAndOther = fillTemplate(defualt.requestDetails.busAndOther, body.data.busAndOther);
    fillData.requestDetails.busAndOther.addFrequencyOverCrowd = fillData.requestDetails.busAndOther.addingFrequencyReason.includes('LoadTopics');
    fillData.requestDetails.busAndOther.addFrequencyLongWait = fillData.requestDetails.busAndOther.addingFrequencyReason.includes('LongWaiting');
    fillData.requestDetails.busAndOther.addFrequencyExtendTime = fillData.requestDetails.busAndOther.addingFrequencyReason.includes('ExtensionHours');
    delete fillData.busAndOther;
    Object.keys(fillData.requestDetails.busAndOther).forEach((key) => {
      if (fillData.requestDetails.busAndOther[key] === false) {
        delete fillData.requestDetails.busAndOther[key];
      }
      if (typeof fillData.requestDetails.busAndOther[key]?.dataCode === 'string' && fillData.requestDetails.busAndOther[key]?.dataCode !== '') {
        fillData.requestDetails.busAndOther[key].dataCode = Number(fillData.requestDetails.busAndOther[key].dataCode);
      }
    });
  }
  // Fill Train if present
  if (body.data.train) {
    fillData.requestDetails.train = fillTemplate(defualt.requestDetails.train, body.data.train);
    delete fillData.train;
  }

  // Fill taxi if present
  if (body.data.taxi) {
    fillData.requestDetails.taxi = fillTemplate(defualt.requestDetails.taxi, body.data.taxi);
    delete fillData.taxi;
  }

  // Fill documentsList
  if (body.data.documentsList) {
    fillData.documentAttachment.documentsList = body.data.documentsList.map((doc) => ({ attacmentName: doc.attachmentName }));
    delete fillData.documentsList;
  }

  if (fillData.requestDetails.train?.eventDat) fillData.requestDetails.train.eventDate = formatDateTime(fillData.requestDetails.train.eventDate);
  if (fillData.requestDetails.taxi?.eventDate) fillData.requestDetails.taxi.eventDate = formatDateTime(fillData.requestDetails.taxi.eventDate);
  if (fillData.requestDetails.busAndOther?.eventDate)
    fillData.requestDetails.busAndOther.eventDate = formatDateTime(fillData.requestDetails.busAndOther.eventDate);
  if (fillData.requestDetails.busAndOther.reportdate)
    fillData.requestDetails.busAndOther.reportdate = formatDateTime(fillData.requestDetails.busAndOther.reportdate);

  const dataModelSaver = JSON.stringify(fillData).replace(/"/gu, '&quot;');

  return `<?xml version='1.0' encoding='UTF-8'?>
<root xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" formId="PniotMot@mot.gov.il" formVersion="3.0.5" formCompileTime="" xmlns="http://AGForms/PniotMot@mot.gov.il" >
<form>
<UserUImode>AGFrom2Html</UserUImode>
<BTSFormID>PniotMot@mot.gov.il</BTSFormID>
<BTSFormDesc>פניות הציבור משרד התחבורה</BTSFormDesc>
<BTSProcessID xsi:nil="true" ></BTSProcessID>
${buildXmlElement('ReferenceNumber', ref)}
<StageStatus>UserToOffice</StageStatus>
<dataModelSaver>${dataModelSaver}</dataModelSaver>
<isMobile>false</isMobile>
<DeviceType>PC</DeviceType>
<FirstLoadingDate xsi:nil="true" ></FirstLoadingDate>
${buildXmlElement('Date', fillData.formInformation.loadingDate)}
${buildXmlElement('SelectContactType', fillData.contactType.selectContactType)}
${buildXmlElement('FirstName', fillData.personalDetails.firstName)}
${buildXmlElement('LastName', fillData.personalDetails.lastName)}
${buildXmlElement('IDNum', fillData.personalDetails.iDNum)}
${buildXmlElement('Mobile', fillData.personalDetails.mobile)}
<Phone xsi:nil="true" ></Phone>
<ContactDetails>1</ContactDetails>
${buildXmlElement('Email', fillData.personalDetails.email)}
<fax xsi:nil="true" ></fax>
<Settlement xsi:nil="true" ></Settlement>
<street xsi:nil="true" ></street>
<HouseNumber xsi:nil="true" ></HouseNumber>
<Appartment xsi:nil="true" ></Appartment>
<POB xsi:nil="true" ></POB>
<ZipCode xsi:nil="true" ></ZipCode>
${buildXmlElement('ApplySubject', fillData.requestSubject.applySubject?.dataText)}
${buildXmlElement('TypeReq', fillData.requestSubject.applyType?.dataText)}
${buildXmlElement('TrainType', fillData.requestDetails.train?.trainType)}
${buildXmlElement('EventDate2', fillData.requestDetails.train?.eventDate)}
${buildXmlElement('EventHour2', fillData.requestDetails.train?.eventHour)}
${buildXmlElement('StartStation', fillData.requestDetails.train?.startStation?.dataText)}
${buildXmlElement('DestStation', fillData.requestDetails.train?.destinationStation?.dataText)}
${buildXmlElement('TrainNumber', fillData.requestDetails.train?.number)}
${buildXmlElement('ApplyContent3', fillData.requestDetails.train?.applyContent)}
${buildXmlElement('FirstDeclaration', fillData.requestDetails.busAndOther?.firstDeclaration || fillData.requestDetails.taxi?.firstDeclaration || false)}
${buildXmlElement('SecondDeclaration', fillData.requestDetails.busAndOther?.secondDeclaration || fillData.requestDetails.taxi?.secondDeclaration || false)}
${buildXmlElement('EventDetails', fillData.requestDetails.taxi?.eventDetails)}
${buildXmlElement('Invoice', fillData.requestDetails.taxi?.invoice)}
${buildXmlElement('Evidence', fillData.requestDetails.taxi?.evidence)}
${buildXmlElement('OtherFactors', fillData.requestDetails.taxi?.otherFactors)}
${buildXmlElement('ETaxiType', fillData.requestDetails.taxi?.taxiType)}
${buildXmlElement('DrivingLicense2', fillData.requestDetails.taxi?.licenseNum)}
${buildXmlElement('TaxiCap', fillData.requestDetails.taxi?.cap)}
${buildXmlElement('TaxiDriverName', fillData.requestDetails.taxi?.driverName)}
${buildXmlElement('TaxiEventDate', fillData.requestDetails.taxi?.eventDate)}
${buildXmlElement('TaxiEventHour', fillData.requestDetails.taxi?.eventHour)}
${buildXmlElement('TaxiEventLocation', fillData.requestDetails.taxi?.eventLocation)}
<ApplyContent xsi:nil="true" ></ApplyContent>
${buildXmlElement('FinanceRavKav', fillData.requestDetails.busAndOther?.ravKav)}
${buildXmlElement('FinanceRavKavNumber', fillData.requestDetails.busAndOther?.ravKavNumber)}
<FinanceOther>false</FinanceOther>
${buildXmlElement('SingleTrip', fillData.requestDetails.busAndOther?.singleTrip || false)}
${buildXmlElement('LoadTopics', fillData.requestDetails.busAndOther?.addFrequencyOverCrowd || false)}
${buildXmlElement('LongWaiting', fillData.requestDetails.busAndOther?.addFrequencyLongWait || false)}
${buildXmlElement('ExtensionHours', fillData.requestDetails.busAndOther?.addFrequencyExtendTime || false)}
${buildXmlElement('Operator', fillData.requestDetails.busAndOther?.operator?.dataText)}
${buildXmlElement('BusDriverName', fillData.requestDetails.busAndOther?.driverName)}
${buildXmlElement('BusLicenseNum', fillData.requestDetails.busAndOther?.licenseNum)}
${buildXmlElement('BusEventDate', fillData.requestDetails.busAndOther?.eventDate)}
${buildXmlElement('BusEventHour', fillData.requestDetails.busAndOther?.eventHour)}
${buildXmlElement('from', fillData.requestDetails.busAndOther?.fromHour)}
${buildXmlElement('by', fillData.requestDetails.busAndOther?.toHour)}
${buildXmlElement('Reportdate', fillData.requestDetails.busAndOther?.reportdate)}
${buildXmlElement('ReportTime', fillData.requestDetails.busAndOther?.reportTime)}
${buildXmlElement('Stationupdate', fillData.requestDetails.busAndOther?.addOrRemoveStation)}
${buildXmlElement('NumStation', fillData.requestDetails.busAndOther?.addOrRemoveStation)}
${buildXmlElement('LineNumberBoarding', fillData.requestDetails.busAndOther?.lineNumberText)}
${buildXmlElement('Direction', fillData.requestDetails.busAndOther?.direction?.dataText)}
${buildXmlElement('BusStationBoard', fillData.requestDetails.busAndOther?.raisingStation?.dataText)}
${buildXmlElement('BoardingSettlement', fillData.requestDetails.busAndOther?.raisingStationCity?.dataText)}
${buildXmlElement('DropStaionAppeal', fillData.requestDetails.busAndOther?.destinationStationCity?.dataText)}
${buildXmlElement('Risestationaddress', fillData.requestDetails.busAndOther?.raisingStationAddress)}
${buildXmlElement('MakatStation', fillData.requestDetails.busAndOther?.makatStation)}
${buildXmlElement('LineNumber', fillData.requestDetails.busAndOther?.lineNumberText)}
${buildXmlElement('BusDirectionFrom', fillData.requestDetails.busAndOther?.busDirectionFrom)}
${buildXmlElement('BusDirectionTo', fillData.requestDetails.busAndOther?.busDirectionTo)}
${buildXmlElement('Testimony', fillData.requestDetails.busAndOther?.firstDeclaration)}
${buildXmlElement('Courttestimony', fillData.requestDetails.busAndOther?.secondDeclaration)}
${buildXmlElement('CaseEssence', fillData.requestDetails.busAndOther?.applyContent)}
${buildXmlElement('OriginCityCode', fillData.requestDetails.busAndOther?.originCityCode)}
${buildXmlElement('OriginCityName', fillData.requestDetails.busAndOther?.originCityName)}
${buildXmlElement('LineCode', fillData.requestDetails.busAndOther?.lineCode)}
${buildXmlElement('CityId', fillData.requestDetails.busAndOther?.cityId)}
${buildXmlElement('CityName', fillData.requestDetails.busAndOther?.cityName)}
${buildXmlElement('StationName', fillData.requestDetails.busAndOther?.stationName)}
${buildXmlElement('DirectionCode', fillData.requestDetails.busAndOther?.directionCode)}
${buildXmlElement('DestinationCityCode', fillData.requestDetails.busAndOther?.destinationCityCode)}
${buildXmlElement('DestinationCityText', fillData.requestDetails.busAndOther?.destinationCityText)}
${buildXmlElement('Title', fillData.requestDetails?.title)}
<RequestSubjectCode>0</RequestSubjectCode>
<RequestTypeCode>0</RequestTypeCode>
<Attacment_Doc>
<AttachDocument  xsi:nil="true" fileName="" ></AttachDocument>
</Attacment_Doc>
<ContactID>
<ticketNumber xsi:nil="true" ></ticketNumber>
</ContactID>
</form>
</root>`;
}
