# DePIN Raspi Connect

DePIN Raspi Connect is a Raspberry Pi-based IoT project designed for home automation with blockchain integration. The project allows users to control home devices securely and efficiently using blockchain technology, ensuring trust, security, and authentication among IoT devices.

DePIN Raspi Connect leverages the power of Raspberry Pi's GPIO pins to control home devices while integrating blockchain technology for enhanced security and trust among connected devices. The project includes a smart contract system that stores and updates pin statuses with access control by the owner. When authorized users update pin statuses, the contract emits events with the respective device id, pin number and status. A Python listener then detects these events and updates the Raspberry Pi pins accordingly, simulating device control in a secure and decentralized manner.

### Architecture

![Untitled Diagram drawio (1)](https://github.com/Salmandabbakuti/depin-bnb-hack/assets/29351207/7e1e5b3c-6a84-434b-9b17-cfbe6aaacdc4)

## Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/en/download/)
- [Python 3+](https://www.python.org/downloads/)
- Windows 8+ (for simulating GPIO pins)
- [Windows Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) - Only for Windows (Simulating GPIO pins on Windows)
- [Raspberry Pi](https://www.raspberrypi.org/products/raspberry-pi-4-model-b/) (for actual GPIO pins)

### Steps

This project consists of three main components:

#### 1. Compiling and Deploying Contract

> Copy `.env.example` to `.env` and fill in the required environment variables.

1. Install required dependencies

```bash
npm install
```

2. Compile the contract

```bash
npx hardhat compile
```

3. Set Private Key to hardhat config variables (For deploying contract to network. Make sure you dont use your primary account)

```bash
npx hardhat vars set PRIVATE_KEY
```

3. Deploy the contract

```bash
npx hardhat run scripts/deploy.ts --network <network>
```

#### 2. Starting Client

> Copy `client/.env.example` to `client/.env` and fill in the deployed contract address and other required environment variables.

1. Install required dependencies

```bash
cd client

npm install
```

2. Start the client

```bash

npm run dev
```

3. Navigate to `http://localhost:3000` in your browser to see the client. Connect your wallet and start using the app.

4. Register Device with the contract by clicking the "+ Device" button in the client interface.

5. Load the control panel with registered device Id by entering device Id and click on arrow button.

![usage_screen](https://github.com/Salmandabbakuti/depin-bnb-hack/assets/29351207/78e0995b-e591-4278-8c0c-f6746cf54163)

#### 3. Setup Contract Event Listener and Rasp Pi GPIO Simulator

> Copy `.env.example` to `.env` and fill in the contract address and RPC URL.

1. Install required dependencies

```bash
pip install -r requirements.txt
```

2. Run the event listener

```bash
python listener.py
```

3. Enter the registered device Id in previous step when prompted.

![listener_prompt](https://github.com/Salmandabbakuti/depin-bnb-hack/assets/29351207/d67ab995-0ceb-4c37-9a76-db3d6473bce3)

## Usage

1. Connect your wallet to the client interface and register a device with the contract.

2. Load the control panel with registered device Id by entering device Id and click on arrow icon.

3. Start the event listener in new terminal and enter the registered device Id when prompted.

4. Use the client interface to turn pins on or off.

5. The event listener will listen for choosen device events in the contract and simulate/update the GPIO pins on the Raspberry Pi.

![usage_screen](https://github.com/Salmandabbakuti/depin-bnb-hack/assets/29351207/78e0995b-e591-4278-8c0c-f6746cf54163)

![listener_prompt](https://github.com/Salmandabbakuti/depin-bnb-hack/assets/29351207/d67ab995-0ceb-4c37-9a76-db3d6473bce3)

## Demo

![Screen1](https://github.com/Salmandabbakuti/depin-bnb-hack/assets/29351207/d0900ce0-3b03-411f-97b8-f40d7aa8b627)

## Built With

- [Hardhat](https://hardhat.org/) - Ethereum development environment for compiling, testing, deploying, and interacting with smart contracts
- [Solidity](https://docs.soliditylang.org/en/v0.8.24/) - Ethereum's smart contract programming language
- [Web3.py](https://web3py.readthedocs.io/en/stable/) - Python library for interacting with Ethereum blockchain
- [GPIO Simulator](https://pypi.org/project/GPIOSimulator/) - Python library for simulating GPIO pins
- [RPi.GPIO](https://pypi.org/project/RPi.GPIO/) - Python library for accessing GPIO pins on Raspberry Pi
- [React + Vite](https://vitejs.dev/) - Frontend development environment for building fast and modern web apps

## Safety

This is experimental software and subject to change over time.

This is a proof of concept and is not ready for production use. It is not audited and has not been tested for security. Use at your own risk. I do not give any warranties and will not be liable for any loss incurred through any use of this codebase.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
