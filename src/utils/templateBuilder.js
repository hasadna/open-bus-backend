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
    // Set To Current time
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

  // Fill requestSubject from personalDetails
  if (body.data.personalDetails.applySubject) {
    fillData.requestSubject.applySubject = body.data.personalDetails.applySubject;
  }
  if (body.data.personalDetails.applyType) {
    fillData.requestSubject.applyType = body.data.personalDetails.applyType;
  }

  // Fill busAndOther if present
  if (body.data.busAndOther) {
    fillData.requestDetails.busAndOther = fillTemplate(defualt.requestDetails.busAndOther, body.data.busAndOther);
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
    fillData.documentAttachment.documentsList = body.data.documentsList;
  }

  // loadingDate Format "28/10/2025"
  fillData.loadingDate = new Date().toLocaleDateString('en-GB');

  const dataModelSaver = JSON.stringify(fillData, null, 2);

  const xml = {
    UserUImode: body.UserUImode || 'AGFrom2Html',
    BTSFormID: body.BTSFormID || null,
    BTSFormDesc: body.BTSFormDesc || null,
    BTSProcessID: body.BTSProcessID || null,
    ReferenceNumber: body.ReferenceNumber || '',
    StageStatus: body.StageStatus || '',
    isMobile: body.isMobile || 'true',
    DeviceType: body.DeviceType || null,
    FirstLoadingDate: body.FirstLoadingDate || null,
    Date: body.Date || '',
    contactType: fillData.contactType || defualt.contactType,
    personalDetails: fillData.personalDetails || defualt.personalDetails,
    requestSubject: fillData.requestSubject || defualt.requestSubject,
    requestDetails: fillData.requestDetails || defualt.requestDetails,
    documentAttachment: fillData.documentAttachment || defualt.documentAttachment,
    followStatus: fillData.followStatus || defualt.followStatus,
    containersViewModel: fillData.containersViewModel || defualt.containersViewModel,
    formInformation: fillData.formInformation || defualt.formInformation,
    FirstName: body.FirstName || '',
    LastName: body.LastName || '',
    IDNum: body.IDNum || '',
    Mobile: body.Mobile || '',
    Phone: body.Phone || '',
    ContactDetails: body.ContactDetails || '',
    Email: body.Email || '',
    fax: body.fax || '',
    Settlement: body.Settlement || '',
    street: body.street || '',
    HouseNumber: body.HouseNumber || '',
    Appartment: body.Appartment || '',
    POB: body.POB || '',
    ZipCode: body.ZipCode || '',
    ApplySubject: body.ApplySubject || '',
    TypeReq: body.TypeReq || '',
    TrainType: body.TrainType || '',
    EventDate2: body.EventDate2 || '',
    EventHour2: body.EventHour2 || '',
    StartStation: body.StartStation || '',
    DestStation: body.DestStation || '',
    TrainNumber: body.TrainNumber || '',
    ApplyContent3: body.ApplyContent3 || '',
    FirstDeclaration: body.FirstDeclaration || 'false',
    SecondDeclaration: body.SecondDeclaration || 'false',
    EventDetails: body.EventDetails || '',
    Invoice: body.Invoice || '',
    Evidence: body.Evidence || '',
    OtherFactors: body.OtherFactors || '',
    ETaxiType: body.ETaxiType || '',
    DrivingLicense2: body.DrivingLicense2 || '',
    TaxiCap: body.TaxiCap || '',
    TaxiDriverName: body.TaxiDriverName || '',
    TaxiEventDate: body.TaxiEventDate || '',
    TaxiEventHour: body.TaxiEventHour || '',
    TaxiEventLocation: body.TaxiEventLocation || '',
    ApplyContent: body.ApplyContent || '',
    FinanceRavKav: body.FinanceRavKav || '',
    FinanceRavKavNumber: body.FinanceRavKavNumber || '',
    FinanceOther: body.FinanceOther || '',
    SingleTrip: body.SingleTrip || '',
    LoadTopics: body.LoadTopics || '',
    LongWaiting: body.LongWaiting || '',
    ExtensionHours: body.ExtensionHours || '',
    Operator: body.Operator || '',
    BusDriverName: body.BusDriverName || '',
    BusLicenseNum: body.BusLicenseNum || '',
    BusEventDate: body.BusEventDate || '',
    BusEventHour: body.BusEventHour || '',
    from: body.from || '',
    by: body.by || '',
    Reportdate: body.Reportdate || '',
    ReportTime: body.ReportTime || '',
    Stationupdate: body.Stationupdate || '',
    NumStation: body.NumStation || '',
    LineNumberBoarding: body.LineNumberBoarding || '',
    Direction: body.Direction || '',
    BusStationBoard: body.BusStationBoard || '',
    BoardingSettlement: body.BoardingSettlement || '',
    DropStaionAppeal: body.DropStaionAppeal || '',
    Risestationaddress: body.Risestationaddress || '',
    MakatStation: body.MakatStation || '',
    LineNumber: body.LineNumber || '',
    BusDirectionFrom: body.BusDirectionFrom || '',
    BusDirectionTo: body.BusDirectionTo || '',
    Testimony: body.Testimony || 'false',
    Courttestimony: body.Courttestimony || 'false',
    CaseEssence: body.CaseEssence || '',
    OriginCityCode: body.OriginCityCode || '',
    OriginCityName: body.OriginCityName || '',
    LineCode: body.LineCode || '',
    CityId: body.CityId || '',
    CityName: body.CityName || '',
    StationName: body.StationName || '',
    DirectionCode: body.DirectionCode || '',
    DestinationCityCode: body.DestinationCityCode || '',
    DestinationCityText: body.DestinationCityText || '',
    Title: body.Title || '',
    RequestSubjectCode: body.RequestSubjectCode || '',
    RequestTypeCode: body.RequestTypeCode || '',
    Attacment_Doc: body.Attacment_Doc || '',
    ContactID: body.ContactID || '',
    contactIdResult: body.contactIdResult || '',
  };
  const nil = (name) => `<${name} xsi:nil="true"></${name}>`;

  return `<?xml version="1.0" encoding="utf-8"?>
<root
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" formId="PniotMot@mot.gov.il" formVersion="3.0.5" formCompileTime="22/02/2024"
  xmlns="http://AGForms/PniotMot@mot.gov.il">
  <form>
    <UserUImode>${xml.UserUImode}</UserUImode>
    ${nil('BTSFormID')}
    ${nil('BTSFormDesc')}
    ${nil('BTSProcessID')}
    <ReferenceNumber>${xml.ReferenceNumber}</ReferenceNumber>
    <StageStatus>${xml.StageStatus}</StageStatus>
    <dataModelSaver>${dataModelSaver}</dataModelSaver>
    <isMobile>${xml.isMobile}</isMobile>
    ${nil('DeviceType')}
    ${nil('FirstLoadingDate')}
    <Date>${xml.Date}</Date>
    <SelectContactType>${xml.contactType.selectContactType}</SelectContactType>
    <FirstName>${xml.personalDetails.firstName}</FirstName>
    <LastName>${xml.personalDetails.lastName}</LastName>
    <IDNum>${xml.personalDetails.iDNum}</IDNum>
    <Mobile>${xml.personalDetails.mobile}</Mobile>
    ${xml.personalDetails.phone ? `<Phone>${xml.personalDetails.phone}</Phone>` : nil('Phone')}
    <ContactDetails>${xml.personalDetails.contactOptions}</ContactDetails>
    <Email>${xml.personalDetails.email}</Email>
    ${xml.personalDetails.fax ? `<fax>${xml.personalDetails.fax}</fax>` : nil('fax')}
    <Settlement text="${xml.personalDetails?.city?.dataText}">${xml.personalDetails?.city?.dataCode}</Settlement>
    ${xml.personalDetails.street ? `<street>${xml.personalDetails.street}</street>` : nil('street')}
    <HouseNumber>${xml.personalDetails.houseNumber}</HouseNumber>
    <Appartment>${xml.personalDetails.appartment}</Appartment>
    <POB>${xml.personalDetails.postBox}</POB>
    ${xml.personalDetails.zipCode ? `<ZipCode>${xml.personalDetails.zipCode}</ZipCode>` : nil('ZipCode')}
    <ApplySubject text="${xml.requestSubject.applySubject.dataText}">${xml.requestSubject.applySubject.dataCode}</ApplySubject>
    <TypeReq text="${xml.requestSubject.applyType.dataText}">${xml.requestSubject.applyType.dataCode}</TypeReq>
    <TrainType>${xml.requestDetails.train?.trainType}</TrainType>
    ${xml.requestDetails.train?.eventDate ? `<EventDate2>${xml.requestDetails.train?.eventDate}</EventDate2>` : nil('EventDate2')}
    <EventHour2>${xml.requestDetails.train?.eventHour}</EventHour2>
    <StartStation text="${xml.requestDetails.train?.startStation?.dataText}"></StartStation>
    ${xml.requestDetails.train?.destinationStation?.dataText ? `<DestStation text="${xml.requestDetails.train?.destinationStation?.dataText}"></DestStation>` : nil('DestStation')}
    <TrainNumber>${xml.requestDetails.train?.number}</TrainNumber>
    <ApplyContent3>${xml.requestDetails.train?.applyContent}</ApplyContent3>
     <FirstDeclaration>${xml.requestDetails.busAndOther.firstDeclaration || false}</FirstDeclaration>
     <SecondDeclaration>${xml.requestDetails.busAndOther.secondDeclaration || false}</SecondDeclaration>
    <EventDetails></EventDetails>
    <Invoice></Invoice>
    <Evidence></Evidence>
    <OtherFactors></OtherFactors>
    <ETaxiType>${xml.requestDetails.taxi?.taxiType}</ETaxiType>
    ${xml.requestDetails.busAndOther?.licenseNum ? `<DrivingLicense2>${xml.requestDetails.busAndOther?.licenseNum}</DrivingLicense2>` : nil('DrivingLicense2')}
    <TaxiCap></TaxiCap>
    <TaxiDriverName>${xml.requestDetails.busAndOther?.driverName}</TaxiDriverName>
    <TaxiEventDate>${xml.requestDetails.busAndOther?.eventDate}</TaxiEventDate>
    ${xml.requestDetails.busAndOther?.eventHour ? `<TaxiEventHour>${xml.requestDetails.busAndOther?.eventHour}</TaxiEventHour>` : nil('TaxiEventHour')}
    <TaxiEventLocation></TaxiEventLocation>
    ${xml.requestDetails.busAndOther.applyContent ? `<ApplyContent>${xml.requestDetails.busAndOther.applyContent}</ApplyContent>` : nil('ApplyContent')}
    <FinanceRavKav>${xml.requestDetails.busAndOther.ravKav}</FinanceRavKav>
    <FinanceRavKavNumber>${xml.requestDetails.busAndOther.ravKavNumber}</FinanceRavKavNumber>
    <FinanceOther>false</FinanceOther>
     <SingleTrip>false</SingleTrip>
     <LoadTopics>${xml.requestDetails.busAndOther.addFrequencyOverCrowd || false}</LoadTopics>
     <LongWaiting>${xml.requestDetails.busAndOther.addFrequencyLongWait || false}</LongWaiting>
     <ExtensionHours>${xml.requestDetails.busAndOther.addFrequencyExtendTime || false}</ExtensionHours>
    <Operator text="${xml.requestDetails.busAndOther.operator.dataText}">${xml.requestDetails.busAndOther.operator.dataCode || ''}</Operator>
    ${xml.requestDetails.busAndOther.driverName ? `<BusDriverName>${xml.requestDetails.busAndOther.driverName}</BusDriverName>` : nil('BusDriverName')}
    ${xml.requestDetails.busAndOther.licenseNum ? `<BusLicenseNum>${xml.requestDetails.busAndOther.licenseNum}</BusLicenseNum>` : nil('BusLicenseNum')}
    <BusEventDate>${xml.requestDetails.busAndOther.eventDate}</BusEventDate>
    <BusEventHour>${xml.requestDetails.busAndOther.eventHour}</BusEventHour>
    ${xml.requestDetails.busAndOther.busDirectionFrom ? `<from>${xml.requestDetails.busAndOther.busDirectionFrom}</from>` : nil('from')}
    <by>${xml.requestDetails.busAndOther.busDirectionTo}</by>
    <Reportdate>${xml.requestDetails.busAndOther.reportdate}</Reportdate>
    <ReportTime>${xml.requestDetails.busAndOther.reportTime}</ReportTime>
    <Stationupdate>${xml.requestDetails.busAndOther.addOrRemoveStation}</Stationupdate>
    <NumStation>${xml.requestDetails.busAndOther.addOrRemoveStation}</NumStation>
    ${xml.requestDetails.busAndOther.lineNumberText ? `<LineNumberBoarding>${xml.requestDetails.busAndOther.lineNumberText}</LineNumberBoarding>` : nil('LineNumberBoarding')}
    ${xml.requestDetails.busAndOther?.direction?.dataText ? `<Direction text="${xml.requestDetails.busAndOther?.direction?.dataText}">${xml.requestDetails.busAndOther?.direction?.dataCode}</Direction>` : nil('Direction')}
    ${xml.requestDetails.busAndOther?.raisingStation?.dataText ? `<BusStationBoard text="${xml.requestDetails.busAndOther?.raisingStation?.dataText}">${xml.requestDetails.busAndOther?.raisingStation?.dataCode}</BusStationBoard>` : nil('BusStationBoard')}
    <BoardingSettlement text="${xml.requestDetails.busAndOther?.raisingStationCity?.dataText}"></BoardingSettlement>
    <DropStaionAppeal text="${xml.requestDetails.busAndOther?.destinationStationCity?.dataText}"></DropStaionAppeal>
    <Risestationaddress>${xml.requestDetails.busAndOther?.raisingStationAddress}</Risestationaddress>
    <MakatStation>${xml.requestDetails.busAndOther.makatStation}</MakatStation>
    <LineNumber text="${xml.requestDetails.busAndOther?.lineNumberFromList?.dataText}"></LineNumber>
    <BusDirectionFrom>${xml.requestDetails.busAndOther?.busDirectionFrom}</BusDirectionFrom>
    ${xml.requestDetails.busAndOther?.busDirectionTo ? `<BusDirectionTo>${xml.requestDetails.busAndOther?.busDirectionTo}</BusDirectionTo>` : nil('BusDirectionTo')}
    <Testimony>false</Testimony>
    <Courttestimony>false</Courttestimony>
    <CaseEssence></CaseEssence>
    <OriginCityCode>${xml.requestDetails.busAndOther?.originCityCode}</OriginCityCode>
    <OriginCityName>${xml.requestDetails.busAndOther?.originCityName}</OriginCityName>
    <LineCode>${xml.requestDetails.busAndOther?.lineCode}</LineCode>
    <CityId>${xml.requestDetails.busAndOther?.cityId}</CityId>
    ${xml.requestDetails.busAndOther?.cityName ? `<CityName>${xml.requestDetails.busAndOther?.cityName}</CityName>` : nil('CityName')}
    <StationName>${xml.requestDetails.busAndOther?.stationName}</StationName>
    <DirectionCode>${xml.requestDetails.busAndOther?.directionCode}</DirectionCode>
    <DestinationCityCode>${xml.requestDetails.busAndOther?.destinationCityCode}</DestinationCityCode>
    ${xml.requestDetails.busAndOther?.destinationCityText ? `<DestinationCityText>${xml.requestDetails.busAndOther?.destinationCityText}</DestinationCityText>` : nil('DestinationCityText')}
    <Title>${xml.requestDetails.title}</Title>
    <RequestSubjectCode>${xml.requestDetails?.requestSubjectCode}</RequestSubjectCode>
    <RequestTypeCode>${xml.requestDetails?.requestTypeCode}</RequestTypeCode>
    <Attacment_Doc>
      <AttachDocument fileName="${xml.documentAttachment.documentsList[0]?.attacmentName || ''}" />
    </Attacment_Doc>
    <ContactID>
      <ticketNumber>${xml.followStatus.contactIdList[0]?.ticketNumber || ''}</ticketNumber>
    </ContactID>
    <contactIdResult>
      <ticketNumber>${xml.followStatus.contactIdResultList[0]?.ticketNumber || ''}</ticketNumber>
      <dateReceived>${xml.followStatus.contactIdResultList[0]?.dateReceived || ''}</dateReceived>
      <contactName>${xml.followStatus.contactIdResultList[0]?.contactName || ''}</contactName>
      <incidentStatus>${xml.followStatus.contactIdResultList[0]?.incidentStatus || ''}</incidentStatus>
    </contactIdResult>
  </form>
</root>`;
}
