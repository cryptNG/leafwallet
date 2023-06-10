import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { rethrow } from 'rsvp';
import { timeout } from 'ember-concurrency';

export default class LibwalletWebService extends Service {
    _networkProvider = null;
    _libwalletContract = null;
    _connectedAccount = null;
    _directNetworkContract = null;
   constructor()
   {
    super(...arguments);
   }



   async setup(networkProvider, contractAddress, contractAbi, connectedAccount)
   {
    this._networkProvider = networkProvider;
    const signer = await this._networkProvider.getSigner();
    this._libwalletContract = new _ethers.Contract(contractAddress,contractAbi, signer);
    this._connectedAccount = connectedAccount;

    
    let directProvider = new _ethers.providers.JsonRpcProvider({url:'https://testnet.cryptng.xyz:8545',mode:'cors'});
    this._directNetworkContract = new _ethers.Contract(contractAddress,contractAbi,directProvider);

    
   }

   async registerWallet(pubKey) {
    let success = false;
    
    try {
      //let currentGasPrice = await this._networkProvider.getGasPrice();
      //console.debug('currentGasPrice: ' + currentGasPrice);
  
    //   const estimatedGas = await this._directNetworkContract.estimateGas.assignAddressToSender(_ethers.utils.hexlify(address));
    //   console.debug('estimatedGas: ' + estimatedGas);
  
    //   console.debug('ETH-ADDRESS: ' + this._connectedAccount);
  
    //   let options = {
    //     gasPrice: currentGasPrice,
    //     gasLimit: estimatedGas,
    //   };
    // console.log(this._libwalletContract.methods.assignAddressToSender(pubKey).encodeABI());

    // console.log(this._libwalletContract.methods.assignAddressToSender(pubKey+'000000000000000000000000').encodeABI())
    
      let address = _ethers.utils.getAddress(pubKey);
      let tx = await this._libwalletContract.assignAddressToSender(address);
      console.log('tx:'+ await tx.wait());
  
      success = true;
    } catch(exc) {
      rethrow(exc);
    } finally {
      this._libwalletContract.removeAllListeners();
    }
  
    return success;
  }
  
   
  async assignAddressToSender(pubKey)
  {
    return _ethers.utils.hexlify(await this._libwalletContract.estimateGas.assignAddressToSender(pubKey));
  }

}