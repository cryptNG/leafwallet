import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class LibwalletMobileService extends Service {
  //#region setup
@tracked isRegistered = false;

  constructor() {
    super(...arguments);
    this.provider = null;
    this.contract = null;

    // Open the IndexedDB and create 'wallets' object store if it does not exist
    const dbRequest = indexedDB.open('LibWalletDB', 2);
    dbRequest.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('wallets')) {
        db.createObjectStore('wallets');
      }
    };
    dbRequest.onerror = function (event) {
      console.error('Failed to open or upgrade database during initialization.');
    };

    this.checkWalletRegistered();
  }

  // This function sets up _ethers and the contract
  async setup(contractAddress, jsonRpcUrl, contractAbi) {
    try {
      // Set up provider
      this.provider = new _ethers.providers.JsonRpcProvider(jsonRpcUrl);

      // Set up contract
      this.contract = new _ethers.Contract(
        contractAddress,
        contractAbi,
        this.provider
      );
    } catch (err) {
      console.error(`Error during setup: ${err}`);
      throw new Error(`Error during setup: ${err}`);
    }
  }

  //#endregion

  // This function checks if the wallet is registered in the smart contract
  async checkWalletRegistered() {
    while(this.isRegistered ===false)
    {
    try
    {

    // Load the device wallet
    const wallet = await this.loadWallet();

    // Call the contract function
   this.isRegistered = await this.contract.isDeviceWalletRegistered({from: wallet.address});
  
    }
    catch(e)
    {
      
    }

    if(this.isRegistered ===false ) await setTimeout(200);
}

  // This function generates a new wallet
  async createWallet() {
    // Generate new wallet
    const wallet = _ethers.Wallet.createRandom();


    // Convert wallet to JSON and store
    const walletJson = await wallet.encrypt('IMEI');
    await this.saveWallet(walletJson);
    return wallet;
  }

  // This function loads a wallet from secure storage
  async loadWallet() {
    // Check if the wallet exists in IndexedDB
    const dbRequest = indexedDB.open('LibWalletDB', 2);
    return new Promise((resolve, reject) => {
      dbRequest.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(['wallets'], 'readonly');
        const objectStore = transaction.objectStore('wallets');
        const getRequest = objectStore.get('deviceWallet');
        getRequest.onsuccess = function (event) {
          if (event.target.result) {
            resolve(_ethers.Wallet.fromEncryptedJson(event.target.result,'IMEI'));
          } else {
            resolve(null);
          }
        };
        getRequest.onerror = function (event) {
          reject(new Error('Failed to retrieve wallet from database.'));
        };
      };
      dbRequest.onerror = function (event) {
        reject(new Error('Failed to open database.'));
      };
    });
  }

  // This function saves a wallet to secure storage
  async saveWallet(walletJson) {
    // Save the wallet in IndexedDB
    const dbRequest = indexedDB.open('LibWalletDB', 2);
    return new Promise((resolve, reject) => {
      dbRequest.onupgradeneeded = function (event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('wallets')) {
          db.createObjectStore('wallets');
        }
      };
      dbRequest.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(['wallets'], 'readwrite');
        const objectStore = transaction.objectStore('wallets');
        const putRequest = objectStore.put(walletJson, 'deviceWallet');
        putRequest.onsuccess = function (event) {
          resolve();
        };
        putRequest.onerror = function (event) {
          reject(new Error('Failed to store wallet in database.'));
        };
      };
      dbRequest.onerror = function (event) {
        reject(new Error('Failed to open database.'));
      };
    });
  }

  // This function checks if a wallet exists
  async checkWalletExists() {
    const dbRequest = indexedDB.open('LibWalletDB', 2);
    return new Promise((resolve, reject) => {
      dbRequest.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(['wallets'], 'readonly');
        const objectStore = transaction.objectStore('wallets');
        const getRequest = objectStore.get('deviceWallet');
        getRequest.onsuccess = function (event) {
          if (event.target.result) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        getRequest.onerror = function (event) {
          reject(new Error('Failed to check if wallet exists.'));
        };
      };
      dbRequest.onerror = function (event) {
        reject(new Error('Failed to open database.'));
      };
    });
  }

  // This function generates a QR code for the public key of a wallet
  async generateQR(address) {
    try {
      // Ensure the wallet has a valid address
      if (address) {
        // Create a QR code SVG as a string
        var qrSvg = qr.imageSync(address, { type: 'svg' });
        return qrSvg;
      } else {
        throw new Error(
          'Invalid wallet object. Wallet must have a valid address.'
        );
      }
    } catch (err) {
      console.error(`Error generating QR code: ${err}`);
      throw new Error(`Error generating QR code: ${err}`);
    }
  }
}
