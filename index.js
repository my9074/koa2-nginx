const compose = require('koa-compose');
const { setupProxyFeature, setupMiddlewares } = require('./lib');

module.exports = options => {
  const newOptions = setupProxyFeature(options);
  const middles = setupMiddlewares(newOptions);

  return compose(middles);
};
