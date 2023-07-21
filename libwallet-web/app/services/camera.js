import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import jsQR from "jsqr";

export default class Camera extends Service {
  @tracked videoStream;
  @tracked video;
  @tracked canvas;
  @tracked ctx;
  @tracked qrCode = null;
  @tracked isLoading = true;
  _validKeyReceivedCallBack = null;
  
  constructor() {
    super(...arguments);
    this.video = document.createElement('video'); // Create the video element here
  }

  async prepareCanvas(validKeyReceivedCallBack, canvasElement) {
    this.canvas = canvasElement; // instead of creating a new one, we use the existing one
    this.canvas.willReadFrequently = true; // optimize performance on frequent reads
    this.ctx = this.canvas.getContext('2d');
    this._validKeyReceivedCallBack = validKeyReceivedCallBack;
    
    // Call prepareVideo from here
    await this.prepareVideo();
  }

  async prepareVideo() {
    this.isLoading = true;
    if (!this.videoStream) {
      let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      this.videoStream = stream;
  
      // Set the source of the video element to be the stream
      this.video.srcObject = stream;
  
      // Once the video metadata has loaded, set the dimensions of the canvas
      this.video.onloadedmetadata = () => {
        this.video.play();

        
        this.video.width = 640;
        this.video.height = 480;

        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        this.scanQRCode();
      };
    }
    
this.isLoading = false;
  }
  
  scanQRCode() {
    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    let imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    let code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      let key = this.parseEthereumPublicKey(code.data);
      
      this.ctx.beginPath();
      this.ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
      this.ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
      this.ctx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
      this.ctx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
      this.ctx.lineTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = 'yellow';
      this.ctx.stroke();

      if (key) {
        console.log("Decoded QR code:", code.data);
        this.qrCode = key; // Store only the public key part
        this.video.pause(); // Stop the video stream
        this.videoStream.getTracks().forEach(track => track.stop()); // Stop the MediaStream

    
        // Use a SetTimeout to delay the _validKeyReceivedCallBack call
        setTimeout(() => {
            this._validKeyReceivedCallBack(this.qrCode);
        }, 2000);
      } else {
        this._validKeyReceivedCallBack(null);
      }
    }

    if (!this.video.paused && !this.video.ended) {
      window.requestAnimationFrame(this.scanQRCode.bind(this));
    }
  }

  parseEthereumPublicKey(data) {
    let key = data;
    if (key.startsWith('ethereum:')) {
      key = key.slice(9);
    }

    key = key.split('@')[0];

    try {
      _ethers.utils.getAddress(key);
      return key;
    } catch (error) {
      return null;
    }
  }
}
