import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

export default class ApplicationController extends Controller {
    @service libwalletMobile;
    @tracked stage = 1;
    @tracked newMessage = '';
    
    @tracked wallet=null;
    lastStepTime = Date.now();
    stagesToProcess=[];

    constructor()
    {
        super(...arguments);
        this.libwalletMobile.setup(contractAddress,jsonRpcUrl,contractAbi);
        this.initialize().then(()=>{});

        
    }

    //what are the stages
    //1 setup libwalletMobile and isReady
    //2 check wallet exists
    //3 create wallet
    //4 load wallet
    //5 check device registered

    get stage1(){
        return this.stage===1;
    }
    get stage2(){
        return this.stage===2 ;
    }
    get stage3(){
        return this.stage===3;
    }
    get stage4(){
        return this.stage===4;
    }
    get stage5(){
        return this.stage===5;
    }

    get stage6(){
        return this.libwalletMobile.isRegistered;
    }

    get oldMessage(){
      return this.libwalletMobile.oldMessage;
    }

    get isInitialized()
    {
        return this.wallet !== null;
    }

    async initialize()
    {
        let before = Date.now();
        while(!this.libwalletMobile.isReady)
        {
            await timeout(100);
        }
        if((Date.now()-before) < 2000) await timeout(2000 - (Date.now()-before));
        before = Date.now();
        this.stage=2;
        if(! await this.libwalletMobile.checkWalletExists())
        {
            if((Date.now()-before) < 2000) await timeout(2000 - (Date.now()-before));
            before = Date.now();
            this.stage=3;
            await this.libwalletMobile.createWallet();
        }
        if((Date.now()-before) < 2000) await timeout(2000 - (Date.now()-before));
        before = Date.now();
        this.stage=4;
        this.wallet = await this.libwalletMobile.loadWallet();
        before = Date.now();
        this.stage= this.libwalletMobile.isRegistered?6:5;

    }

    get isNotYetRegistered()
    {
        return !this.libwalletMobile.isRegistered;
    }

    get qrCodeAsSvg()
    {
        return this.libwalletMobile.generateQR(this.wallet.address);
    }

    @action async submitNewMessage(){
      if(this.newMessage!==''){
        await this.libwalletMobile.assignData(this.newMessage);
      }
    }

}


const jsonRpcUrl = 'https://testnet.cryptng.xyz:8545';
const contractAddress='0x4Bc5741Ee7B8F7Ed527e059679fD65D3EC168B35';
const contractAbi= [
  {
    "inputs": [],
    "name": "isSenderRegistered",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "assignee",
        "type": "address"
      }
    ],
    "name": "assignAddressToSender",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRelatedDevices",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "data",
        "type": "string"
      }
    ],
    "name": "assignData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getData",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
];