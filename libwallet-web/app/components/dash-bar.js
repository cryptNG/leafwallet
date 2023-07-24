import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { debounce } from '@ember/runloop';


export default class Dashboard extends Component {

    @service router;
    @service web3service;
    @service walletService;
  @service libwalletWebService;
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


    @action toggleIsShowingIconographykModal()
    {
      this.isShowingIconographyModal = !this.isShowingIconographyModal;
    }
    
    
    @action closeIconographyModal()
    {
      this.toggleIsShowingIconographykModal();
    }
    
  sessionCreateFailMessage = '';
  @action async connect() {
   await this.walletService.connectWallet(); 
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
