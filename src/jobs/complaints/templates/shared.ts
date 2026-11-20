export const languageNames = { he: 'עברית', en: 'אנגלית', ru: 'רוסית', ar: 'ערבית' };

export const supportedLanguages = Object.keys(languageNames);

export type Language = keyof typeof languageNames;

export const resolveLanguage = (...languages: (string | undefined)[]): Language =>
  languages.find((lang): lang is Language => lang !== undefined && supportedLanguages.includes(lang)) || 'he';

export const escapeHtml = (value: string) =>
  String(value).replace(/[&<>"']/gu, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);

export const layout = (lang: keyof typeof languageNames, title: string, content: string) => {
  const direction = ['he', 'ar'].includes(lang) ? 'rtl' : 'ltr';
  return `<!doctype html><html lang="${lang}" dir="${direction}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#f3f5f7;font-family:Arial,sans-serif;color:#172b3a"><div dir="${direction}" style="max-width:640px;margin:24px auto;padding:24px;background:#fff;border:1px solid #dce3e8;text-align:${direction === 'rtl' ? 'right' : 'left'}"><p style="color:#346579;font-weight:bold">Open Bus</p><h1 style="font-size:24px">${escapeHtml(title)}</h1>${content}</div></body></html>`;
};
