const compose = require('koa-compose');
const { setupProxyFeature, setupMiddlewares } = require('./lib/utils');

module.exports = options => {
  return async function(ctx, next) {

    const newOptions = setupProxyFeature(options)

    const middles = setupMiddlewares(newOptions)

    return compose(middles)
  };
};
