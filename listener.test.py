import os
import asyncio
from datetime import datetime
from dotenv import load_dotenv
from web3 import AsyncWeb3, WebSocketProvider

# Load environment variables
load_dotenv()

WSS_URL = os.getenv("WSS_URL", "wss://ethereum-sepolia-rpc.publicnode.com")
CONTRACT_ADDRESS = os.getenv(
    "CONTRACT_ADDRESS", "0xbDe07ed4Da072DcBDb4348667cd74d155712dDAe"
)

PIN_LIST = [
    2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
]

CONTRACT_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address",
            },
            {
                "internalType": "uint256",
                "name": "deviceId",
                "type": "uint256",
            },
        ],
        "name": "deviceBitmaps",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256",
            }
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": True,
                "internalType": "uint256",
                "name": "deviceId",
                "type": "uint256",
            },
            {
                "indexed": True,
                "internalType": "uint8",
                "name": "pin",
                "type": "uint8",
            },
            {
                "indexed": False,
                "internalType": "uint8",
                "name": "status",
                "type": "uint8",
            },
            {
                "indexed": True,
                "internalType": "address",
                "name": "owner",
                "type": "address",
            },
        ],
        "name": "DevicePinStatusChanged",
        "type": "event",
    },
]


async def main():
    """Listen for DevicePinStatusChanged events."""

    # Get filters before opening the WebSocket connection
    device_id = int(input("Enter the device id: "))
    owner_address = input("Enter the owner address: ")
    owner_address_ellipsized = f"{owner_address[:6]}...{owner_address[-4:]}"

    w3 = AsyncWeb3(WebSocketProvider(WSS_URL))

    try:
        await w3.provider.connect()
        print("Connected to WebSocket provider.")

        # contract instance
        contract = w3.eth.contract(
            address=w3.to_checksum_address(CONTRACT_ADDRESS),
            abi=CONTRACT_ABI,
        )
        print("Syncing device pin states with the contract...")
        # Read current bitmap for the device and owner
        current_bitmap = await contract.functions.deviceBitmaps(
            owner_address, device_id
        ).call()

        for pin in PIN_LIST:
            pin_status = (current_bitmap >> pin) & 1
            print(
                f"[{owner_address_ellipsized}][{device_id}] "
                f"GPIO {pin} → "
                f"{'🟢 ON' if pin_status else '⚫️ OFF'}"
            )

        event = contract.events.DevicePinStatusChanged()

        device_id_topic = device_id.to_bytes(32, "big")

        owner_topic = bytes.fromhex(owner_address[2:].lower().zfill(64))

        subscription_id = await w3.eth.subscribe(
            "logs",
            {
                "address": w3.to_checksum_address(CONTRACT_ADDRESS),
                "topics": [
                    event.topic,
                    device_id_topic,
                    None,  # any pin
                    owner_topic,
                ],
            },
        )

        print(
            f"Listening for DevicePinStatusChanged events "
            f"for device {device_id} of {owner_address_ellipsized}"
        )

        async for response in w3.socket.process_subscriptions():

            log = response["result"]
            # decode pin and status from logs, decode device_id, owner if needed for validation
            decoded_event = event.processLog(log)
            event_args = decoded_event["args"]
            pin_number = event_args["pin"]
            pin_status = event_args["status"]


            # print the event details with timestamp
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(
                f"[{timestamp}]: "
                f"[{owner_address_ellipsized}][{device_id}] "
                f"GPIO {pin_number} → "
                f"{'🟢 ON' if pin_status else '⚫️ OFF'}"
            )
            
    except Exception as e:
        print("An error occurred:", e)

    finally:
        await w3.provider.disconnect()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Stopping...")
