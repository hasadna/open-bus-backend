import { expect } from 'chai';
import { describe, it } from 'mocha';
import { templateBuilder } from '../src/utils/templateBuilder.js';

describe('templateBuilder', () => {
  it('should throw if input does not have userData and databusData', () => {
    expect(() => templateBuilder({})).to.throw('Input must have userData and databusData');
    expect(() => templateBuilder({ userData: {} })).to.throw('Input must have userData and databusData');
    expect(() => templateBuilder({ databusData: {} })).to.throw('Input must have userData and databusData');
  });

  it('should support input structured as { userData, databusData }', () => {
    const xml = templateBuilder({
      userData: {
        firstName: 'נעם',
        lastName: 'געש',
        id: '123456789',
        email: 'noam.gaash@gmail.com',
        phone: '0536218158',
        complaintType: 'no_stop',
        description: "the bus didn't stop, despite I was in the station and waved really hard :(",
      },
      databusData: { operator: 5 },
    });

    expect(xml).to.include('<FirstName>נעם</FirstName>');
    expect(xml).to.include('<LastName>געש</LastName>');
    expect(xml).to.include('<IDNum>123456789</IDNum>');
    expect(xml).to.include('<Email>noam.gaash@gmail.com</Email>');
    expect(xml).to.include('<Phone>0536218158</Phone>');
    expect(xml).to.include('<Operator text="5"></Operator>');
  });
});
