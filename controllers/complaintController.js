import axios from 'axios';

const xmlPayload = `<?xml version="1.0" encoding="utf-8"?><root xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" formId="PniotMot@mot.gov.il" formVersion="3.0.5" formCompileTime="22/02/2024" xmlns="http://AGForms/PniotMot@mot.gov.il"><form><UserUImode>AGFrom2Html</UserUImode><BTSFormID xsi:nil="true"></BTSFormID><BTSFormDesc xsi:nil="true"></BTSFormDesc><BTSProcessID xsi:nil="true"></BTSProcessID><ReferenceNumber>1805472</ReferenceNumber><StageStatus>UserToOffice</StageStatus><dataModelSaver>{  "contactType": {    "selectContactType": "1",    "isChosenType": true  },  "personalDetails": {    "firstName": "firstNane",    "lastName": "",    "iDNum": "",    "mobile": "",    "phone": "",    "contactOptions": "1",    "fax": "",    "email": "",    "city": {      "dataText": ""    },    "street": "",    "houseNumber": "",    "appartment": "",    "postBox": "",    "zipCode": "",    "name": "personalDetails",    "state": "notValidated",    "next": "",    "prev": "",    "isClosed": false  },  "requestSubject": {    "applySubject": {      "dataText": ""    },    "applyType": {      "dataText": ""    },    "name": "requestSubject",    "state": "notValidated",    "next": "",    "prev": "",    "isClosed": true  },  "requestDetails": {    "taxi": {      "taxiType": "2"    },    "busAndOther": {      "ravKav": true,      "ravKavNumber": "",      "reportdate": "",      "reportTime": "",      "addingFrequencyReason": [],      "operator": {        "dataText": ""      },      "addOrRemoveStation": "2",      "driverName": "",      "licenseNum": "",      "eventDate": "",      "eventHour": "",      "fromHour": "",      "toHour": "",      "fillByMakatOrAddress": "2",      "makatStation": "",      "lineNumberText": "",      "lineNumberFromList": {        "dataText": ""      },      "direction": {        "dataText": ""      },      "raisingStation": {        "dataText": ""      },      "applyContent": "",      "busDirectionFrom": "",      "busDirectionTo": "",      "raisingStationCity": {        "dataText": ""      },      "destinationStationCity": {        "dataText": ""      },      "raisingStationAddress": "",      "cityId": "",      "cityName": "",      "originCityCode": "",      "originCityName": "",      "destinationCityCode": "",      "destinationCityText": "",      "directionCode": "",      "stationName": "",      "lineCode": ""    },    "train": {      "trainType": "1",      "eventDate": "",      "eventHour": "",      "startStation": {        "dataText": ""      },      "destinationStation": {        "dataText": ""      },      "number": "",      "applyContent": ""    },    "requestSubjectCode": "",    "requestTypeCode": "",    "title": "",    "name": "requestDetails",    "state": "notValidated",    "next": "",    "prev": "",    "isClosed": true  },  "documentAttachment": {    "documentsList": [      {        "attacmentName": ""      }    ],    "name": "documentAttachment",    "state": "notValidated",    "next": "",    "prev": "",    "isClosed": true  },  "followStatus": {    "contactIdList": [      {        "ticketNumber": ""      }    ],    "contactIdResultList": [],    "name": "followStatus",    "state": "notValidated",    "next": "",    "prev": "",    "isClosed": true  },  "containersViewModel": {    "showPrintButton": true,    "isTabsMode": false,    "validatedStatus": true  },  "formInformation": {    "referenceNumber": "1805472",    "stageStatus": "UserToOffice",    "loadingDate": "13/05/2025",    "firstLoadingDate": "",    "isMobile": false,    "language": "hebrew"  }}</dataModelSaver><isMobile>false</isMobile><DeviceType xsi:nil="true"></DeviceType><FirstLoadingDate xsi:nil="true"></FirstLoadingDate><Date>13/05/2025</Date><SelectContactType>1</SelectContactType><FirstName>firstNane</FirstName><LastName xsi:nil="true"></LastName><IDNum xsi:nil="true"></IDNum><Mobile xsi:nil="true"></Mobile><Phone xsi:nil="true"></Phone><ContactDetails>1</ContactDetails><Email xsi:nil="true"></Email><fax xsi:nil="true"></fax><Settlement text="" xsi:nil="true"></Settlement><street xsi:nil="true"></street><HouseNumber xsi:nil="true"></HouseNumber><Appartment xsi:nil="true"></Appartment><POB xsi:nil="true"></POB><ZipCode xsi:nil="true"></ZipCode><ApplySubject text="" xsi:nil="true"></ApplySubject><TypeReq text="" xsi:nil="true"></TypeReq><TrainType>1</TrainType><EventDate2 xsi:nil="true"></EventDate2><EventHour2 xsi:nil="true"></EventHour2><StartStation text="" xsi:nil="true"></StartStation><DestStation text="" xsi:nil="true"></DestStation><TrainNumber xsi:nil="true"></TrainNumber><ApplyContent3 xsi:nil="true"></ApplyContent3><FirstDeclaration>false</FirstDeclaration><SecondDeclaration>false</SecondDeclaration><EventDetails xsi:nil="true"></EventDetails><Invoice xsi:nil="true"></Invoice><Evidence xsi:nil="true"></Evidence><OtherFactors xsi:nil="true"></OtherFactors><ETaxiType>2</ETaxiType><DrivingLicense2 xsi:nil="true"></DrivingLicense2><TaxiCap xsi:nil="true"></TaxiCap><TaxiDriverName xsi:nil="true"></TaxiDriverName><TaxiEventDate xsi:nil="true"></TaxiEventDate><TaxiEventHour xsi:nil="true"></TaxiEventHour><TaxiEventLocation xsi:nil="true"></TaxiEventLocation><ApplyContent xsi:nil="true"></ApplyContent><FinanceRavKav>true</FinanceRavKav><FinanceRavKavNumber xsi:nil="true"></FinanceRavKavNumber><FinanceOther>false</FinanceOther><SingleTrip>false</SingleTrip><LoadTopics>false</LoadTopics><LongWaiting>false</LongWaiting><ExtensionHours>false</ExtensionHours><Operator text="" xsi:nil="true"></Operator><BusDriverName xsi:nil="true"></BusDriverName><BusLicenseNum xsi:nil="true"></BusLicenseNum><BusEventDate xsi:nil="true"></BusEventDate><BusEventHour xsi:nil="true"></BusEventHour><from xsi:nil="true"></from><by xsi:nil="true"></by><Reportdate xsi:nil="true"></Reportdate><ReportTime xsi:nil="true"></ReportTime><Stationupdate>2</Stationupdate><NumStation>2</NumStation><LineNumberBoarding xsi:nil="true"></LineNumberBoarding><Direction text="" xsi:nil="true"></Direction><BusStationBoard text="" xsi:nil="true"></BusStationBoard><BoardingSettlement text="" xsi:nil="true"></BoardingSettlement><DropStaionAppeal text="" xsi:nil="true"></DropStaionAppeal><Risestationaddress xsi:nil="true"></Risestationaddress><MakatStation xsi:nil="true"></MakatStation><LineNumber text="" xsi:nil="true"></LineNumber><BusDirectionFrom xsi:nil="true"></BusDirectionFrom><BusDirectionTo xsi:nil="true"></BusDirectionTo><Testimony>false</Testimony><Courttestimony>false</Courttestimony><CaseEssence xsi:nil="true"></CaseEssence><OriginCityCode xsi:nil="true"></OriginCityCode><OriginCityName xsi:nil="true"></OriginCityName><LineCode xsi:nil="true"></LineCode><CityId xsi:nil="true"></CityId><CityName xsi:nil="true"></CityName><StationName xsi:nil="true"></StationName><DirectionCode xsi:nil="true"></DirectionCode><DestinationCityCode xsi:nil="true"></DestinationCityCode><DestinationCityText xsi:nil="true"></DestinationCityText><Title xsi:nil="true"></Title><RequestSubjectCode xsi:nil="true"></RequestSubjectCode><RequestTypeCode xsi:nil="true"></RequestTypeCode><Attacment_Doc><AttachDocument fileName="" /></Attacment_Doc><ContactID><ticketNumber xsi:nil="true"></ticketNumber></ContactID><contactIdResult><ticketNumber xsi:nil="true"></ticketNumber><dateReceived xsi:nil="true"></dateReceived><contactName xsi:nil="true"></contactName><incidentStatus xsi:nil="true"></incidentStatus></contactIdResult></form></root>`;

const url = 'https://forms.gov.il/globaldata/getsequence/getHtmlForm.aspx?formType=PniotMot%40mot.gov.il';

export async function complaintController(req, res) {
	try {
		// const {
		// 	//SelectContactType1=0
		// 	firstName,
		// 	lastName,
		// 	zehutID,
		// 	email,
		// 	phone, // ?
		// 	subject,
		// 	oprator,
		// 	// reoprt - subject code 14
		// 	financeRavKav, // bool need add ravkavID
		// 	ravkavID,
		// 	singleTrip, // bool need add  כרטיס הנסיעה כצרופה לפנייה
		// 	reportID,
		// 	reportDate,
		// 	reportTime,
		// 	// ----------
		// 	// event -
		// 	busEventDate,
		// 	fillBy, // line+roude=give stop list, stopID=give lines,
		// 	line,
		// 	round,
		// 	stopID, // ID
		// 	from,
		// 	to,
		// 	description,
		// } = req.body;
		// const response = await axios.post(url, xmlPayload, {
		// 	headers: { 'Content-Type': 'application/xml' },
		// });
		res.status(200).json({ success: true, data: 'data' });
	} catch (error) {
		console.error('Error creating complain:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
}
