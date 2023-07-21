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
  @tracked awaitingFunds = false;
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
    if (this.camera) {
      await this.camera.prepareVideo();
    }
  }
  @action
  hideCameraViewModal() {
    if (this.camera && this.camera.videoStream) {
      // Stop all tracks.
      this.camera.videoStream.getTracks().forEach(track => track.stop());
      // Reset the stream
      this.camera.videoStream = null;
      this.camera.video.srcObject = null; // set video srcObject to null
      this.camera.ctx.clearRect(0, 0, this.camera.canvas.width, this.camera.canvas.height);  // clear the canvas           
    }
    this.isShowingCameraViewModal = false;  
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
        this.hideCameraViewModal();
        this.assignNewDevice(pubKey);
        this.getAllDevices();
      }, 1000);
    }
}

async assignNewDevice(pubKey) {
  let tx = await this.libwalletWebService.registerWallet(pubKey);
  if(tx) {
    await tx.wait();
      
    // Fetch all devices
    await this.getAllDevices();

    // Mark the new wallet as 'new'
    const newWalletIndex = this.wallets.findIndex(x => x.device === pubKey);
    if (newWalletIndex !== -1) {
      // Create a new array with the updated wallet
      const newWallets = this.wallets.map((wallet, index) => {
        if (index === newWalletIndex) {
          return { ...wallet, isNew: true };
        }
        return wallet;
      });
      
      // Set wallets to the new array
      this.wallets = newWallets;

      // Remove the 'new' marker after some time
      setTimeout(() => {
        if (this.wallets[newWalletIndex]) {
          this.wallets = this.wallets.map((wallet, index) => {
            if (index === newWalletIndex) {
              return { ...wallet, isNew: false };
            }
            return wallet;
          });
        }
      }, 3000); // Adjust the timeout as per your requirement
    }
  }
}

  async getAllDevices()
  {
    this.wallets = await this.libwalletWebService.getAllDevicesOfSender();
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
    this.awaitingFunds = true;
    await this.libwalletWebService.sendFromFaucet();
    this.awaitingFunds = false;
  }
}
