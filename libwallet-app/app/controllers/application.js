import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ApplicationController extends Controller {
    @service libwalletMobile;
    
    @tracked wallet=null;
    constructor()
    {
        super(...arguments);
        this.initialize();
        
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
        if(! await this.libwalletMobile.checkWalletExists())
        {
            await this.libwalletMobile.createWallet();
        }
        this.wallet = await this.libwalletMobile.loadWallet();
    }

    get isNotYetRegistered()
    {
        return ( async () =>{
            try{
                return ! await this.libwalletMobile.checkWalletRegistered() ;
            }catch(e){
                return true;
            }
        })();
    }

    get qrCodeAsSvg()
    {
        return this.libwalletMobile.generateQR(this.wallet.address);
    }


}
