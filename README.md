IMPORTANT! THIS IS STILL TBD AND NOT YET AVAILABLE VIA NPM

---

# LibWallet
> Streamlining Blockchain Transactions for Ethereum dApps

## Project Tagline
Liberating dApp developers from wallet-provider dependency, LibWallet is your key to crafting seamless Ethereum experiences.

## Overview

LibWallet is a powerful library built to streamline the experience of using Ethereum dApps. It is designed to solve a myriad of challenges currently encountered in the blockchain interaction, promoting wider adoption and user-friendliness.

Contrary to common practice, LibWallet is not a wallet but an efficient intermediary, allowing developers to work flexibly across various blockchain networks and reducing the reliance on external wallets like MetaMask for transaction signing.

**Please note:** As of now, this project is in its alpha stage. Use it in production environments at your own risk.

## Key Features

* **No External Dependencies**: LibWallet does not require any external wallets for transaction signing, enabling developers to control their apps' flexibility and usability.
* **Improved User Experience**: It significantly reduces the complexities and points of failure associated with external wallets, providing a seamless user experience.
* **Network Flexibility**: LibWallet supports multiple networks, making it easier for developers to work across different or custom networks.
* **User Understanding and Accessibility**: It simplifies the complicated workflows of wallets and web3 apps, reducing the entry barrier for new or non-technical users.

## Quick Start

To quickly set up LibWallet in your Ethereum project, follow these steps:

1. Install the LibWallet package:
    ```bash
    npm install libwallet
    ```

2. Import the LibWallet module into your project:
    ```javascript
    const libwallet = require('libwallet');
    ```

3. Initiate LibWallet with your network provider, contract address, contract ABI, and connected account:
    ```javascript
    libwallet.setup(networkProvider, contractAddress, contractAbi, connectedAccount);
    ```

Please see our [documentation](https://github.com/cryptNG/libwallet/wiki) for detailed instructions and API reference.

## Contributing

We encourage you to contribute to LibWallet! Please check out the [Contributing Guide](CONTRIBUTING.md) for guidelines about how to proceed.

## License

LibWallet is released under the [MIT License](LICENSE).
