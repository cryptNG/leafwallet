import { module, test } from 'qunit';
import { setupRenderingTest } from 'libwallet-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | device-qr-code', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<DeviceQrCode />`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      <DeviceQrCode>
        template block text
      </DeviceQrCode>
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
