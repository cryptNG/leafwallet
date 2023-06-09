import Component from '@glimmer/component';
import qrcode from 'qrcode';

export default class DeviceQrCodeComponent extends Component {
  
    init=(element)=>{
  

        let canvas = document.createElement('canvas');

        // Generate the QR code into the canvas
        qrcode.toCanvas(canvas, this.args.publicKey, function (error) {
            if (error) console.error(error);
             element.innerHTML = '';
            element.appendChild(canvas);
        });
    }
}
