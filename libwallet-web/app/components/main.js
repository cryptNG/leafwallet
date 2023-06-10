import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {timeout} from 'ember-concurrency';
import { A } from '@ember/array';




export default class MainComponent extends Component {

  @service libwalletWebService;
  @tracked isShowingCameraViewModal = false;
  constructor(){
    super(...arguments);
  }

  get wallet(){
    return window.wallet;
  }

 @action handleValidKey(pubKey)
 {
this.toggleCameraViewModal();
this.assignNewDevice(pubKey);
 }

   assignNewDevice(pubKey)
  {
    this.libwalletWebService.registerWallet(pubKey);
  }


  @action toggleCameraViewModal() {
    this.isShowingCameraViewModal = !this.isShowingCameraViewModal;
    console.log('showing camera view: ' + this.isShowingCameraViewModal);
  }

  


}
