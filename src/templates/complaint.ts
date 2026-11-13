import type { ComplaintData, DataCode } from '../types.js';
import { escapeHtml, languageNames, layout, resolveLanguage } from './shared.js';

type FieldValue = string | number | null | undefined | DataCode;
type Field = [label: string, value: FieldValue, ltr?: boolean];
type Section = [title: string, fields: Field[]];
type DisplayField = [label: string, value: string, ltr?: boolean];
type DisplaySection = [title: string, fields: DisplayField[]];

const displayValue = (value: FieldValue) => {
  if (value && typeof value === 'object') {
    return [value.dataText, value.dataCode].filter((part) => part !== undefined && part !== null && part !== '').join(' / ');
  }
  return value === undefined || value === null ? '' : String(value);
};

export function complaintTitle(data: ComplaintData) {
  const name = [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
  let trip = '';
  if (data.train) {
    trip = data.train.trainNumber ? `מספר רכבת ${data.train.trainNumber}` : 'רכבת';
  } else if (data.bus?.lineNumberText) {
    trip = `קו ${data.bus.lineNumberText}`;
  }
  const date = data.eventDate ? new Date(data.eventDate).toLocaleDateString('en-GB', { timeZone: 'Asia/Jerusalem' }) : '';
  return [name, [data.subject?.dataText, trip, date, data.eventHour].filter(Boolean).join(' ')].filter(Boolean).join(' - ');
}

export function complaintTemplate(data: ComplaintData) {
  const generatedTitle = complaintTitle(data);
  const lang = resolveLanguage(data.lang);
  const trainNames: Record<string, string | undefined> = { 1: 'רכבת ישראל', 2: 'הרכבת הקלה בירושלים', 3: 'הרכבת הקלה בגוש דן (דנקל)' };
  const eventStationNames: Record<string, string | undefined> = { start: 'תחנת מוצא', destination: 'תחנת יעד' };
  const rawSections: Section[] = [
    [
      'פרטי הפנייה',
      [
        ['שפת הפונה', languageNames[lang]],
        ['אמצעי תחבורה', data.transport?.dataText],
        ['נושא הפנייה', data.subject?.dataText],
        ['תיאור', data.details],
      ],
    ],
    [
      'פרטי האירוע',
      [
        ['תאריך', data.eventDate ? new Date(data.eventDate).toLocaleDateString('en-GB', { timeZone: 'Asia/Jerusalem' }) : '', true],
        ['שעת האירוע', data.eventHour],
        ['משעה', data.fromHour],
        ['עד שעה', data.toHour],
      ],
    ],
    [
      'פרטי התחבורה',
      [
        ['שם הנהג', data.bus?.driverName],
        ['מספר רישוי', data.bus?.licenseNumber],
        ['מספר קו', data.bus?.lineNumberText],
        ['מפעיל', data.bus?.operator?.dataText],
        ['מסלול/מק"ט', data.bus?.direction],
        ['תחנת עלייה/קוד תחנה', data.bus?.raisingStation],
      ],
    ],
    [
      'פרטי הרכבת',
      [
        ['סוג רכבת', data.train ? trainNames[data.train.trainType] : undefined],
        ['תחנת מוצא/קוד תחנה', data.train?.startStation],
        ['תחנת יעד/קוד תחנה', data.train?.destinationStation],
        ['תחנת האירוע', data.train ? eventStationNames[data.train.eventStation] : undefined],
        ['מספר רכבת', data.train?.trainNumber],
      ],
    ],
    [
      'פרטי קשר',
      [
        ['שם פרטי', data.firstName],
        ['שם משפחה', data.lastName],
        ['תעודת זהות', data.id],
        ['דרכון', data.passport],
        ['דואר אלקטרוני', data.email, true],
        ['טלפון', data.mobile, true],
        ['מספר רב-קו', data.ravkav, true],
      ],
    ],
  ];
  const sections = rawSections
    .map<DisplaySection>(([title, fields]) => [
      title,
      fields.map<DisplayField>(([label, value, ltr]) => [label, displayValue(value), ltr]).filter(([, value]) => value !== ''),
    ])
    .filter(([, fields]) => fields.length);
  const subject = generatedTitle;
  const text = sections.map(([title, fields]) => `${title}\n${fields.map(([label, value]) => `${label}: ${value}`).join('\n')}`).join('\n\n');
  const content = sections
    .map(
      ([title, fields]) =>
        `<h2 style="font-size:18px;border-bottom:1px solid #dce3e8;padding-bottom:8px">${escapeHtml(title)}</h2>${fields.map(([label, value, ltr]) => `<p style="line-height:1.6;white-space:pre-wrap"><strong>${escapeHtml(label)}:</strong> <span${ltr ? ' dir="ltr" style="unicode-bidi:isolate;display:inline-block"' : ''}>${escapeHtml(value)}</span></p>`).join('')}`,
    )
    .join('');
  return { subject, html: layout('he', generatedTitle, content), text };
}
