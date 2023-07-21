import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { rethrow } from 'rsvp';
import { timeout } from 'ember-concurrency';

export default class LibwalletWebService extends Service {
  @service web3service;
    _networkProvider = null;
    _libwalletContract = null;
    _connectedAccount = null;
    _directNetworkContract = null;
    _faucet=null;
   constructor()
   {
    super(...arguments);
   }



   async setup(networkProvider, contractAddress, contractAbi, connectedAccount,faucet)
   {
    this._networkProvider = networkProvider;
    const signer = await this._networkProvider.getSigner();
    this._libwalletContract = new _ethers.Contract(contractAddress,contractAbi, signer);
    this._connectedAccount = connectedAccount;

    
    let directProvider = new _ethers.providers.JsonRpcProvider({url:'https://testnet.cryptng.xyz:8545',mode:'cors'});
    this._directNetworkContract = new _ethers.Contract(contractAddress,contractAbi,directProvider);

    this._faucet=faucet;
   }

   
   async registerWallet(pubKey) {
    let txResponse = null;

    try {
        let address = _ethers.utils.getAddress(pubKey);
        let tx = await this._libwalletContract.assignAddressToSender(address);
        await tx.wait();
        console.log('tx:'+ await tx.wait());
  
        txResponse = tx;
    } catch(exc) {
        rethrow(exc);
    } finally {
        this._libwalletContract.removeAllListeners();
    }

    return txResponse;
}

   
  async assignAddressToSender(pubKey)
  {
    return _ethers.utils.hexlify(await this._libwalletContract.estimateGas.assignAddressToSender(pubKey));
  }
   
  async getAllDevicesOfSender() {
    // Get all related devices
    let devices = await this._libwalletContract.getRelatedDevices();

    // Create an array to store device and their balances
    let devicesWithBalances = [];

    // Loop through each device
    for (let device of devices) {
        // Fetch balance for each device
        let balance = await this.getBalanceOfWallet(device);

        // Push device and balance to the array
        devicesWithBalances.push({
            device: device,
            balance: balance
        });
    }
    await this.web3service.getBalance();
    
    return devicesWithBalances;
}





  async getBalanceOfWallet(walletAddress) {
    // Check the balance of the given address
    let balance = await this._networkProvider.getBalance(walletAddress);

    // ethers.js returns balance in wei, so we need to convert it to ether
    const etherBalance = _ethers.utils.formatEther(balance);
    
    return etherBalance;
}
  
  async sendFunds(to, amount) {
    // Convert ether to wei as ethers.js deals with values in wei
    const weiAmount = _ethers.utils.parseEther(amount);

    // Get the signer
    const signer = await this._networkProvider.getSigner();

    // Send the transaction
    const tx = await signer.sendTransaction({
      to: to,
      value: weiAmount
    });

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
        await this.web3service.getBalance(receipt.gasUsed.gt(0));

    console.log(`Transaction ${receipt.transactionHash} mined in block ${receipt.blockNumber}`);
  }

  async sendFromFaucet() {
    // Convert ether to wei as ethers.js deals with values in wei
    const weiAmount = _ethers.utils.parseEther("0.1");

    // Get the signer
    const signer = await this._faucet.getSigner();

    // Send the transaction
    const tx = await signer.sendTransaction({
      to: this._connectedAccount,
      value: weiAmount
    });

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    await this.web3service.getBalance(receipt.gasUsed.gt(0));

    console.log(`Transaction ${receipt.transactionHash} mined in block ${receipt.blockNumber}`);
  }



}