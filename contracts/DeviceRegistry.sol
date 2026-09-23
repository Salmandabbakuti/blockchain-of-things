// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

contract DeviceRegistry {
    enum PinStatus {
        Off,
        On
    }

    // Each unique Device ID consumes exactly one 32-byte storage slot.
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
     * @notice Updates the on/off status of a specific pin.
     * @param _deviceId The unique ID of the device.
     * @param _pin The GPIO pin number (0 to 26).
     * @param _pinStatus The target status (0 = Off, 1 = On).
     */
    function setDevicePinStatus(
        uint256 _deviceId,
        uint8 _pin,
        PinStatus _pinStatus
    ) external {
        // load the current bitmap for the device
        uint256 currentBitmap = deviceBitmaps[msg.sender][_deviceId];

        // Update the bit corresponding to the specified pin
        if (_pinStatus == PinStatus.On) {
            currentBitmap |= 1 << _pin;
        } else {
            currentBitmap &= ~(1 << _pin);
        }

        // Store the updated bitmap back to the mapping
        deviceBitmaps[msg.sender][_deviceId] = currentBitmap;

        emit DevicePinStatusChanged(_deviceId, _pin, _pinStatus, msg.sender);
    }

    /**
     * @notice Resets the entire 256-bit pin status bitmap for a specific device.
     * @dev Useful when device needs to be reinitialized.
     * @param _deviceId The unique ID of the device.
     */

    function resetDeviceBitmap(uint256 _deviceId) external {
        deviceBitmaps[msg.sender][_deviceId] = 0;
        emit DeviceBitmapReset(_deviceId, msg.sender);
    }
}
