# DePIN Raspi Connect

DePIN Raspi Connect is a Raspberry Pi-based IoT project designed for home automation with blockchain integration. The project allows users to control home devices securely and efficiently using blockchain technology, ensuring trust, security, and authentication among IoT devices.

DePIN Raspi Connect leverages the power of Raspberry Pi's GPIO pins to control home devices while integrating blockchain technology for enhanced security and trust among connected devices. The project includes a smart contract system that stores and updates pin statuses with access control by the owner. When authorized users update pin statuses, the contract emits events with the respective pin number and status. A Python listener then detects these events and updates the Raspberry Pi pins accordingly, simulating device control in a secure and decentralized manner.

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

#### 2. Setup Contract Event Listener and Rasp Pi GPIO Simulator

> Copy `.env.example` to `.env` and fill in the contract address from previous step and RPC URL.

1. Install required dependencies

```bash
pip install -r requirements.txt
```

2. Run the event listener

```bash
python listener.py
```

#### 3. Starting Client

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

## Usage

1. Connect your wallet and ensure it has owner privileges on the contract.

2. Use the client interface to turn pins on or off.

3. The event listener will listen for events in the contract and simulate/update the GPIO pins on the Raspberry Pi.

## Demo

![Screen1](https://github.com/Salmandabbakuti/depin-bnb-hack/assets/29351207/479c57e3-d279-4c97-bb90-7723611c3713)

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
