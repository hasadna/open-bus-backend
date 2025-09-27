import { expect } from 'chai';
import { describe, it } from 'mocha';

import { templateBuilder } from '../src/utils/templateBuilder.js';

describe('templateBuilder', () => {
  it('should throw if input does not have userData and databusData', () => {
    expect(() => templateBuilder({})).to.throw('Input must have userData and databusData');
    expect(() => templateBuilder({ userData: {} })).to.throw('Input must have userData and databusData');
    expect(() => templateBuilder({ databusData: {} })).to.throw('Input must have userData and databusData');
  });

  it('should throw if input id not valid', () => {
    expect(() =>
      templateBuilder({
        databusData: { operator: 5 },
        userData: {
          complaintType: 'no_stop',
          description: "the bus didn't stop, despite I was in the station and waved really hard :(",
          email: 'noam.gaash@gmail.com',
          firstName: 'נעם',
          id: '123456789',
          lastName: 'געש',
          phone: '0536218158',
        },
      }),
    ).to.throw('Invalid Id Number');
  });

  it('should support input structured as { userData, databusData }', () => {
    const xml = templateBuilder({
      databusData: { operator: 5 },
      userData: {
        complaintType: 'no_stop',
        description: "the bus didn't stop, despite I was in the station and waved really hard :(",
        email: 'noam.gaash@gmail.com',
        firstName: 'נעם',
        id: '212121214',
        lastName: 'געש',
        phone: '0536218158',
      },
    });

    expect(xml).to.include('<FirstName>נעם</FirstName>');
    expect(xml).to.include('<LastName>געש</LastName>');
    expect(xml).to.include('<IDNum>212121214</IDNum>');
    expect(xml).to.include('<Email>noam.gaash@gmail.com</Email>');
    expect(xml).to.include('<Phone>0536218158</Phone>');
    expect(xml).to.include('<Operator text="5"></Operator>');
  });
});
