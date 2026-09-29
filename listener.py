import os
import asyncio
from datetime import datetime
from dotenv import load_dotenv
from web3 import Web3, AsyncWeb3, WebSocketProvider
from web3.exceptions import Web3Exception
from gpiozero import DigitalOutputDevice

# Load environment variables
# includes pin factory setting for gpiozero (mock/simulation or native)
load_dotenv()

WSS_URL = os.getenv("WSS_URL", "wss://ethereum-sepolia-rpc.publicnode.com")
CONTRACT_ADDRESS = os.getenv(
    "CONTRACT_ADDRESS", "0x973702bfe1Ee5f7Fff560Ad409527D3Bf7Bb5865"
)

# Initialize GPIO pins for Raspberry Pi(2-27) (BCM numbering)
gpio_devices = {pin: DigitalOutputDevice(pin) for pin in range(2, 28)}


async def main():
    """Listen for DevicePinStatusChanged events."""

    # Get filters before opening the WebSocket connection
    device_id = int(input("Enter the device id: "))
    owner_address = Web3.to_checksum_address(input("Enter the owner address: ").strip())
    owner_address_ellipsized = f"{owner_address[:6]}...{owner_address[-4:]}"

    # Use async with context manager to safely open and auto-close the socket
    async with AsyncWeb3(WebSocketProvider(WSS_URL)) as w3:
        print("Connected to WebSocket provider.")

        # Read current bitmap for the device and owner
        selector = w3.keccak(text="deviceBitmaps(address,uint256)")[:4]
        owner_bytes = bytes.fromhex(owner_address[2:].zfill(64))
        device_id_bytes = device_id.to_bytes(32, "big")
        contract_address_checksum = w3.to_checksum_address(CONTRACT_ADDRESS)

        calldata = selector + owner_bytes + device_id_bytes

        result = await w3.eth.call({"to": contract_address_checksum, "data": calldata})

        current_bitmap = int.from_bytes(result, "big")

        for pin, gpio_device in gpio_devices.items():
            pin_status = (current_bitmap >> pin) & 1
            
            # Assign the pin status to the GPIO device(1 for ON, 0 for OFF)
            gpio_device.value = pin_status
            
            print(
                f"[{owner_address_ellipsized}][{device_id}] "
                f"GPIO {pin} → "
                f"{'🟢 ON' if gpio_device.value else '⚫️ OFF'}"
            )

        event_topic = w3.keccak(
            text="DevicePinStatusChanged(uint256,uint8,uint8,address)"
        )

        await w3.eth.subscribe(
            "logs",
            {
                "address": contract_address_checksum,
                "topics": [event_topic, device_id_bytes, None, owner_bytes],  # any pin
            },
        )

        print(
            f"Listening for DevicePinStatusChanged events "
            f"for device {device_id} of {owner_address_ellipsized}"
        )

        async for response in w3.socket.process_subscriptions():

            log = response["result"]
            # decode pin and status from logs, decode device_id, owner if needed for validation
            pin_number = int.from_bytes(
                log["topics"][2],
                "big",
            )

            if pin_number not in gpio_devices:
                print(f"Pin {pin_number} is not in the GPIO Setup. Skipping...")
                continue  # skips the execution

            # decode pin status from the non-indexed log data
            pin_status = int.from_bytes(
                log["data"],
                "big",
            )

            # Assign the pin status to the GPIO device(1 for ON, 0 for OFF)
            gpio_device = gpio_devices[pin_number]
            gpio_device.value = pin_status
            
            # print the event details with timestamp
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(
                f"[{timestamp}]: "
                f"[{owner_address_ellipsized}][{device_id}] "
                f"GPIO {pin_number} → "
                f"{'🟢 ON' if gpio_device.value else '⚫️ OFF'}"
            )


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Stopping...")
    except Web3Exception as w3e:
        print("web3 exception occurred:", w3e)
    except Exception as e:
        print("An unexpected error occurred:", e)
