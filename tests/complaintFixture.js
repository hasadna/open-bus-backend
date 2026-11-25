export const data = {
  title: 'A complaint',
  email: 'rider@example.com',
  firstName: 'אביבה',
  lastName: 'ישראלי',
  id: '123456782',
  passport: '',
  mobile: '050-2345678',
  eventDate: '2026-10-09T08:00:00.000Z',
  eventHour: '08:00',
  details: 'A short complaint',
  transport: { dataText: 'אוטובוס', dataCode: '1' },
  subject: { dataText: 'איחור', dataCode: '2' },
  bus: {
    lineNumberText: '1',
    operator: { dataText: 'Operator', dataCode: '3' },
    direction: { dataText: 'Direction', dataCode: '1' },
    raisingStation: { dataText: 'Station', dataCode: '123' },
  },
};
export const train = {
  trainType: '1',
  startStation: { dataText: 'Start', dataCode: '1' },
  destinationStation: { dataText: 'End', dataCode: '2' },
  eventStation: 'start',
};
