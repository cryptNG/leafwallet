import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ApplicationController extends Controller {
    @service libwalletMobile;
    
    wallet;
    constructor()
    {
        super(...arguments);

        
    }

    get isInitialized()
    {
        return this.wallet !== null;
    }

    async initialize()
    {
        while(!this.libwalletMobile.isReady)
        {
            await setTimeout(100);
        }
        if(!this.libwalletMobile.checkWalletExists())
        {
            this.libwalletMobile.createWallet();
        }
        this.wallet = this.libwalletMobile.loadWallet();
    }

    get isNotYetRegistered()
    {
        return !this.libwalletMobile.checkWalletRegistered() 
    }

    get qrCodeAsSvg()
    {
        return this.libwalletMobile.generateQR(this.wallet.address);
    }


}
