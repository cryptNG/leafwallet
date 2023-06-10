import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
    @service router;
    @service web3service;
    @service libwalletWebService
    
    hasWalletEventsSet = false;
    async beforeModel() {
        window.wallet = this.web3service;

        await window.wallet.connect();
        await window.wallet.registerHandlers();
        if(window.wallet.isConnected)
        {
            await this.libwalletWebService.setup(window.wallet._ethersProvider, window.wallet._libwallet_contract_address, window.wallet._contractAbi, window.wallet.connectedAccount,window.wallet._provider);
        }
    
      
    }

}
