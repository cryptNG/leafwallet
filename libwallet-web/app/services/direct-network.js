import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class DirectNetworkService extends Service {
    
@service router;
    _provider;
    _jsonRpcUrl = 'https://testnet.cryptng.xyz:8545';
    _libwallet_contract_address='0x30eA7f07ec634f798Be062FB2AC5B1C9f25392E2';
    _contractAbi=[
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
    

    constructor()
    {
        super(...arguments);

       this._provider = new _ethers.providers.JsonRpcProvider({url:this._jsonRpcUrl,mode:'cors'});
   
        console.log('web3addr');
        console.log(this._jsonRpcUrl);
        console.log('provider');
        console.log(this._provider);
    }



}
