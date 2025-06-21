import { expect } from 'chai';
import { buildXmlFrom } from '../gov_api/template_builder.js';

describe('buildXmlFrom', () => {
  it('should generate XML with default values when given empty object', () => {
    const xml = buildXmlFrom({});
    expect(xml).to.be.a('string');
    expect(xml).to.include('<?xml version="1.0" encoding="utf-8"?>');
    expect(xml).to.include('<UserUImode>AGFrom2Html</UserUImode>');
    expect(xml).to.include('<FirstName></FirstName>');
    expect(xml).to.include('<Mobile></Mobile>');
    expect(xml).to.include('<FinanceRavKav>true</FinanceRavKav>');
  });

  it('should fill personal details when provided', () => {
    const xml = buildXmlFrom({
      dataModelSaver: {
        personalDetails: {
          firstName: 'John',
          lastName: 'Doe',
          iDNum: '123456789',
          mobile: '0501234567',
          email: 'john@example.com',
          city: { dataText: 'Tel Aviv' },
        },
      },
    });
    expect(xml).to.include('<FirstName>John</FirstName>');
    expect(xml).to.include('<LastName>Doe</LastName>');
    expect(xml).to.include('<IDNum>123456789</IDNum>');
    expect(xml).to.include('<Mobile>0501234567</Mobile>');
    expect(xml).to.include('<Email>john@example.com</Email>');
    expect(xml).to.include('<Settlement text="Tel Aviv"></Settlement>');
  });

  it('should handle document attachment', () => {
    const xml = buildXmlFrom({
      dataModelSaver: {
        documentAttachment: {
          documentsList: [{ attacmentName: 'file.pdf' }],
        },
      },
    });
    expect(xml).to.include('<AttachDocument fileName="file.pdf" />');
  });
});
