import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';


export default class Dashboard extends Component {

    @service router;
  
    @tracked isShowingAddNetworkModal = false;
    
 
    get wallet(){
      return window.wallet;
    }

    @action toggleIsShowingAddNetworkModal()
    {
      this.isShowingAddNetworkModal = !this.isShowingAddNetworkModal;
    }
    
    @action closeAddNetworkModal()
    {
      this.toggleIsShowingAddNetworkModal();
      location.reload();
    }
    
  sessionCreateFailMessage = '';
  @action async connect()
  {
    console.log(window.wallet.isConnected);
    try
    {
      try
      {
          await window.wallet.connect();
          await window.wallet.createSession();
          
      if(window.wallet.isConnected)
      {
        await this.libwalletWebService.setup(window.wallet._provider, window.wallet._libwallet_contract_address, window.wallet._contractAbi, window.wallet.connectedAccount);
      }
      }
      catch(modalClosed)
      {
        console.log(modalClosed);
        this.sessionCreateFailMessage = modalClosed
        this.toggleIsShowingAddNetworkModal();
      }
     
    }
    catch(err)
    {
      window.alert(err.message);
    }
  }
  

  @action async disconnect()
  {
    try
    {
      await window.wallet.disconnect();
    }
    catch(err)
    {
      window.alert(err.message);
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
