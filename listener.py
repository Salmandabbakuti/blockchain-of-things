import os
import json
from dotenv import load_dotenv
from web3 import Web3, HTTPProvider
from RPiSim.GPIO import GPIO  # For simulation

# Load environment variables
load_dotenv()

# Define the GPIO pins
pinList = [14, 15, 18, 23, 24, 25, 8, 7, 12, 16, 20, 21, 2, 3, 4, 17, 27, 22, 10, 9, 11, 5, 6, 13, 19, 26]

def setup_gpio_pins():
    """Set up GPIO pins for output."""
    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)
    for pin in pinList:
        GPIO.setup(pin, GPIO.OUT)

def load_contract():
    """Load contract ABI and address, and return the contract instance."""
    rpc_url = os.getenv("RPC_URL", "https://bsc-dataseed.bnbchain.org")
    contract_address = Web3.to_checksum_address(os.getenv("CONTRACT_ADDRESS", "0xf7A218961DA9187BB43171F69581b511876b4d96"))
    
    abi = '{"anonymous": false, "inputs": [{"indexed": true, "internalType": "uint256", "name": "deviceId", "type": "uint256"}, {"indexed": true, "internalType": "uint8", "name": "pin", "type": "uint8"}, {"indexed": false, "internalType": "enum PinController.PinStatus", "name": "status", "type": "uint8"}], "name": "DevicePinStatusChanged", "type": "event"}'
    
    w3 = Web3(HTTPProvider(rpc_url))
    return w3.eth.contract(address=contract_address, abi=abi)

def handle_event(event):
    """Process a DevicePinStatusChanged event and update GPIO accordingly."""
    try:
        print("PinStatusChanged event:", event['args'])
        pin_number = event['args']['pin']
        if pin_number in pinList:
            pin_status = event['args']['status']
            GPIO.output(pin_number, GPIO.HIGH if pin_status else GPIO.LOW)
            print(f'Pin {pin_number} status changed to {"On" if pin_status else "Off"}')
        else:
            print(f'Pin {pin_number} is not in the GPIO Setup. Skipping...')
    except Exception as e:
        print("An error occurred:", e)

def main():
    """Main function to listen for events and update GPIO."""
    contract_instance = load_contract()
    device_id = input("Enter the device id: ")
    
    event_filter = contract_instance.events.DevicePinStatusChanged.create_filter(
        fromBlock="latest", argument_filters={"deviceId": int(device_id)}
    )
    
    setup_gpio_pins()
    print(f"Listening for DevicePinStatusChanged events for device {device_id}")
    
    while True:
        for event in event_filter.get_new_entries():
            handle_event(event)

if __name__ == "__main__":
    main()
