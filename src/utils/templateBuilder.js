import { idValidator } from './idValidator.js';

const dataModelTemplate = {
  contactType: {
    isChosenType: false,
    selectContactType: '',
  },
  containersViewModel: {
    isTabsMode: false,
    showPrintButton: true,
    validatedStatus: true,
  },
  documentAttachment: {
    documentsList: [
      {
        attacmentName: '',
      },
    ],
    isClosed: true,
    name: 'documentAttachment',
    next: '',
    prev: '',
    state: 'notValidated',
  },
  followStatus: {
    contactIdList: [
      {
        ticketNumber: '',
      },
    ],
    contactIdResultList: [],
    isClosed: true,
    name: 'followStatus',
    next: '',
    prev: '',
    state: 'notValidated',
  },
  formInformation: {
    firstLoadingDate: '',
    isMobile: false,
    language: '',
    loadingDate: '',
    referenceNumber: '',
    stageStatus: '',
  },
  personalDetails: {
    appartment: '',
    city: {
      dataText: '',
    },
    contactOptions: '',
    email: '',
    fax: '',
    firstName: '',
    houseNumber: '',
    iDNum: '',
    isClosed: false,
    lastName: '',
    mobile: '',
    name: 'personalDetails',
    next: '',
    phone: '',
    postBox: '',
    prev: '',
    state: 'notValidated',
    street: '',
    zipCode: '',
  },
  requestDetails: {
    busAndOther: {
      addOrRemoveStation: '',
      addingFrequencyReason: [],
      applyContent: '',
      busDirectionFrom: '',
      busDirectionTo: '',
      cityId: '',
      cityName: '',
      destinationCityCode: '',
      destinationCityText: '',
      destinationStationCity: {
        dataText: '',
      },
      direction: {
        dataText: '',
      },
      directionCode: '',
      driverName: '',
      eventDate: '',
      eventHour: '',
      fillByMakatOrAddress: '',
      fromHour: '',
      licenseNum: '',
      lineCode: '',
      lineNumberFromList: {
        dataText: '',
      },
      lineNumberText: '',
      makatStation: '',
      operator: {
        dataText: '',
      },
      originCityCode: '',
      originCityName: '',
      raisingStation: {
        dataText: '',
      },
      raisingStationAddress: '',
      raisingStationCity: {
        dataText: '',
      },
      ravKav: true,
      ravKavNumber: '',
      reportTime: '',
      reportdate: '',
      stationName: '',
      toHour: '',
    },
    isClosed: true,
    name: 'requestDetails',
    next: '',
    prev: '',
    requestSubjectCode: '',
    requestTypeCode: '',
    state: 'notValidated',
    taxi: {
      taxiType: '',
    },
    title: '',
    train: {
      applyContent: '',
      destinationStation: {
        dataText: '',
      },
      eventDate: '',
      eventHour: '',
      number: '',
      startStation: {
        dataText: '',
      },
      trainType: '',
    },
  },
  requestSubject: {
    applySubject: {
      dataText: '',
    },
    applyType: {
      dataText: '',
    },
    isClosed: true,
    name: 'requestSubject',
    next: '',
    prev: '',
    state: 'notValidated',
  },
};

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
  // Support new input structure: { debug?, data: FormDataModelSchema }
  if (!body.data) {
    throw new Error('Input must have data property');
  }

  // If data is flattened, nest it
  if (body.data.firstName) {
    body.data = {
      personalDetails: {
        firstName: body.data.firstName,
        lastName: body.data.lastName,
        iDNum: body.data.iDNum,
        email: body.data.email,
        mobile: body.data.mobile,
        city: body.data.city,
        street: body.data.street || '',
        houseNumber: body.data.houseNumber || '',
        appartment: body.data.appartment || '',
        postBox: body.data.postBox || '',
        zipCode: body.data.zipCode || '',
        phone: body.data.phone || '',
        contactOptions: body.data.contactOptions || '',
        fax: body.data.fax || '',
        state: 'completed',
        next: '',
        prev: '',
        isClosed: true,
        name: 'personalDetails',
      },
      requestSubject: {
        applySubject: body.data.applySubject,
        applyType: body.data.applyType,
        state: 'completed',
        next: '',
        prev: '',
        isClosed: true,
        name: 'requestSubject',
      },
      requestDetails: {
        busAndOther: {
          ravKav: body.data.ravKav || true,
          ravKavNumber: body.data.ravKavNumber || '',
          reportdate: body.data.reportdate || '',
          reportTime: body.data.reportTime || '',
          addingFrequencyReason: body.data.addFrequencyReason ? [body.data.addFrequencyReason] : [],
          operator: body.data.busOperator,
          addOrRemoveStation: body.data.addOrRemoveStation || '',
          driverName: body.data.driverName || '',
          licenseNum: body.data.licenseNum || '',
          eventDate: body.data.eventDate || '',
          eventHour: body.data.eventTime || '',
          fromHour: '',
          toHour: '',
          fillByMakatOrAddress: '2',
          makatStation: '',
          lineNumberText: body.data.lineNumberText || '',
          lineNumberFromList: {
            dataText: '',
          },
          direction: body.data.direction,
          raisingStation: body.data.raisingStation,
          applyContent: body.data.applyContent || '',
          busDirectionFrom: body.data.busDirectionFrom,
          busDirectionTo: body.data.busDirectionTo,
          raisingStationCity: body.data.raisingStationCity,
          destinationStationCity: body.data.destinationStationCity,
          raisingStationAddress: body.data.raisingStationAddress || '',
          cityId: '',
          cityName: '',
          originCityCode: '',
          originCityName: '',
          destinationCityCode: '',
          destinationCityText: '',
          directionCode: '',
          stationName: '',
          lineCode: '',
          addFrequencyOverCrowd: body.data.addFrequencyOverCrowd || false,
          addFrequencyLongWait: body.data.addFrequencyLongWait || false,
          addFrequencyExtendTime: body.data.addFrequencyExtendTime || false,
          firstDeclaration: body.data.firstDeclaration || false,
          secondDeclaration: body.data.secondDeclaration || false,
        },
        taxi: {
          taxiType: '',
        },
        train: {
          trainType: '',
          eventDate: '',
          eventHour: '',
          startStation: {
            dataText: '',
          },
          destinationStation: {
            dataText: '',
          },
          number: '',
          applyContent: '',
        },
        requestSubjectCode: '',
        requestTypeCode: '',
        title: '',
        name: 'requestDetails',
        state: 'notValidated',
        next: '',
        prev: '',
        isClosed: false,
      },
      documentAttachment: {
        documentsList: [
          {
            attacmentName: '',
          },
        ],
        name: 'documentAttachment',
        state: 'notValidated',
        next: '',
        prev: '',
        isClosed: true,
      },
      followStatus: {
        contactIdList: [
          {
            ticketNumber: '',
          },
        ],
        contactIdResultList: [],
        name: 'followStatus',
        state: 'notValidated',
        next: '',
        prev: '',
        isClosed: true,
      },
      containersViewModel: {
        showPrintButton: true,
        isTabsMode: false,
        validatedStatus: true,
      },
      formInformation: {
        referenceNumber: '',
        stageStatus: '',
        loadingDate: '',
        firstLoadingDate: '',
        isMobile: false,
        language: '',
      },
      contactType: {
        isChosenType: true,
        selectContactType: '1',
      },
    };
  }

  // Validate ID number from personal details
  if (!idValidator(String(body.data.personalDetails?.iDNum))) {
    throw new Error('Invalid Id Number');
  }

  // Use the data directly as it already matches the expected structure
  const input = {
    dataModelSaver: body.data,
  };

  const dataModelSaver = JSON.stringify(fillTemplate(dataModelTemplate, input.dataModelSaver), null, 2);
  const fields = {
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
    contactType: input.dataModelSaver.contactType || dataModelTemplate.contactType,
    personalDetails: input.dataModelSaver.personalDetails || dataModelTemplate.personalDetails,
    requestSubject: input.dataModelSaver.requestSubject || dataModelTemplate.requestSubject,
    requestDetails: input.dataModelSaver.requestDetails || dataModelTemplate.requestDetails,
    documentAttachment: input.dataModelSaver.documentAttachment || dataModelTemplate.documentAttachment,
    followStatus: input.dataModelSaver.followStatus || dataModelTemplate.followStatus,
    containersViewModel: input.dataModelSaver.containersViewModel || dataModelTemplate.containersViewModel,
    formInformation: input.dataModelSaver.formInformation || dataModelTemplate.formInformation,
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
    <UserUImode>${fields.UserUImode}</UserUImode>
    ${nil('BTSFormID')}
    ${nil('BTSFormDesc')}
    ${nil('BTSProcessID')}
    <ReferenceNumber>${fields.ReferenceNumber}</ReferenceNumber>
    <StageStatus>${fields.StageStatus}</StageStatus>
    <dataModelSaver>${dataModelSaver}</dataModelSaver>
    <isMobile>${fields.isMobile}</isMobile>
    ${nil('DeviceType')}
    ${nil('FirstLoadingDate')}
    <Date>${fields.Date}</Date>
    <SelectContactType>${fields.contactType.selectContactType}</SelectContactType>
    <FirstName>${fields.personalDetails.firstName}</FirstName>
    <LastName>${fields.personalDetails.lastName}</LastName>
    <IDNum>${fields.personalDetails.iDNum}</IDNum>
    <Mobile>${fields.personalDetails.mobile}</Mobile>
    <Phone>${fields.personalDetails.phone}</Phone>
    <ContactDetails>${fields.personalDetails.contactOptions}</ContactDetails>
    <Email>${fields.personalDetails.email}</Email>
    <fax>${fields.personalDetails.fax}</fax>
    <Settlement text="${fields.personalDetails?.city?.dataText}"></Settlement>
    <street>${fields.personalDetails.street}</street>
    <HouseNumber>${fields.personalDetails.houseNumber}</HouseNumber>
    <Appartment>${fields.personalDetails.appartment}</Appartment>
    <POB>${fields.personalDetails.postBox}</POB>
    <ZipCode>${fields.personalDetails.zipCode}</ZipCode>
    <ApplySubject text="${fields.requestSubject.applySubject.dataText}"></ApplySubject>
    <TypeReq text="${fields.requestSubject.applyType.dataText}"></TypeReq>
    <TrainType>${fields.requestDetails.train?.trainType}</TrainType>
    <EventDate2>${fields.requestDetails.train?.eventDate}</EventDate2>
    <EventHour2>${fields.requestDetails.train?.eventHour}</EventHour2>
    <StartStation text="${fields.requestDetails.train?.startStation?.dataText}"></StartStation>
    <DestStation text="${fields.requestDetails.train?.destinationStation?.dataText}"></DestStation>
    <TrainNumber>${fields.requestDetails.train?.number}</TrainNumber>
    <ApplyContent3>${fields.requestDetails.train?.applyContent}</ApplyContent3>
     <FirstDeclaration>${fields.requestDetails.busAndOther.firstDeclaration || false}</FirstDeclaration>
     <SecondDeclaration>${fields.requestDetails.busAndOther.secondDeclaration || false}</SecondDeclaration>
    <EventDetails></EventDetails>
    <Invoice></Invoice>
    <Evidence></Evidence>
    <OtherFactors></OtherFactors>
    <ETaxiType>${fields.requestDetails.taxi?.taxiType}</ETaxiType>
    <DrivingLicense2>${fields.requestDetails.busAndOther?.licenseNum}</DrivingLicense2>
    <TaxiCap></TaxiCap>
    <TaxiDriverName>${fields.requestDetails.busAndOther?.driverName}</TaxiDriverName>
    <TaxiEventDate>${fields.requestDetails.busAndOther?.eventDate}</TaxiEventDate>
    <TaxiEventHour>${fields.requestDetails.busAndOther?.eventHour}</TaxiEventHour>
    <TaxiEventLocation></TaxiEventLocation>
    <ApplyContent>${fields.requestDetails.busAndOther.applyContent}</ApplyContent>
    <FinanceRavKav>${fields.requestDetails.busAndOther.ravKav}</FinanceRavKav>
    <FinanceRavKavNumber>${fields.requestDetails.busAndOther.ravKavNumber}</FinanceRavKavNumber>
    <FinanceOther>false</FinanceOther>
     <SingleTrip>false</SingleTrip>
     <LoadTopics>${fields.requestDetails.busAndOther.addFrequencyOverCrowd || false}</LoadTopics>
     <LongWaiting>${fields.requestDetails.busAndOther.addFrequencyLongWait || false}</LongWaiting>
     <ExtensionHours>${fields.requestDetails.busAndOther.addFrequencyExtendTime || false}</ExtensionHours>
    <Operator text="${fields.requestDetails.busAndOther.operator.dataText}"></Operator>
    <BusDriverName>${fields.requestDetails.busAndOther.driverName}</BusDriverName>
    <BusLicenseNum>${fields.requestDetails.busAndOther.licenseNum}</BusLicenseNum>
    <BusEventDate>${fields.requestDetails.busAndOther.eventDate}</BusEventDate>
    <BusEventHour>${fields.requestDetails.busAndOther.eventHour}</BusEventHour>
    <from>${fields.requestDetails.busAndOther.busDirectionFrom}</from>
    <by>${fields.requestDetails.busAndOther.busDirectionTo}</by>
    <Reportdate>${fields.requestDetails.busAndOther.reportdate}</Reportdate>
    <ReportTime>${fields.requestDetails.busAndOther.reportTime}</ReportTime>
    <Stationupdate>${fields.requestDetails.busAndOther.addOrRemoveStation}</Stationupdate>
    <NumStation>${fields.requestDetails.busAndOther.addOrRemoveStation}</NumStation>
    <LineNumberBoarding>${fields.requestDetails.busAndOther.lineNumberText}</LineNumberBoarding>
    <Direction text="${fields.requestDetails.busAndOther?.direction?.dataText}"></Direction>
    <BusStationBoard text="${fields.requestDetails.busAndOther?.raisingStation?.dataText}"></BusStationBoard>
    <BoardingSettlement text="${fields.requestDetails.busAndOther?.raisingStationCity?.dataText}"></BoardingSettlement>
    <DropStaionAppeal text="${fields.requestDetails.busAndOther?.destinationStationCity?.dataText}"></DropStaionAppeal>
    <Risestationaddress>${fields.requestDetails.busAndOther?.raisingStationAddress}</Risestationaddress>
    <MakatStation>${fields.requestDetails.busAndOther.makatStation}</MakatStation>
    <LineNumber text="${fields.requestDetails.busAndOther?.lineNumberFromList?.dataText}"></LineNumber>
    <BusDirectionFrom>${fields.requestDetails.busAndOther?.busDirectionFrom}</BusDirectionFrom>
    <BusDirectionTo>${fields.requestDetails.busAndOther?.busDirectionTo}</BusDirectionTo>
    <Testimony>false</Testimony>
    <Courttestimony>false</Courttestimony>
    <CaseEssence></CaseEssence>
    <OriginCityCode>${fields.requestDetails.busAndOther?.originCityCode}</OriginCityCode>
    <OriginCityName>${fields.requestDetails.busAndOther?.originCityName}</OriginCityName>
    <LineCode>${fields.requestDetails.busAndOther?.lineCode}</LineCode>
    <CityId>${fields.requestDetails.busAndOther?.cityId}</CityId>
    <CityName>${fields.requestDetails.busAndOther?.cityName}</CityName>
    <StationName>${fields.requestDetails.busAndOther?.stationName}</StationName>
    <DirectionCode>${fields.requestDetails.busAndOther?.directionCode}</DirectionCode>
    <DestinationCityCode>${fields.requestDetails.busAndOther?.destinationCityCode}</DestinationCityCode>
    <DestinationCityText>${fields.requestDetails.busAndOther?.destinationCityText}</DestinationCityText>
    <Title>${fields.requestDetails.title}</Title>
    <RequestSubjectCode>${fields.requestDetails?.requestSubjectCode}</RequestSubjectCode>
    <RequestTypeCode>${fields.requestDetails?.requestTypeCode}</RequestTypeCode>
    <Attacment_Doc>
      <AttachDocument fileName="${fields.documentAttachment.documentsList[0]?.attacmentName || ''}" />
    </Attacment_Doc>
    <ContactID>
      <ticketNumber>${fields.followStatus.contactIdList[0]?.ticketNumber || ''}</ticketNumber>
    </ContactID>
    <contactIdResult>
      <ticketNumber>${fields.followStatus.contactIdResultList[0]?.ticketNumber || ''}</ticketNumber>
      <dateReceived>${fields.followStatus.contactIdResultList[0]?.dateReceived || ''}</dateReceived>
      <contactName>${fields.followStatus.contactIdResultList[0]?.contactName || ''}</contactName>
      <incidentStatus>${fields.followStatus.contactIdResultList[0]?.incidentStatus || ''}</incidentStatus>
    </contactIdResult>
  </form>
</root>`;
}
