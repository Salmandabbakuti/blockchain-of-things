// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

contract DeviceRegistry {
    
    enum PinStatus {
        Off,
        On
    }

    // Mapping: Owner Address => Device ID => 256-bit Pin Bitmap
    // Each unique Device ID consumes exactly one 32-byte storage slot.
    mapping(address owner => mapping(uint256 deviceId => uint256)) internal deviceBitmaps;

    event DevicePinStatusChanged(
        uint256 indexed deviceId,
        uint8 indexed pin,
        PinStatus status,
        address indexed owner
    );

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
        // Cache the current bitmask in memory to save gas on lookups
        uint256 currentBitmap = deviceBitmaps[msg.sender][_deviceId];

        if (_pinStatus == PinStatus.On) {
            // Flip the target pin bit to 1 using bitwise OR (|)
            deviceBitmaps[msg.sender][_deviceId] = currentBitmap | (1 << _pin);
        } else {
            // Flip the target pin bit to 0 using bitwise AND (&) and NOT (~)
            deviceBitmaps[msg.sender][_deviceId] = currentBitmap & ~(1 << _pin);
        }

        emit DevicePinStatusChanged(_deviceId, _pin, _pinStatus, msg.sender);
    }

    /**
     * @notice gets the pin status of caller's device.
     * 
     */
    function getDevicePinStatus(
        uint256 _deviceId,
        uint8 _pin
    ) public view returns (PinStatus) {
        // Shift the bitmask right and check the lowest bit value
        uint256 bit = (deviceBitmaps[msg.sender][_deviceId] >> _pin) & 1;
        return PinStatus(bit);
    }

    /**
     * @notice Fetches the full 256-bit status map of a caller device.
     * 
     */
    function getFullDeviceBitmap(uint256 _deviceId) external view returns (uint256) {
        return deviceBitmaps[msg.sender][_deviceId];
    }
}
