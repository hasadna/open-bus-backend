import { escapeHtml, layout, resolveLanguage } from './shared.js';

const failureCopy = {
  he: {
    subject: 'שליחת הפנייה דרך Open Bus נכשלה',
    message: 'לא הצלחנו למסור את הפנייה שלך למשרד התחבורה.',
    retry: 'נא לנסות להגיש את הפנייה שוב.',
    reference: 'מזהה הפנייה',
  },
  en: {
    subject: 'Open Bus complaint delivery failed',
    message: 'We could not deliver your complaint to the Ministry of Transport.',
    retry: 'Please try submitting your complaint again.',
    reference: 'Complaint reference',
  },
  ru: {
    subject: 'Не удалось доставить обращение Open Bus',
    message: 'Не удалось доставить ваше обращение в Министерство транспорта.',
    retry: 'Пожалуйста, попробуйте отправить обращение ещё раз.',
    reference: 'Идентификатор обращения',
  },
  ar: {
    subject: 'تعذّر تسليم الشكوى عبر Open Bus',
    message: 'لم نتمكن من تسليم شكواك إلى وزارة المواصلات.',
    retry: 'يرجى محاولة تقديم الشكوى مرة أخرى.',
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
  const { reference, retry } = failureCopy[lang];
  const { subject, message } = (debug ? testFailureCopy : failureCopy)[lang];
  return {
    subject,
    text: `${message}${debug ? '' : `\n${retry}`}\n\n${reference}: ${messageId}`,
    html: layout(
      lang,
      subject,
      `<p style="line-height:1.6">${message}</p>${debug ? '' : `<p style="line-height:1.6">${retry}</p>`}<p>${reference}: <span dir="ltr" style="unicode-bidi:isolate;display:inline-block">${escapeHtml(messageId)}</span></p>`,
    ),
  };
}
