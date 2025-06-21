const dataModelTemplate = {
	contactType: { selectContactType: '', isChosenType: false },
	personalDetails: {
		firstName: '',
		lastName: '',
		iDNum: '',
		mobile: '',
		phone: '',
		contactOptions: '',
		fax: '',
		email: '',
		city: { dataText: '' },
		street: '',
		houseNumber: '',
		appartment: '',
		postBox: '',
		zipCode: '',
		name: 'personalDetails',
		state: 'notValidated',
		next: '',
		prev: '',
		isClosed: false,
	},
	requestSubject: {
		applySubject: { dataText: '' },
		applyType: { dataText: '' },
		name: 'requestSubject',
		state: 'notValidated',
		next: '',
		prev: '',
		isClosed: true,
	},
	requestDetails: {
		taxi: { taxiType: '' },
		busAndOther: {
			ravKav: true,
			ravKavNumber: '',
			reportdate: '',
			reportTime: '',
			addingFrequencyReason: [],
			operator: { dataText: '' },
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
			trainType: '',
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
		state: 'notValidated',
		next: '',
		prev: '',
		isClosed: true,
	},
	documentAttachment: {
		documentsList: [{ attacmentName: '' }],
		name: 'documentAttachment',
		state: 'notValidated',
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
};

function fillTemplate(template, data = {}) {
	if (Array.isArray(template)) {
		return template.map((item, idx) => fillTemplate(item, (data && data[idx]) || {}));
	}
	if (typeof template === 'object' && template !== null) {
		const result = {};
		for (const key of Object.keys(template)) {
			if (typeof template[key] === 'object' && template[key] !== null) {
				result[key] = fillTemplate(template[key], data[key]);
			} else {
				result[key] = data.hasOwnProperty(key) ? data[key] : template[key];
			}
		}
		return result;
	}
	return data !== undefined ? data : template;
}

export function buildXmlFrom(body) {
	// Only support new input structure: { userData, databusData }
	if (!(body.userData && body.databusData)) {
		throw new Error('Input must have userData and databusData');
	}
	// Map userData and databusData to the expected structure
	const input = {
		dataModelSaver: {
			personalDetails: {
				firstName: body.userData.firstName,
				lastName: body.userData.lastName,
				iDNum: body.userData.id,
				email: body.userData.email,
				phone: body.userData.phone,
			},
			requestDetails: {
				busAndOther: {
					operator: { dataText: String(body.databusData.operator) },
				},
			},
		},
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
    <Settlement text="${fields.personalDetails.city.dataText}"></Settlement>
    <street>${fields.personalDetails.street}</street>
    <HouseNumber>${fields.personalDetails.houseNumber}</HouseNumber>
    <Appartment>${fields.personalDetails.appartment}</Appartment>
    <POB>${fields.personalDetails.postBox}</POB>
    <ZipCode>${fields.personalDetails.zipCode}</ZipCode>
    <ApplySubject text="${fields.requestSubject.applySubject.dataText}"></ApplySubject>
    <TypeReq text="${fields.requestSubject.applyType.dataText}"></TypeReq>
    <TrainType>${fields.requestDetails.train.trainType}</TrainType>
    <EventDate2>${fields.requestDetails.train.eventDate}</EventDate2>
    <EventHour2>${fields.requestDetails.train.eventHour}</EventHour2>
    <StartStation text="${fields.requestDetails.train.startStation.dataText}"></StartStation>
    <DestStation text="${fields.requestDetails.train.destinationStation.dataText}"></DestStation>
    <TrainNumber>${fields.requestDetails.train.number}</TrainNumber>
    <ApplyContent3>${fields.requestDetails.train.applyContent}</ApplyContent3>
    <FirstDeclaration>false</FirstDeclaration>
    <SecondDeclaration>false</SecondDeclaration>
    <EventDetails></EventDetails>
    <Invoice></Invoice>
    <Evidence></Evidence>
    <OtherFactors></OtherFactors>
    <ETaxiType>${fields.requestDetails.taxi.taxiType}</ETaxiType>
    <DrivingLicense2>${fields.requestDetails.busAndOther.licenseNum}</DrivingLicense2>
    <TaxiCap></TaxiCap>
    <TaxiDriverName>${fields.requestDetails.busAndOther.driverName}</TaxiDriverName>
    <TaxiEventDate>${fields.requestDetails.busAndOther.eventDate}</TaxiEventDate>
    <TaxiEventHour>${fields.requestDetails.busAndOther.eventHour}</TaxiEventHour>
    <TaxiEventLocation></TaxiEventLocation>
    <ApplyContent>${fields.requestDetails.busAndOther.applyContent}</ApplyContent>
    <FinanceRavKav>${fields.requestDetails.busAndOther.ravKav}</FinanceRavKav>
    <FinanceRavKavNumber>${fields.requestDetails.busAndOther.ravKavNumber}</FinanceRavKavNumber>
    <FinanceOther>false</FinanceOther>
    <SingleTrip>false</SingleTrip>
    <LoadTopics>false</LoadTopics>
    <LongWaiting>false</LongWaiting>
    <ExtensionHours>false</ExtensionHours>
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
    <Direction text="${fields.requestDetails.busAndOther.direction.dataText}"></Direction>
    <BusStationBoard text="${fields.requestDetails.busAndOther.raisingStation.dataText}"></BusStationBoard>
    <BoardingSettlement text="${fields.requestDetails.busAndOther.raisingStationCity.dataText}"></BoardingSettlement>
    <DropStaionAppeal text="${fields.requestDetails.busAndOther.destinationStationCity.dataText}"></DropStaionAppeal>
    <Risestationaddress>${fields.requestDetails.busAndOther.raisingStationAddress}</Risestationaddress>
    <MakatStation>${fields.requestDetails.busAndOther.makatStation}</MakatStation>
    <LineNumber text="${fields.requestDetails.busAndOther.lineNumberFromList.dataText}"></LineNumber>
    <BusDirectionFrom>${fields.requestDetails.busAndOther.busDirectionFrom}</BusDirectionFrom>
    <BusDirectionTo>${fields.requestDetails.busAndOther.busDirectionTo}</BusDirectionTo>
    <Testimony>false</Testimony>
    <Courttestimony>false</Courttestimony>
    <CaseEssence></CaseEssence>
    <OriginCityCode>${fields.requestDetails.busAndOther.originCityCode}</OriginCityCode>
    <OriginCityName>${fields.requestDetails.busAndOther.originCityName}</OriginCityName>
    <LineCode>${fields.requestDetails.busAndOther.lineCode}</LineCode>
    <CityId>${fields.requestDetails.busAndOther.cityId}</CityId>
    <CityName>${fields.requestDetails.busAndOther.cityName}</CityName>
    <StationName>${fields.requestDetails.busAndOther.stationName}</StationName>
    <DirectionCode>${fields.requestDetails.busAndOther.directionCode}</DirectionCode>
    <DestinationCityCode>${fields.requestDetails.busAndOther.destinationCityCode}</DestinationCityCode>
    <DestinationCityText>${fields.requestDetails.busAndOther.destinationCityText}</DestinationCityText>
    <Title>${fields.requestDetails.title}</Title>
    <RequestSubjectCode>${fields.requestDetails.requestSubjectCode}</RequestSubjectCode>
    <RequestTypeCode>${fields.requestDetails.requestTypeCode}</RequestTypeCode>
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
