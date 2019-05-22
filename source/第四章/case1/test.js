var assert = require('assert');
var sampleProvinceData = require('./index').sampleProvinceData;
var Province = require('./Province').Province;

describe('province', () => {
  it('shortfall', () => {
    const asia = new Province(sampleProvinceData());
    assert.equal(asia.shortfall, 5);
  });
});
