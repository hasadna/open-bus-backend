import { escapeHtml, layout, resolveLanguage } from './shared.js';

const failureCopy = {
  he: {
    subject: 'שליחת הפנייה דרך Open Bus נכשלה',
    message: 'לא הצלחנו למסור את הפנייה שלך למשרד התחבורה.',
    retry: 'נא לנסות להגיש את הפנייה שוב.',
    reference: 'מזהה הודעת הפנייה',
  },
  en: {
    subject: 'Open Bus complaint delivery failed',
    message: 'We could not deliver your complaint to the Ministry of Transport.',
    retry: 'Please try submitting your complaint again.',
    reference: 'Complaint email reference',
  },
  ru: {
    subject: 'Не удалось доставить обращение Open Bus',
    message: 'Не удалось доставить ваше обращение в Министерство транспорта.',
    retry: 'Пожалуйста, попробуйте отправить обращение ещё раз.',
    reference: 'Идентификатор письма с обращением',
  },
  ar: {
    subject: 'تعذّر تسليم الشكوى عبر Open Bus',
    message: 'لم نتمكن من تسليم شكواك إلى وزارة المواصلات.',
    retry: 'يرجى محاولة تقديم الشكوى مرة أخرى.',
    reference: 'معرّف رسالة الشكوى',
  },
};

export function deliveryFailureTemplate(emailId, language) {
  const lang = resolveLanguage(language);
  const copy = failureCopy[lang];
  return {
    subject: copy.subject,
    text: `${copy.message}\n${copy.retry}\n\n${copy.reference}: ${emailId}`,
    html: layout(
      lang,
      copy.subject,
      `<p style="line-height:1.6">${copy.message}</p><p style="line-height:1.6">${copy.retry}</p><p>${copy.reference}: <span dir="ltr" style="unicode-bidi:isolate;display:inline-block">${escapeHtml(emailId)}</span></p>`,
    ),
  };
}
