// application.js
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';

export default class ApplicationRoute extends Route {
  @service router;
  @service web3service;
  
  async beforeModel() {
    
    window.wallet = this.web3service;
    later(this, function() {
      this.router.transitionTo('initialize');
    }, 50);
  }
}
