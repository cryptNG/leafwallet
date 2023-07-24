import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import DirectNetworkService from './direct-network';
import { rethrow } from 'rsvp';
import { timeout } from 'ember-concurrency';

export default class Web3service extends DirectNetworkService {
   
  constructor()
  {
    super(...arguments);
  }


  @tracked connectedAccount = null;


  get isConnected() {
    if (window.ethereum == null) return false;

    return (this.connectedAccount || null) != null
  }

  async createSession()
  {
    //do nothing, its here to have common interface with wallet-connect
    return;
  }

  async disconnect() 
  {
      this.connectedAccount=null;
      
  }

  //important!!! call as early as possible, check if metamask is installed first
  registerHandlers() {
    if (!this.hasWalletEventsSet) {
     

      window.ethereum.on("disconnect", (error) => {
        console.log(`Disconnected from network ${error}`);
        this.router.transitionTo('/');
      });

      window.ethereum.on("connect", (data) => {
        console.log(`Connected ${data}`);
        this.router.transitionTo('/');
      });
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          this.connectedAccount = window.ethereum.selectedAddress;
          this.router.transitionTo('/');
        } else {
          console.error("0 accounts.");
          this.router.transitionTo('/');
        }
      });
      this.hasWalletEventsSet = true;
    }


    if ((window.ethereum.selectedAddress || null) != null) {
      this.router.transitionTo('/');
    }


  }

  
  registerContract() {
      console.debug('registering web3 contract / signer');
      const signer = this._ethersProvider.getSigner();

      this.libwalletContract = new _ethers.Contract(this._libwallet_contract_address,this._contractAbi, signer);
   

    }

  
  async getBalance(wait = false) {
  
    if(wait == true)
    {
      let currentBalance = this.balance;
      while(currentBalance == this.balance)
      {
        // Check the balance of the given address        
        let balance = await this._ethersProvider.getBalance(this.connectedAccount);
  
        // ethers.js returns balance in wei, so we need to convert it to ether
        const etherBalance = _ethers.utils.formatEther(balance);
  
        this.balance = etherBalance;
        console.log('set balance ' + this.balance);
        await timeout(1000);
      }
    }
    else
    {
       // Check the balance of the given address        
       let balance = await this._ethersProvider.getBalance(this.connectedAccount);
  
       // ethers.js returns balance in wei, so we need to convert it to ether
       const etherBalance = _ethers.utils.formatEther(balance);
 
       this.balance = etherBalance;
       console.log('set balance ' + this.balance);
    }
  
    
}
async connect() {
  let isConnecting=false;
  if (window.ethereum) {
    let accountsChangedHandler = (accounts) =>{
      if (accounts.length > 0) {
        this.connectedAccount = window.ethereum.selectedAddress;
        this._ethersProvider = new _ethers.providers.Web3Provider(window.ethereum,"any");
        console.log('connected with ' + this.connectedAccount);
        isConnecting=false;
        this.getBalance();
        // remove the event listener after it is triggered
        window.ethereum.removeListener('accountsChanged', accountsChangedHandler);
      }
    }
    window.ethereum.on("accountsChanged", accountsChangedHandler);
    window.ethereum.on("message", (message) => console.log(message));
    window.ethereum.on("disconnect", (error) => {
      console.log(`Disconnected from network ${error}`);
      this.connectedAccount = null;
    });
    
    isConnecting=true;
    window.ethereum.request({ method: 'eth_requestAccounts' }).then((accounts) => 
    {
      if (accounts.length > 0) {
        this.connectedAccount = window.ethereum.selectedAddress;
        this._ethersProvider = new _ethers.providers.Web3Provider(window.ethereum,"any");
        console.log('connected with ' + this.connectedAccount);
        isConnecting=false;
        this.getBalance();
      }
    }).catch((err) => {
      console.error(err);
      isConnecting = false;
      throw err;  // propagate the error up the chain
    });

    let failCounter=0;
      while(isConnecting && failCounter<30000){
        await timeout(10);
        failCounter++;
      }

      if(isConnecting){
        throw new Error("Connection Issue");
      }

  } else {
    console.error("Install MetaMask.");
  }

}



}
