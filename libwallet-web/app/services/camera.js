import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import jsQR from "jsqr";

export default class Camera extends Service {
  @tracked videoStream;
  @tracked video;
  @tracked canvas;
  @tracked ctx;
  @tracked qrCode = null;

  _validKeyReceivedCallBack = null;
  constructor() {
    super(...arguments);
    this.video = document.createElement('video');
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  async prepare(validKeyReceivedCallBack) {
    let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    this.videoStream = stream;
    
    // Set the source of the video element to be the stream
    this.video.srcObject = stream;
    
    // Once the video metadata has loaded, set the dimensions of the canvas
    this.video.onloadedmetadata = () => {
      this.video.play();
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.scanQRCode();
    };

    this._validKeyReceivedCallBack = validKeyReceivedCallBack;
  }

  scanQRCode() {
    // Draw the current frame of the video onto the canvas
    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

    // Get Image Data
    let imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    let code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      let key = this.parseEthereumPublicKey(code.data);
      if (key) {
        console.log("Decoded QR code:", code.data);
        this.qrCode = key; // Store only the public key part
        this.video.pause(); // Stop the video stream
        this.videoStream.getTracks().forEach(track => track.stop()); // Stop the MediaStream
        this._validKeyReceivedCallBack(this.qrCode);
      } else {
        window.alert("QR code is not a valid Ethereum public key");
      }
    }

    // Repeat scan as long as video is playing
    if (!this.video.paused && !this.video.ended) {
      window.requestAnimationFrame(this.scanQRCode.bind(this));
    }
  }

  parseEthereumPublicKey(data) {
    let key = data;
    if (key.startsWith('ethereum:')) {
      key = key.slice(9);
    }

    // Split on '@' character and consider only the first part as the public key
    key = key.split('@')[0];

    // Validate and return the key if it's a valid Ethereum public key
    try {
      _ethers.utils.getAddress(key);
      return key;
    } catch (error) {
      return null;
    }
  }
}
