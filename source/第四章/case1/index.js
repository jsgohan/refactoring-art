exports.sampleProvinceData =  function sampleProvinceData() {
  return {
    name: 'Asia',
    producers: [{
      name: 'Byzantium',
      cost: 10,
      production: 9
    }, {
      name: 'Attalia',
      cost: 11,
      production: 10
    }, {
      name: 'Sinope',
      cost: 10,
      production: 6
    }],
    demand: 30,
    price: 20
  };
}
