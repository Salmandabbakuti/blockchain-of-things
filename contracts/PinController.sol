// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

contract PinController {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    enum PinStatus {
        Off,
        On
    }
    mapping(uint8 => PinStatus) public pinStatus;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    event PinStatusChanged(uint8 pin, PinStatus status);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function setPinStatus(uint8 _pin, PinStatus _pinStatus) public onlyOwner {
        pinStatus[_pin] = _pinStatus;
        emit PinStatusChanged(_pin, _pinStatus);
    }

    function transferOwnership(address _newOwner) public onlyOwner {
        owner = _newOwner;
        emit OwnershipTransferred(msg.sender, _newOwner);
    }
}