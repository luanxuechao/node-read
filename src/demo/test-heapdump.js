const {EventEmitter} = require('events');
const heapdump = require('heapdump');
global.test = new EventEmitter();
heapdump.writeSnapshot('./' + Date.now() + '.heapsnapshot');
function run3() {
  const innerData = new Buffer(100);
  const outClosure3 = function () {
    void innerData;
  };
  test.on('error', () => {
    console.log('error');
  });
  outClosure3();
  test.removeListener('error', () => {
    console.log(' off error');
  });
}
for(let i = 0; i < 20; i++) {
  run3();
}
gc();
heapdump.writeSnapshot('./' + Date.now() + '.heapsnapshot');