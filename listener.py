import os
import asyncio
from dotenv import load_dotenv
from web3 import AsyncWeb3, WebSocketProvider
from RPiSim.GPIO import GPIO  # For simulation

# Load environment variables
load_dotenv()

WSS_URL = os.getenv("WSS_URL", "wss://ethereum-sepolia-rpc.publicnode.com")
CONTRACT_ADDRESS = os.getenv(
    "CONTRACT_ADDRESS", "0x0db6d7f70754f0acd4ab664f4e3ace9f6c5f08c9"
)

PIN_LIST = [
    14,
    15,
    18,
    23,
    24,
    25,
    8,
    7,
    12,
    16,
    20,
    21,
    2,
    3,
    4,
    17,
    27,
    22,
    10,
    9,
    11,
    5,
    6,
    13,
    19,
    26,
]


def setup_gpio_pins():
    """Set up GPIO pins for output."""
    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)
    for pin in PIN_LIST:
        GPIO.setup(pin, GPIO.OUT)


async def main():
    """Listen for DevicePinStatusChanged events."""

    # Get filters before opening the WebSocket connection
    device_id = int(input("Enter the device id: "))
    owner_address = input("Enter the owner address: ")

    w3 = AsyncWeb3(WebSocketProvider(WSS_URL))

    try:
        setup_gpio_pins()
        await w3.provider.connect()
        print("Connected to WebSocket provider.")

        event_topic = w3.keccak(
            text="DevicePinStatusChanged(uint256,uint8,uint8,address)"
        )

        device_id_topic = device_id.to_bytes(32, "big")

        owner_topic = bytes.fromhex(owner_address[2:].lower().zfill(64))

        subscription_id = await w3.eth.subscribe(
            "logs",
            {
                "address": w3.to_checksum_address(CONTRACT_ADDRESS),
                "topics": [
                    event_topic,
                    device_id_topic,
                    None,  # any pin
                    owner_topic,
                ],
            },
        )

        print(
            f"Listening for DevicePinStatusChanged events "
            f"for device {device_id} of {owner_address}"
        )

        async for response in w3.socket.process_subscriptions():

            log = response["result"]
            # decode pin and status from logs, decode device_id, owner if needed for validation
            pin_number = int.from_bytes(
                log["topics"][2],
                "big",
            )

            # status is the non-indexed value
            pin_status = int.from_bytes(
                log["data"],
                "big",
            )

            if pin_number not in PIN_LIST:
                print(f"Pin {pin_number} is not in the GPIO Setup. Skipping...")
                continue  # skips the execution

            GPIO.output(pin_number, GPIO.HIGH if pin_status else GPIO.LOW)
            print(f"Pin {pin_number} status changed to {'On' if pin_status else 'Off'}")
    except Exception as e:
        print("An error occurred:", e)

    finally:
        GPIO.cleanup()
        await w3.provider.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
