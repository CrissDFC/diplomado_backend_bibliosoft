const test = require('node:test');
const assert = require('node:assert/strict');

test('la aplicación expone health check', () => {
  const app = require('../app');

  assert.equal(typeof app, 'function');
  assert.ok(app.router.stack.some((layer) => layer.route?.path === '/api/health'));
});
