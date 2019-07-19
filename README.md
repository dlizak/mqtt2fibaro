# mqtt2fibaro
This app is dedicated to users who need to send properties of MQTT based devices to Fibaro Home Center to execute scenes or create Virtual Devices.

## Prerequesties
* Fibaro Home Center (obviously)
* RaspberryPi (or equivalent)
  * Node.js v10.15.2

## Installation
```
sudo git clone https://github.com/dlizak/mqtt-to-fibaro.git /opt/mqtt2fibaro
sudo chown -R pi:pi /opt/mqtt2fibaro

cd /opt/mqtt2fibaro
npm install
```

## Configuration
1. Create global variables in Fibaro's Home Center panel. One for each of device properties.
2. Create `config.json` file in root application directory. This is example for motion sensor and contact sensor:
```json
{
  "fibaroHost": "192.168.1.120",
  "topics": {
    "zigbee2mqtt/0x0017880104b501fc": {
      "properties": {
        "occupancy": {
          "variableName": "sBathroomMotion",
          "invokeScenes": true
        },
        "illuminance": {
          "variableName": "sBathroomIll"
        },
        "temperature": {
          "variableName": "sBathroomTemp"
        },
        "battery": {
          "variableName": "sBathroomBatt"
        }
      }
    },
    "zigbee2mqtt/0x00158d000315fe4f": {
      "properties": {
        "contact": {
          "variableName": "sOfficeWindow",
          "invokeScenes": true
        }
      }
    }
  }
}
```
You can add `"invokeScenes": true` to any property, which you need to execute scenes.

3. Create `secret.json` file in root application directory. This is example for motion sensor and contact sensor:
```
{
  "auth": "your-fibaro-login:your-fibaro-password"
}
```

## Running
```
cd /opt/mqtt2fibaro
node mqtt2fibaro.js
```
