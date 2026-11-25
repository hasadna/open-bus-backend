import { escapeHtml, layout, resolveLanguage } from './shared.js';

const failureCopy = {
  he: {
    subject: 'מסירת הפנייה דרך Open Bus לא אומתה',
    message: 'לא הצלחנו לאמת שהפנייה שלך נמסרה למשרד התחבורה.',
    reference: 'מזהה הפנייה',
  },
  en: {
    subject: 'Open Bus complaint delivery could not be confirmed',
    message: 'We could not confirm that your complaint was delivered to the Ministry of Transport.',
    reference: 'Complaint reference',
  },
  ru: {
    subject: 'Не удалось подтвердить доставку обращения Open Bus',
    message: 'Не удалось подтвердить, что ваше обращение было доставлено в Министерство транспорта.',
    reference: 'Идентификатор обращения',
  },
  ar: {
    subject: 'تعذّر تأكيد تسليم الشكوى عبر Open Bus',
    message: 'لم نتمكن من تأكيد تسليم شكواك إلى وزارة المواصلات.',
    reference: 'معرّف الشكوى',
  },
};

const testFailureCopy = {
  he: { subject: 'בדיקת שליחת הפנייה דרך Open Bus נכשלה', message: 'זוהי הודעת כשל מבדיקת שליחה מדומה.' },
  en: { subject: 'Open Bus complaint delivery test failed', message: 'This failure notification is part of a simulated delivery test.' },
  ru: { subject: 'Проверка отправки обращения Open Bus завершилась ошибкой', message: 'Это уведомление об ошибке в рамках тестовой отправки.' },
  ar: { subject: 'فشل اختبار إرسال الشكوى عبر Open Bus', message: 'إشعار الفشل هذا جزء من اختبار إرسال محاكى.' },
};

export function deliveryFailureTemplate(messageId: string, language?: string, debug = false) {
  const lang = resolveLanguage(language);
  const { reference } = failureCopy[lang];
  const { subject, message } = (debug ? testFailureCopy : failureCopy)[lang];
  return {
    subject,
    text: `${message}\n\n${reference}: ${messageId}`,
    html: layout(
      lang,
      subject,
      `<p style="line-height:1.6">${message}</p><p>${reference}: <span dir="ltr" style="unicode-bidi:isolate;display:inline-block">${escapeHtml(messageId)}</span></p>`,
    ),
  };
}
