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

  registerHandlers() {
    if (!this.hasWalletEventsSet) {
      console.debug('registering web3 handlers');
      const signer = this._ethersProvider.getSigner();

      this.libwalletContract = new _ethers.Contract(this._libwallet_contract_address,this._contractAbi, signer);
   

      window.ethereum.on("disconnect", (error) => {
        console.log(`Disconnected from network ${error}`);
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

  async connect() {
    let isConnecting=false;
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) =>{
        if (accounts.length > 0) {
          this.connectedAccount = window.ethereum.selectedAddress;
          this._ethersProvider = new _ethers.providers.Web3Provider(window.ethereum,"any");
          console.log('connected with ' + this.connectedAccount);
          isConnecting=false;
        }
      } );
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
        }
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
