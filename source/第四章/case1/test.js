var assert = require('assert');
var expect = require('expect');
var sampleProvinceData = require('./index').sampleProvinceData;
var Province = require('./Province').Province;

describe('province', () => {
  let asia;

  beforeEach(() => {
    asia = new Province(sampleProvinceData());
  });

  it('shortfall', () => {
    assert.equal(asia.shortfall, 5);
  });

  it('profit', () => {
    expect(asia.profit).toEqual(240);
  });
});

describe('no producers', () => {
  let noProducers;
  
  beforeEach(() => {
    const data = {
      name: "No producers",
      producers: [],
      demand: 30,
      price: 20,
    };
    noProducers = new Province(data);
  });

  it('shortfall', () => {
    assert.equal(noProducers.shortfall, 30);
  });

  it('profit', () => {
    expect(noProducers.profit).toEqual(0);
  });
})