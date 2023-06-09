import { module, test } from 'qunit';
import { setupTest } from 'libwallet-app/tests/helpers';

module('Unit | Service | libwallet-mobile', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:libwallet-mobile');
    assert.ok(service);
  });
});
