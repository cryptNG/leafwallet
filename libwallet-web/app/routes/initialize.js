import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class InitializeRoute extends Route {
  @service router;
  @service walletService;
  
  async model() {
    const isConnected = await this.walletService.connectWallet();
    if(isConnected) {
      this.router.transitionTo('start');
    } else {
      this.router.transitionTo('connect');
    }
  }
}
