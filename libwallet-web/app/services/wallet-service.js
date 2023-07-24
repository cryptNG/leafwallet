import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class WalletService extends Service {
@tracked isConnected = false;
@tracked connectedAccount = null;
@service web3service;
@service libwalletWebService;
  targetChainId = "0x539"; // Add your target chain id here

  async connectWallet() {
    console.log('connectwallet called');
    try
    {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {

      // MetaMask is installed
      


      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId === this.targetChainId) {
        try {
          // If the user is on the correct network, trigger the connect
          await this.web3service.connect();
          this.isConnected = this.web3service.isConnected; // Update the service state here

          // If wallet is connected
          if(this.web3service.isConnected){

            await this.libwalletWebService.setup(
              this.web3service._ethersProvider, 
              this.web3service._libwallet_contract_address, 
              this.web3service._contractAbi, 
              this.web3service.connectedAccount,
              this.web3service._provider
            );
            return true; // return true if connected successfully
          } 
        } catch (error) {
          // If connection was rejected by the user, return false
          return false;
        }
      }
      else {
        //switch network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: this.targetChainId }],
          });
          await this.web3service.connect();
          return true; // return true if switched and connected successfully
        } catch (switchError) {
          console.error(switchError);
          return false;
        }
      }
    } else {
      // Handle condition when MetaMask is not installed
      console.error("MetaMask is not installed.");
      return false;
    }
}
catch(error)
{
    return false;
}
  }
}
