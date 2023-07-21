import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {timeout} from 'ember-concurrency';
import { A } from '@ember/array';
import { run } from '@ember/runloop';

export default class MainComponent extends Component {

  @service libwalletWebService;
  @tracked isShowingCameraViewModal = false;
  @tracked warnClass = '';
  @tracked modalText = 'Scan the QR Code presented in the MetaTrail app on your device';

  @tracked wallets;

  constructor(){
    super(...arguments);
    this.getAllDevices();
  }

  get wallet(){
    return window.wallet;
  }

  @service camera; // Add camera service here

  @action
  async showCameraViewModal() {
    this.isShowingCameraViewModal = true;
    if (this.camera) { // Check if the camera object exists
      if (this.camera.videoStream) { // Check if existing camera video stream exists
        this.camera.videoStream.getTracks().forEach(track => track.stop()); // Stop the video feed when the modal is opened
        this.camera.videoStream = null; // Reset the videoStream in the camera service
      }
      await this.camera.prepareVideo(); // Initiate the video feed when the modal is opened
    }
  }
  
  @action
  hideCameraViewModal() {
    this.isShowingCameraViewModal = false;
    this.camera.videoStream.getTracks().forEach(track => track.stop()); // Stop the video feed when the modal is closed
    this.camera.videoStream = null; // Reset the videoStream in the camera service
  }


  @action async handleValidKey(pubKey) {
    if (!pubKey) {
        this.warnClass = 'warn';
        this.modalText = 'QR code is not a valid Ethereum public key';
        setTimeout(() => {
            this.warnClass = '';
            this.modalText = 'Scan the QR Code presented in the MetaTrail app on your device';
        }, 2000);
    } else {
        setTimeout(() => {
            this.toggleCameraViewModal();
            this.assignNewDevice(pubKey); // Moved into the timeout
            this.getAllDevices();
        }, 1000);
    }
}

  async assignNewDevice(pubKey)
  {
   await this.libwalletWebService.registerWallet(pubKey);
  }

  async getAllDevices()
  {
    this.wallets = await this.libwalletWebService.getAllDevicesOfSender();
  }
  
  @action
async toggleCameraViewModal() {
    // If the modal is currently open, close any streams and then close the modal
    if (this.isShowingCameraViewModal) {
        const mediaStream = this.camera.get('stream');
        if (mediaStream) {
            // Stop all tracks of the stream
            mediaStream.getTracks().forEach(track => track.stop());
        }

        this.camera.set('stream', null); // Reset "stream" property for a fresh start next time
        this.isShowingCameraViewModal = false;
    } 
    // If the modal is currently closed, open the modal and set up the stream
    else {
        this.isShowingCameraViewModal = true;

        // Await a short delay to ensure the stream is properly closed
        // before attempting to re-initialize it.
        await new Promise(resolve => setTimeout(resolve, 500));  
        
        this.camera.prepareVideo(); // Initiate the video feed when the modal is reopened
    }
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
