/* eslint-disable no-bitwise */
import base64 from 'react-native-base64';
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from 'react-native-ble-plx';

const NANOBLUE33_SERVICE_UUID = '0000180c-0000-1000-8000-00805f9b34fb';
// const HEART_RATE_CHARACTERISTIC = '00002a56-0000-1000-8000-00805f9b34fb';
const WRITE_CHARACTERISTIC = '00002a56-0000-1000-8000-00805f9b34fb';
const OP_BLE_UUID_GPS = "38098fbb-6d25-499a-a6a0-fe2eb8c3d2d3";
const OP_BLE_UUID_OPCOM = "bad92b28-d3ec-4362-808b-8113286cc3e3";
class BluetoothLeManager {
  bleManager: BleManager;
  device: Device | null;

  constructor() {
    this.bleManager = new BleManager();
    this.device = null;
  }

  scanForPeripherals = (
    onDeviceFound: (arg0: {
      type: string;
      payload: BleError | Device | null;
    }) => void,
  ) => {
    this.bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
      onDeviceFound({type: 'SAMPLE', payload: scannedDevice ?? error});
      return;
    });
    return () => {
      this.bleManager.stopDeviceScan();
    };
  };

  stopScanningForPeripherals = () => {
    this.bleManager.stopDeviceScan();
  };

  connectToPeripheral = async (identifier: string) => {
    this.device = await this.bleManager.connectToDevice(identifier);
  };

  onHeartRateUpdate = (
    // error: BleError | null,
    characteristic: Characteristic | null,
    emitter: (arg0: {payload: number | BleError}) => void,
  ) => {
    // if (error) {
    //   emitter({payload: error});
    // }
    console.log("TEST: " + characteristic?.id);
    console.log("TEST: " + characteristic?.uuid);
    console.log("TEST: " + characteristic?.serviceID);
    console.log("TEST: " + characteristic?.serviceUUID);

    console.log("TEST: " + characteristic?.value);
    const data = base64.decode(characteristic?.value ?? '');
    let heartRate: number = -1;
    console.log("---------------------DATA----------------:" + data);

    // const firstBitValue: number = (<any>data[0]) & 0x01;

    // if (firstBitValue === 0) {
    //   heartRate = data[1].charCodeAt(0);
    // } else {
    //   heartRate =
    //     Number(data[1].charCodeAt(0) << 8) + Number(data[2].charCodeAt(2));
    // }

    heartRate = parseInt(data);

    emitter({payload: heartRate});
  };

  startStreamingData = async (
    emitter: (arg0: {payload: number | BleError}) => void,
  ) => {
    await this.device?.discoverAllServicesAndCharacteristics();
    // this.device?.monitorCharacteristicForService(
    //   NANOBLUE33_SERVICE_UUID,
    //   HEART_RATE_CHARACTERISTIC,
    //   (error, characteristic) =>
    //     this.onHeartRateUpdate(error, characteristic, emitter),
    // );
    this.device?.readCharacteristicForService(
      OP_BLE_UUID_OPCOM,
      WRITE_CHARACTERISTIC,
      // (error, characteristic) => {
      //   this.onHeartRateUpdate(error, characteristic, emitter);
      // }
    ).then((characteristic) => {
      console.log("Characteristic: " + characteristic.id);
      this.onHeartRateUpdate(characteristic, emitter);
    })
  };
  sendBLEWriteString = async (
    // emitter: (arg0: {payload: number | BleError}) => void,
    myValue: string,
  ) => {
    console.log("SEND BLE WRITE " + myValue)
    await this.device?.discoverAllServicesAndCharacteristics();
    this.device?.writeCharacteristicWithResponseForService(
      OP_BLE_UUID_OPCOM,
      OP_BLE_UUID_GPS,
      myValue
    ).then((characteristic) => {
      console.log("Characteristic: " + characteristic.id);
      // this.onHeartRateUpdate(characteristic, emitter);
    })
  };

}

const bluetoothLeManager = new BluetoothLeManager();

export default bluetoothLeManager;
