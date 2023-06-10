import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {timeout} from 'ember-concurrency';
import { A } from '@ember/array';




export default class MainComponent extends Component {

  @service libwalletWebService;
  @tracked isShowingCameraViewModal = false;

  @tracked wallets;

  constructor(){
    super(...arguments);
    this.getAllDevices();
  }

  get wallet(){
    return window.wallet;
  }

 @action async handleValidKey(pubKey)
 {
this.toggleCameraViewModal();
await this.assignNewDevice(pubKey);
await this.getAllDevices();
 }

   async assignNewDevice(pubKey)
  {
   await this.libwalletWebService.registerWallet(pubKey);
  }

  async getAllDevices()
  {
    this.wallets = await this.libwalletWebService.getAllDevicesOfSender();
  }



  @action toggleCameraViewModal() {
    this.isShowingCameraViewModal = !this.isShowingCameraViewModal;
    console.log('showing camera view: ' + this.isShowingCameraViewModal);
  }



  @action async sendFunds(pubKey) {
    // Get the input element associated with the public key
    const inputElement = document.getElementById(pubKey);

    // Get the ether amount from the input field
    const ethAmount = inputElement.value;

    // Call sendFunds function from the libwalletWebService
    await this.libwalletWebService.sendFunds(pubKey, ethAmount);
  }

  @action async getFunds(){
    await this.libwalletWebService.sendFromFaucet();
  }

  


}
