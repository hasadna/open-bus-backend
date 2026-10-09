import { expect } from 'chai';
import { describe, it } from 'mocha';

import { complaintTemplate } from '../src/templates/complaint.js';
import { deliveryFailureTemplate } from '../src/templates/deliveryFailure.js';
import { resolveLanguage } from '../src/templates/shared.js';

describe('email templates', () => {
  const names = { he: 'עברית', en: 'אנגלית', ru: 'רוסית', ar: 'ערבית' };
  for (const [lang, name] of Object.entries(names)) {
    it(`keeps complaints Hebrew and shows the ${lang} preference`, () => {
      for (const transport of ['bus', 'train', 'taxi']) {
        const result = complaintTemplate({ title: 'Test', email: 'rider@example.com', lang, [transport]: {} });
        expect(result.html).to.include('lang="he" dir="rtl"');
        expect(result.text).to.include(`שפת הפונה: ${name}`);
        expect(result.text).not.to.include('undefined');
        expect(result.text).not.to.include('פרטי האירוע');
      }
    });

    it(`localizes failure notices in ${lang}`, () => {
      const result = deliveryFailureTemplate('email-123', lang);
      expect(result.html).to.include(`lang="${lang}" dir="${['he', 'ar'].includes(lang) ? 'rtl' : 'ltr'}"`);
      expect(result.html).to.include(result.subject);
      expect(result.text).to.include('email-123');
      expect(result.html).to.include('dir="ltr" style="unicode-bidi:isolate;display:inline-block">email-123');
    });
  }

  it('preserves submitted text and escapes HTML in all dynamic fields', () => {
    const result = complaintTemplate({
      title: '<script>&"\'',
      details: 'First line\n<b>Second line</b>',
      bus: { operator: { dataText: '<Operator>', dataCode: 0 } },
    });
    expect(result.html).to.include('&lt;script&gt;&amp;&quot;&#39;');
    expect(result.html).not.to.include('<script>');
    expect(result.html).to.include('First line\n&lt;b&gt;Second line&lt;/b&gt;');
    expect(result.text).to.include('First line\n<b>Second line</b>');
    expect(result.text).to.include('<Operator> / 0');
    expect(deliveryFailureTemplate('<reference>', 'en').html).to.include('&lt;reference&gt;');
  });

  it('defaults missing or invalid language to Hebrew and accepts the next valid fallback', () => {
    expect(resolveLanguage()).to.equal('he');
    expect(resolveLanguage('invalid')).to.equal('he');
    expect(resolveLanguage('invalid', 'ru')).to.equal('ru');
    expect(complaintTemplate({ title: 'Test', bus: {} }).text).to.include('שפת הפונה: עברית');
    expect(deliveryFailureTemplate('email-123').html).to.include('lang="he"');
  });
});
