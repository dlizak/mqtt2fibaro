const http = require('http')
const mqtt = require('mqtt');
const secret = require('./secret');
const devices = require('./devices');
const client  = mqtt.connect('mqtt://localhost');

client.on('connect', function() {
  console.log('connected');

  client.subscribe('zigbee2mqtt/+', function (err) {
    // subscription error
  });
});

client.on('message', function(topic, message) {
  var messageObj = JSON.parse(message.toString());
  // console.log(topic, messageObj);

  if (typeof messageObj.occupancy !== 'undefined') {
    updateFibaroMotionSensorVariable(topic, messageObj.occupancy);
  }

  if (typeof messageObj.contact !== 'undefined') {
    updateFibaroWindowSensorVariable(topic, messageObj.contact);
  }
});

var updateFibaroMotionSensorVariable = function(topic, val) {
  var name = devices.motionSensors[topic];
  var value = val ? 'on' : 'off';

  console.log(name, value);
  doRequest(name, value);
};

var updateFibaroWindowSensorVariable = function(topic, val) {
  var name = devices.windowSensors[topic];
  var value = val ? 'closed' : 'open';

  console.log(name, value);
  doRequest(name, value);
};

var doRequest = function(name, value) {
  var data = JSON.stringify({
    'value': value,
    'invokeScenes': true
  });

  const options = {
    hostname: secret.hostname,
    auth: secret.auth,
    port: 80,
    path: `/api/globalVariables/${name}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });

  req.on('error', (error) => {
    console.error(error);
  });

  req.write(data);
  req.end();
}
