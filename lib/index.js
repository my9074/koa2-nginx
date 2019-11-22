const httpProxyMiddleware = require('http-proxy-middleware');
const c2k = require('koa2-connect');

function getProxyMiddleware(proxyConfig) {
  const context = proxyConfig.context || proxyConfig.path;

  if (proxyConfig.target) {
    return c2k(httpProxyMiddleware(context, proxyConfig));
  }
}

exports.setupProxyFeature = function(options) {
  if (!Array.isArray(options)) {
    if (Object.prototype.hasOwnProperty.call(options, 'target')) {
      options = [options];
    } else {
      options = Object.keys(options).map(context => {
        let proxyOptions;

        if (typeof options[context] === 'string') {
          proxyOptions = {
            context,
            target: options[context]
          };
        } else {
          proxyOptions = Object.assign({}, options[context]);
          proxyOptions.context = context;
        }

        proxyOptions.logLevel = proxyOptions.logLevel || 'info';

        return proxyOptions;
      });
    }
  }

  return options;
};

exports.setupMiddlewares = function(options) {
  const proxyMiddlewares = [];

  options.forEach(proxyConfigOrCallback => {
    const proxyConfig =
      typeof proxyConfigOrCallback === 'function'
        ? proxyConfigOrCallback()
        : proxyConfigOrCallback;

    const proxyMiddleware = getProxyMiddleware(proxyConfig);

    if (proxyMiddleware) {
      proxyMiddlewares.push(proxyMiddleware);
    }
  });

  return proxyMiddlewares;
};
