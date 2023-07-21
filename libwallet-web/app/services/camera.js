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

    // If a QR code is detected store its detection time along with its data.
    if (code) {
        this.lastSuccessfulDetection = {
            code: code,
            timeStamp: performance.now()
        };
    }

    // Fall back to the last successful detection if it happened in the last 200ms.
    if (this.lastSuccessfulDetection && performance.now() - this.lastSuccessfulDetection.timeStamp < 200) {
        code = this.lastSuccessfulDetection.code
    }

    // Only continue if a code is available (either detected now, or the fallback one)
    if (code) {
        let key = this.parseEthereumPublicKey(code.data);

        // Draw a semi-transparent black overlay over the entire video
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate bounding box for QR code
        let left = Math.min(code.location.topLeftCorner.x, code.location.bottomLeftCorner.x);
        let right = Math.max(code.location.topRightCorner.x, code.location.bottomRightCorner.x);
        let top = Math.min(code.location.topLeftCorner.y, code.location.topRightCorner.y);
        let bottom = Math.max(code.location.bottomLeftCorner.y, code.location.bottomRightCorner.y);

        // Draw the captured video only in area of the QR code
        this.ctx.drawImage(this.video, left, top, right - left, bottom - top, left, top, right - left, bottom - top);

        if (key) {
            console.log("Decoded QR code:", code.data);
            this.qrCode = key; // Store only the public key part
            this.video.pause(); // Stop the video stream
            this.videoStream.getTracks().forEach(track => track.stop()); // Stop the MediaStream

            // SetTimeout to delay the _validKeyReceivedCallBack call
              this._validKeyReceivedCallBack(this.qrCode);
      } else {
          this._validKeyReceivedCallBack(null);
      }
  }

  // Request animation frame to keep scanning
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
