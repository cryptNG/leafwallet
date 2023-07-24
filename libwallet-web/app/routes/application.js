// application.js
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';

export default class ApplicationRoute extends Route {
  @service router;
  @service web3service;
  
  async beforeModel() {
    
    window.wallet = this.web3service;
    if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {

      // MetaMask is installed
      
    await this.web3service.registerHandlers();
    }
    later(this, function() {
      this.router.transitionTo('initialize');
    }, 50);
  }
}
