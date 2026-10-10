import { escapeHtml, languageNames, layout, resolveLanguage } from './shared.js';

const displayValue = (value) => {
  if (value && typeof value === 'object') {
    return [value.dataText, value.dataCode].filter((part) => part !== undefined && part !== null && part !== '').join(' / ');
  }
  return value === undefined || value === null ? '' : String(value);
};

export function complaintTemplate(data) {
  const lang = resolveLanguage(data.lang);
  const trainNames = { 1: 'רכבת ישראל', 2: 'הרכבת הקלה בירושלים', 3: 'הרכבת הקלה בגוש דן (דנקל)' };
  const eventStationNames = { start: 'תחנת מוצא', destination: 'תחנת יעד' };
  const sections = [
    [
      'פרטי הפנייה',
      [
        ['נושא', data.title],
        ['שפת הפונה', languageNames[lang]],
        ['אמצעי תחבורה', data.transport],
        ['נושא הפנייה', data.subject],
        ['תיאור', data.details],
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
      ],
    ],
    [
      'פרטי האירוע',
      [
        ['תאריך', data.eventDate],
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
        ['מפעיל', data.bus?.operator],
        ['כיוון', data.bus?.direction],
        ['תחנת עלייה', data.bus?.raisingStation],
      ],
    ],
    [
      'פרטי הרכבת',
      [
        ['סוג רכבת', trainNames[data.train?.trainType]],
        ['תחנת מוצא', data.train?.startStation],
        ['תחנת יעד', data.train?.destinationStation],
        ['תחנת האירוע', eventStationNames[data.train?.eventStation]],
        ['מספר רכבת', data.train?.trainNumber],
      ],
    ],
  ]
    .map(([title, fields]) => [title, fields.map(([label, value, ltr]) => [label, displayValue(value), ltr]).filter(([, value]) => value !== '')])
    .filter(([, fields]) => fields.length);
  const subject = `פנייה באמצעות Open Bus: ${data.title}`;
  const text = sections.map(([title, fields]) => `${title}\n${fields.map(([label, value]) => `${label}: ${value}`).join('\n')}`).join('\n\n');
  const content = sections
    .map(
      ([title, fields]) =>
        `<h2 style="font-size:18px;border-bottom:1px solid #dce3e8;padding-bottom:8px">${escapeHtml(title)}</h2>${fields.map(([label, value, ltr]) => `<p style="line-height:1.6;white-space:pre-wrap"><strong>${escapeHtml(label)}:</strong> <span${ltr ? ' dir="ltr" style="unicode-bidi:isolate;display:inline-block"' : ''}>${escapeHtml(value)}</span></p>`).join('')}`,
    )
    .join('');
  return { subject, html: layout('he', data.title, content), text };
}
