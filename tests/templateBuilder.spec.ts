import { templateBuilder } from '../src/utils/templateBuilder';

describe('templateBuilder', () => {
  it('should throw if input does not have userData and databusData', () => {
    expect(() => templateBuilder({})).toThrow('Input must have userData and databusData');
    expect(() => templateBuilder({ userData: {} })).toThrow('Input must have userData and databusData');
    expect(() => templateBuilder({ databusData: {} })).toThrow('Input must have userData and databusData');
  });

  it('should support input structured as { userData, databusData }', () => {
    const xml = templateBuilder({
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
    });

    expect(xml).toContain('<FirstName>נעם</FirstName>');
    expect(xml).toContain('<LastName>געש</LastName>');
    expect(xml).toContain('<IDNum>123456789</IDNum>');
    expect(xml).toContain('<Email>noam.gaash@gmail.com</Email>');
    expect(xml).toContain('<Phone>0536218158</Phone>');
    expect(xml).toContain('<Operator text="5"></Operator>');
  });
});
