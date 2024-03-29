import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { rethrow } from 'rsvp';

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



export default class LibwalletMobileService extends Service {
  //#region setup
@tracked isReady = false;
@tracked isRegistered = false;
@tracked oldMessage = '';
@tracked lastMessage='';
@tracked balance=0;

  constructor() {
    super(...arguments);
    this.provider = null;
    this.contract = null;
    this.connectedWallet=null;

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
    //this.checkData();
  }

  // This function sets up _ethers and the contract
  setup(contractAddress, jsonRpcUrl, contractAbi) {
    this.contractAddress=contractAddress;
    this.contractAbi=contractAbi;
    try {
      // Set up provider
      this.provider = new _ethers.providers.JsonRpcProvider(jsonRpcUrl);

      // Set up contract
      

      this.isReady=true;
    } catch (err) {
      console.error(`Error during setup: ${err}`);
      throw new Error(`Error during setup: ${err}`);
    }
  }

  //#endregion

  // This function checks if the wallet is registered in the smart contract
  checkWalletRegistered = async ()=> {
    
    let debounce=1;

    while(this.isRegistered ===false)
    {
      if(this.connectedWallet!==null)
      {
        try
        {
          // Call the contract function
          this.isRegistered = await this.contract.isSenderRegistered({from: this.connectedWallet.address});
          if(this.isRegistered ===false ) await timeout(2000+debounce);
          debounce+=debounce;
        }
        catch(e)
        {
          await timeout(2000+debounce);
        }
      }else await timeout(100);

      
      
    }

    this.lastMessage="dApp Wallet registered";
  }

  checkData = async ()=> {
    
    let debounce=1;

    while(true ===true)
    {
      if(this.connectedWallet!==null)
      {
        try
        {
          // Call the contract function
          const oldMessage = await this.contract.getData({from: this.connectedWallet.address});
          if(this.oldMessage !== oldMessage){
            debounce=1;
          }
          this.oldMessage =oldMessage;
          await timeout(2000+debounce);
          debounce+=debounce;
        }
        catch(e)
        {
          await timeout(2000+debounce);
        }
      }else await timeout(100);

      
      
    }
  }

  getData = async ()=> {
    
    this.oldMessage = await this.contract.getData({from: this.connectedWallet.address});
    this.lastMessage="Got fresh data from blockchain";
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
      dbRequest.onsuccess =  (event) =>{
        const db = event.target.result;
        const transaction = db.transaction(['wallets'], 'readonly');
        const objectStore = transaction.objectStore('wallets');
        const getRequest = objectStore.get('deviceWallet');
        getRequest.onsuccess = async (event)=> {
          if (event.target.result) {

            const wallet = await _ethers.Wallet.fromEncryptedJson(event.target.result,'IMEI');
            this.connectedWallet = new _ethers.Wallet(wallet.privateKey,this.provider);

            this.contract = new _ethers.Contract(
              this.contractAddress,
              this.contractAbi,
              this.connectedWallet
            );
            this.getBalance();
            resolve(wallet);
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

  async trackBalance(timeMillis) {
    setInterval(async () => {
      await this.getBalance();
    }, timeMillis);
  }
  
  @tracked deviceWalletBalance = 0;
  async getBalance()
  {
    return this.deviceWalletBalance = await this.provider.getBalance(this.connectedWallet.address) / 1000000000000000000;
  }
  
  async assignData(message) {
    let success = false;
    
    try {
      this.lastMessage="storing data ...";
      let tx = await this.contract.assignData(message,{from: this.connectedWallet.address});
      console.log('tx:'+ await tx.wait());
      this.lastMessage="Message stored to blockchain";
      success = true;
    } catch(exc) {
      this.lastMessage=exc.message;
      rethrow(exc);
    } finally {
      this.contract.removeAllListeners();
    }
    this.getBalance();
    return success;
  }
  
}
