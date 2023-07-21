import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { debounce } from '@ember/runloop';


export default class Dashboard extends Component {

    @service router;
    @service web3service;
  @service libwalletWebService;
    @tracked isShowingAddNetworkModal = false;
    @tracked isShowingIconographyModal = false;
    @tracked shouldBlink = false;
    lastBalance = null;  // Add this to store the last balance

 
    get wallet(){
      return window.wallet;
    }

    @action
  balanceUpdated(element, newBalance) {
    // Check if new balance is the same as old balance
    if (this.lastBalance === newBalance[0]) {
      return;  // If it's the same, simply return and don't blink
    }

    // If it's different, store the new balance and start blinking
    this.lastBalance = newBalance[0];
    this.shouldBlink = true;

    debounce(this, this.stopBlinking, 3000);
  }

  stopBlinking() {
    this.shouldBlink = false;
  }

    @action toggleIsShowingAddNetworkModal()
    {
      this.isShowingAddNetworkModal = !this.isShowingAddNetworkModal;
    }

    @action toggleIsShowingIconographykModal()
    {
      this.isShowingIconographyModal = !this.isShowingIconographyModal;
    }
    
    
    @action closeAddNetworkModal()
    {
      this.toggleIsShowingAddNetworkModal();
      location.reload();
    }
    @action closeIconographyModal()
    {
      this.toggleIsShowingIconographykModal();
    }
    
  sessionCreateFailMessage = '';
  @action async connect() {
    const chainId = '0x539'; // This is 1337 in hexadecimal
  
    console.log(window.wallet.isConnected);
    try {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Then try to switch to the new network, if it was already added this will work and not throw an error
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }]
          });
          
        } catch (switchError) {
          // If the switch fails (which it will if the network wasn't added yet), add the new network
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId,
                  chainName: 'CryptNG-TestNet',
                  nativeCurrency: {
                    name: 'CryptNG Ethereum',
                    symbol: 'CETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://testnet.cryptng.xyz:8545'],
                  blockExplorerUrls: ['https://yitc.ddns.net:4000/']
                }
              ]
            });
  
            // After adding the network, switch to it
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId }]
            });
            
          } else {
            throw switchError;
          }
        }
  
        // Connect after switching the network
        await window.wallet.connect();
        await window.wallet.registerHandlers();
        await window.wallet.createSession();
  
        if (window.wallet.isConnected) {
          await this.libwalletWebService.setup(
            window.wallet._provider,
            window.wallet._libwallet_contract_address,
            window.wallet._contractAbi,
            window.wallet.connectedAccount,
            window.wallet._provider
          );
        }
  
      } else {
        console.log('MetaMask is not installed!');
      }
  
    } catch (err) {
      console.error(err);
      this.sessionCreateFailMessage = err.message
      this.toggleIsShowingAddNetworkModal();
    }
  }
  
  

  toClipBoardNetworkName()
  {
    navigator.clipboard.writeText('CryptNG-TestNet');
  }
  
  toClipBoardRPCURL()
  {
    navigator.clipboard.writeText('https://testnet.cryptng.xyz:8545');
  }
  
  toClipBoardChainId()
  {
    navigator.clipboard.writeText('1337');
  }
  
  toClipBoardSymbol()
  {
    navigator.clipboard.writeText('CPAY');
  }
  
  toClipBoardBlockExplorer()
  {
    navigator.clipboard.writeText('https://yitc.ddns.net:4000/');
  }

}
