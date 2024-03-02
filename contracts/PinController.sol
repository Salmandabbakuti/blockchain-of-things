// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

contract PinController {
    uint256 public currentDeviceId = 0;

    enum PinStatus {
        Off,
        On
    }

    struct Device {
        uint256 id;
        address owner;
        mapping(uint8 => PinStatus) pinStatus;
    }

    mapping(uint256 => Device) public devices;
    // mapping(uint256 => mapping(uint8 => PinStatus)) public pinStatus;

    modifier onlyDeviceOwner(uint256 _deviceId) {
        require(devices[_deviceId].owner != address(0), "Device does not exist with given id");
        require(devices[_deviceId].owner == msg.sender, "Only device owner can call this function");
        _;
    }

    event DevicePinStatusChanged(uint256 indexed deviceId, uint8 indexed pin, PinStatus status);
    event DeviceOwnershipTransferred(uint256 indexed deviceId, address indexed previousOwner, address indexed newOwner);
    event DeviceRegistered(uint256 indexed deviceId, address indexed owner);


    function registerDevice() external returns (uint256 deviceId) {
        Device storage device = devices[currentDeviceId];
        device.id = currentDeviceId;
        device.owner = msg.sender;
        deviceId = currentDeviceId;
        currentDeviceId++;
        emit DeviceRegistered(device.id, device.owner);
    }
    function setDevicePinStatus(uint256 _deviceId, uint8 _pin, PinStatus _pinStatus) external onlyDeviceOwner(_deviceId) {
        devices[_deviceId].pinStatus[_pin] = _pinStatus;
        // pinStatus[_deviceId][_pin] = _pinStatus;
        emit DevicePinStatusChanged(_deviceId, _pin, _pinStatus); 
    }

    function transferDeviceOwnership(uint256 _deviceId, address _newOwner) external onlyDeviceOwner(_deviceId) {
        address previousOwner = devices[_deviceId].owner;
        devices[_deviceId].owner = _newOwner;
        emit DeviceOwnershipTransferred(_deviceId, previousOwner, _newOwner);
    }

    function getDevicePinStatus(uint256 _deviceId, uint8 _pin) public view returns (PinStatus) {
        return devices[_deviceId].pinStatus[_pin];
    }
}