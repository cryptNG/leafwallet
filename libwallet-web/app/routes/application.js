import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service router;
  @service web3service;
  @service libwalletWebService;
    
  hasWalletEventsSet = false;
  targetChainId = "0x539"; // Add your target chain id here
  
  async beforeModel() {
    window.wallet = this.web3service;

    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {
      // MetaMask is installed
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId === this.targetChainId) {
        // If the user is on the correct network, trigger the connect
        await window.wallet.connect();
        if(window.wallet.isConnected){
          // Wallet is connected
          await window.wallet.registerHandlers();
          await this.libwalletWebService.setup(
            window.wallet._ethersProvider, 
            window.wallet._libwallet_contract_address, 
            window.wallet._contractAbi, 
            window.wallet.connectedAccount,
            window.wallet._provider
          );
          this.router.transitionTo('/');
        }
        else{
          // Handle condition when wallet is not connected
          // Redirect to 'connect' route
          this.router.transitionTo('connect');
        } 
      }
      else
      {
        //switch network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: this.targetChainId }],
          });
          await window.wallet.connect();
          window.location.href = "/";
        } catch (switchError) {
          console.error(switchError);
        }
      }
    } else {
      // Handle condition when MetaMask is not installed
      console.error("MetaMask is not installed.");
    }
  }
}
