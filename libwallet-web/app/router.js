import EmberRouter from '@ember/routing/router';
import config from 'libwallet-web/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('connect');
  this.route('initialize');
  this.route('start');
});
