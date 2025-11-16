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
      startStation: { dataCode: '', dataText: '' },
      destinationStation: { dataCode: '', dataText: '' },
      number: '',
      applyContent: '',
    },
    requestSubjectCode: '',
    requestTypeCode: '',
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
    isClosed: true,
  },
  followStatus: {
    contactIdList: [{ ticketNumber: '' }],
    contactIdResultList: [],
    name: 'followStatus',
    state: 'notValidated',
    next: '',
    prev: '',
    isClosed: true,
  },
  containersViewModel: {
    showPrintButton: true,
    isTabsMode: true,
    validatedStatus: true,
  },
  formInformation: {
    referenceNumber: '',
    stageStatus: 'UserToOffice',
    loadingDate: '',
    firstLoadingDate: '',
    isMobile: false,
    language: 'hebrew',
  },
};
Object.freeze(defualt);

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
export function buildXmlElement(tagName, value = undefined, attributes = {}) {
  if (value === null || value === undefined || (value === '' && Object.keys(attributes).length === 0)) attributes['xsi:nil'] = 'true';

  const attrs = Object.entries(attributes)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join('');

  const val = value === null || value === undefined ? '' : value;
  return `<${tagName}${attrs}>${val}</${tagName}>`;
}

export function templateBuilder(body) {
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

  // Fill busAndOther if present
  if (body.data.busAndOther) {
    fillData.requestDetails.busAndOther = fillTemplate(defualt.requestDetails.busAndOther, body.data.busAndOther);
    fillData.requestDetails.busAndOther.addFrequencyOverCrowd = fillData.requestDetails.busAndOther.addingFrequencyReason.includes('LoadTopics');
    fillData.requestDetails.busAndOther.addFrequencyLongWait = fillData.requestDetails.busAndOther.addingFrequencyReason.includes('LongWaiting');
    fillData.requestDetails.busAndOther.addFrequencyExtendTime = fillData.requestDetails.busAndOther.addingFrequencyReason.includes('ExtensionHours');
  }
  // Fill Train if present
  if (body.data.train) {
    fillData.requestDetails.train = fillTemplate(defualt.requestDetails.train, body.data.train);
  }

  // Fill taxi if present
  if (body.data.taxi) {
    fillData.requestDetails.taxi = fillTemplate(defualt.requestDetails.taxi, body.data.taxi);
  }

  // Fill documentsList
  if (body.data.documentsList) {
    fillData.documentAttachment.documentsList = body.data.documentsList.map((doc) => ({ attacmentName: doc.attachmentName }));
  }

  const dataModelSaver = JSON.stringify(fillData);

  return `<?xml version="1.0" encoding="utf-8"?>
<root xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" formId="PniotMot@mot.gov.il" formVersion="3.0.5" formCompileTime="22/02/2024" xmlns="http://AGForms/PniotMot@mot.gov.il">
  <form>
		<UserUImode>AGFrom2Html</UserUImode>
		<BTSFormID xsi:nil="true"></BTSFormID>
		<BTSFormDesc xsi:nil="true"></BTSFormDesc>
		<BTSProcessID xsi:nil="true"></BTSProcessID>
    ${buildXmlElement('ReferenceNumber', body.ReferenceNumber || '')}
		<StageStatus>UserToOffice</StageStatus>
    <dataModelSaver><![CDATA[${dataModelSaver}]]></dataModelSaver>
		<isMobile>false</isMobile>
		<DeviceType xsi:nil="true"></DeviceType>
		<FirstLoadingDate xsi:nil="true"></FirstLoadingDate>
    ${buildXmlElement('Date', body.Date || '')}
    ${buildXmlElement('SelectContactType', fillData.contactType.selectContactType)}
    ${buildXmlElement('FirstName', fillData.personalDetails.firstName)}
    ${buildXmlElement('LastName', fillData.personalDetails.lastName)}
    ${buildXmlElement('IDNum', fillData.personalDetails.iDNum)}
    ${buildXmlElement('Mobile', fillData.personalDetails.mobile)}
		<Phone xsi:nil="true"></Phone>
		<ContactDetails>1</ContactDetails>
    ${buildXmlElement('Email', fillData.personalDetails.email)}
		<fax xsi:nil="true"></fax>
		<Settlement text="">-1</Settlement>
		<street xsi:nil="true"></street>
		<HouseNumber xsi:nil="true"></HouseNumber>
		<Appartment xsi:nil="true"></Appartment>
		<POB xsi:nil="true"></POB>
		<ZipCode xsi:nil="true"></ZipCode>
    ${buildXmlElement('ApplySubject', fillData.requestSubject.applySubject.dataCode, { text: fillData.requestSubject.applySubject.dataText })}
    ${buildXmlElement('TypeReq', fillData.requestSubject.applyType.dataCode, { text: fillData.requestSubject.applyType.dataText })}
    ${buildXmlElement('TrainType', fillData.requestDetails.train?.trainType)}
    ${buildXmlElement('EventDate2', fillData.requestDetails.train?.eventDate)}
    ${buildXmlElement('EventHour2', fillData.requestDetails.train?.eventHour)}
    ${buildXmlElement('StartStation', fillData.requestDetails.train?.startStation?.dataCode, { text: fillData.requestDetails.train?.startStation?.dataText })}
    ${buildXmlElement('DestStation', fillData.requestDetails.train?.destinationStation?.dataCode, { text: fillData.requestDetails.train?.destinationStation?.dataText })}
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
		<TaxiDriverName xsi:nil="true"></TaxiDriverName>
    ${buildXmlElement('TaxiEventDate', fillData.requestDetails.taxi?.eventDate)}
    ${buildXmlElement('TaxiEventHour', fillData.requestDetails.taxi?.eventHour)}
    ${buildXmlElement('TaxiEventLocation', fillData.requestDetails.taxi?.eventLocation)}
		<ApplyContent xsi:nil="true"></ApplyContent>
    ${buildXmlElement('FinanceRavKav', fillData.requestDetails.busAndOther.ravKav)}
    ${buildXmlElement('FinanceRavKavNumber', fillData.requestDetails.busAndOther.ravKavNumber)}
		<FinanceOther>false</FinanceOther>
    ${buildXmlElement('SingleTrip', fillData.requestDetails.busAndOther.singleTrip || false)}
    ${buildXmlElement('LoadTopics', fillData.requestDetails.busAndOther.addFrequencyOverCrowd || false)}
    ${buildXmlElement('LongWaiting', fillData.requestDetails.busAndOther.addFrequencyLongWait || false)}
    ${buildXmlElement('ExtensionHours', fillData.requestDetails.busAndOther.addFrequencyExtendTime || false)}
    ${buildXmlElement('Operator', fillData.requestDetails.busAndOther.operator.dataCode, { text: fillData.requestDetails.busAndOther.operator.dataText })}
    ${buildXmlElement('BusDriverName', fillData.requestDetails.busAndOther.driverName)}
    ${buildXmlElement('BusLicenseNum', fillData.requestDetails.busAndOther.licenseNum)}
    ${buildXmlElement('BusEventDate', fillData.requestDetails.busAndOther.eventDate)}
    ${buildXmlElement('BusEventHour', fillData.requestDetails.busAndOther.eventHour)}
    ${buildXmlElement('from', fillData.requestDetails.busAndOther.fromHour)}
    ${buildXmlElement('by', fillData.requestDetails.busAndOther.toHour)}
    ${buildXmlElement('Reportdate', fillData.requestDetails.busAndOther.reportdate)}
    ${buildXmlElement('ReportTime', fillData.requestDetails.busAndOther.reportTime)}
    ${buildXmlElement('Stationupdate', fillData.requestDetails.busAndOther.addOrRemoveStation)}
    ${buildXmlElement('NumStation', fillData.requestDetails.busAndOther.addOrRemoveStation)}
    ${buildXmlElement('LineNumberBoarding', fillData.requestDetails.busAndOther.lineNumberText)}
    ${buildXmlElement('Direction', fillData.requestDetails.busAndOther.direction.dataCode, { text: fillData.requestDetails.busAndOther.direction.dataText })}
    ${buildXmlElement('BusStationBoard', fillData.requestDetails.busAndOther.raisingStation.dataCode, { text: fillData.requestDetails.busAndOther.raisingStation.dataText })}
    ${buildXmlElement('BoardingSettlement', fillData.requestDetails.busAndOther.raisingStationCity.dataCode, { text: fillData.requestDetails.busAndOther.raisingStationCity.dataText })}
    ${buildXmlElement('DropStaionAppeal', fillData.requestDetails.busAndOther.destinationStationCity.dataCode, { text: fillData.requestDetails.busAndOther.destinationStationCity.dataText })}
    ${buildXmlElement('Risestationaddress', fillData.requestDetails.busAndOther.raisingStationAddress)}
    ${buildXmlElement('MakatStation', fillData.requestDetails.busAndOther.makatStation)}
    ${buildXmlElement('LineNumber', fillData.requestDetails.busAndOther.lineNumberText)}
    ${buildXmlElement('BusDirectionFrom', fillData.requestDetails.busAndOther.busDirectionFrom)}
    ${buildXmlElement('BusDirectionTo', fillData.requestDetails.busAndOther.busDirectionTo)}
		<Testimony>false</Testimony>
		<Courttestimony>false</Courttestimony>
    ${buildXmlElement('CaseEssence', fillData.requestDetails.busAndOther.applyContent)}
    ${buildXmlElement('OriginCityCode', fillData.requestDetails.busAndOther.originCityCode)}
    ${buildXmlElement('OriginCityName', fillData.requestDetails.busAndOther.originCityName)}
    ${buildXmlElement('LineCode', fillData.requestDetails.busAndOther.lineCode)}
    ${buildXmlElement('CityId', fillData.requestDetails.busAndOther.cityId)}
    ${buildXmlElement('CityName', fillData.requestDetails.busAndOther.cityName)}
    ${buildXmlElement('StationName', fillData.requestDetails.busAndOther.stationName)}
    ${buildXmlElement('DirectionCode', fillData.requestDetails.busAndOther.directionCode)}
    ${buildXmlElement('DestinationCityCode', fillData.requestDetails.busAndOther.destinationCityCode)}
    ${buildXmlElement('DestinationCityText', fillData.requestDetails.busAndOther.destinationCityText)}
		<Title xsi:nil="true"></Title>
		<RequestSubjectCode xsi:nil="true"></RequestSubjectCode>
		<RequestTypeCode xsi:nil="true"></RequestTypeCode>
		<Attacment_Doc>
			<AttachDocument fileName="" />
		</Attacment_Doc>		
    <ContactID>
			<ticketNumber xsi:nil="true"></ticketNumber>
		</ContactID>
		<contactIdResult>
			<ticketNumber xsi:nil="true"></ticketNumber>
			<dateReceived xsi:nil="true"></dateReceived>
			<contactName xsi:nil="true"></contactName>
			<incidentStatus xsi:nil="true"></incidentStatus>
		</contactIdResult>
  </form>
</root>`;
}
