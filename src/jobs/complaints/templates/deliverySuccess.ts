import { escapeHtml, layout, resolveLanguage } from './shared.js';

const successCopy = {
  he: { subject: 'בדיקת שליחת הפנייה דרך Open Bus הצליחה', reference: 'מזהה הפנייה' },
  en: { subject: 'Open Bus complaint delivery test succeeded', reference: 'Complaint reference' },
  ru: { subject: 'Проверка отправки обращения Open Bus прошла успешно', reference: 'Номер обращения' },
  ar: { subject: 'نجح اختبار إرسال الشكوى عبر Open Bus', reference: 'معرّف الشكوى' },
};

export function deliverySuccessTemplate(messageId: string, language?: string) {
  const lang = resolveLanguage(language);
  const { subject, reference } = successCopy[lang];
  return {
    subject,
    text: `${subject}\n\n${reference}: ${messageId}`,
    html: layout(lang, subject, `<p>${reference}: <bdi dir="ltr">${escapeHtml(messageId)}</bdi></p>`),
  };
}
