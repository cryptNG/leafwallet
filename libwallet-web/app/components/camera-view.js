import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CameraView extends Component {
@service camera;

@action async prepare()
{
   this.camera.prepare(this.args.validKeyReceived);
   
}

@action shutter()
{
    this.camera.shutter();
}

}
