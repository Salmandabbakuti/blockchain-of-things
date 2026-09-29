// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

contract DeviceRegistry {
    enum PinStatus {
        Off,
        On
    }

    /// @notice Stores the GPIO pin states for each device as a 256-bit bitmap.
    mapping(address owner => mapping(uint256 deviceId => uint256 bitmap))
        public deviceBitmaps;

    event DevicePinStatusChanged(
        uint256 indexed deviceId,
        uint8 indexed pin,
        PinStatus status,
        address indexed owner
    );

    event DeviceBitmapReset(uint256 indexed deviceId, address indexed owner);

    /**
     * @notice Sets the GPIO pin status of caller's device.
     * @param _deviceId ID of the device.
     * @param _pin GPIO pin number (2-27).
     * @param _pinStatus Target pin status(On or Off).
     */
    function setDevicePinStatus(
        uint256 _deviceId,
        uint8 _pin,
        PinStatus _pinStatus
    ) external {
        require(_pin >= 2 && _pin <= 27, "Invalid pin");

        uint256 currentBitmap = deviceBitmaps[msg.sender][_deviceId];

        if (_pinStatus == PinStatus.On) {
            currentBitmap |= 1 << _pin;
        } else {
            currentBitmap &= ~(1 << _pin);
        }

        deviceBitmaps[msg.sender][_deviceId] = currentBitmap;

        emit DevicePinStatusChanged(_deviceId, _pin, _pinStatus, msg.sender);
    }

    /**
     * @notice Resets all GPIO pin states of caller's device.
     * @param _deviceId ID of the device.
     */
    function resetDeviceBitmap(uint256 _deviceId) external {
        deviceBitmaps[msg.sender][_deviceId] = 0;

        emit DeviceBitmapReset(_deviceId, msg.sender);
    }
}
