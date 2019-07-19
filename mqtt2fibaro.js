const http = require('http')
const mqtt = require('mqtt');
const secret = require('./secret');
const config = require('./config.json');
const client  = mqtt.connect('mqtt://localhost');

let lastPropertyValues = {};

console.log("Connecting to MQTT server...");
client.on('connect', function() {
  console.log('Connected');
  const topics = Object.keys(config.topics);

  console.log('Subscribe to:', topics);
  client.subscribe(topics, function (err) {
    if (err) {
      console.log(err);
    } else {
      prepareLastPropertyValues(topics);
    }
  });
});

client.on('message', function(topic, message) {
  let messageObj = JSON.parse(message.toString());
  console.log('Received message', topic, messageObj);

  Object.keys(config.topics[topic].properties).forEach((property) => {
    if (typeof messageObj[property] !== 'undefined') {
      updateFibaroVariable(
        topic,
        property,
        messageObj[property]
      );
    }
  })
});

let prepareLastPropertyValues = function(topics) {
  topics.forEach((topic) => {
    lastPropertyValues[topic] = {};
  });
};

let updateFibaroVariable = function(topic, property, value) {
  let device = config.topics[topic];
  let variableName = device.properties[property].variableName;
  let invokeScenes = device.properties[property].invokeScenes;

  if (value !== lastPropertyValues[topic][property]) {
    console.log('Sending', variableName, value);
    doRequest(variableName, {
      'value': String(value),
      'invokeScenes': invokeScenes
    });
    lastPropertyValues[topic][property] = value;
  }
};

let doRequest = function(variableName, payload) {
  let data = JSON.stringify(payload);

  const req = http.request({
    hostname: secret.hostname,
    auth: secret.auth,
    port: 80,
    path: `/api/globalVariables/${variableName}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }, (res) => {
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
