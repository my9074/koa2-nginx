const httpProxyMiddleware = require('http-proxy-middleware');
const c2k = require('koa2-connect');
const qs = require('querystring');

/**
 * Middleware for delegate koa request/response to req.koaReq and res.koaRes
 *
 * @param {*} ctx
 * @param {*} next
 */
async function delegateKoaClass2StreamMid(ctx, next) {
  // delegate koa request/response to nodejs req.koaReq and res.koaRes
  ctx.req.koaReq = ctx.request;
  ctx.res.koaRes = ctx.response;
  await next();
}

/**
 *  Transform http-proxy-middleware to koa's middleware
 * @param {*} proxyConfig
 * @returns
 */
function getProxyMiddleware(proxyConfig) {
  const context = proxyConfig.context || proxyConfig.path || '/';

  if (proxyConfig.target) {
    return c2k(httpProxyMiddleware(context, proxyConfig));
  }
}

/**
 * When koa2-nginx is behind the body-parser middleware,
 * solve the problem that the body cannot be proxyed
 * @param {*} originProxyReq
 * @returns proxyReq event
 */
function wraperProxyReqHandler(onProxyReq) {
  return function(proxyReq, req, res, options) {
    if (typeof onProxyReq === 'function') {
      onProxyReq(proxyReq, req, res, options);
    }

    // https://github.com/koajs/bodyparser#raw-body
    if (
      Object.keys(req.koaReq.body).length ||
      (req.koaReq.body && req.koaReq.rawBody)
    ) {
      const contentType = proxyReq.getHeader('Content-Type');
      let bodyData;
      if (contentType.match(/application\/json/)) {
        bodyData = JSON.stringify(req.koaReq.body);
      } else if (contentType.match(/application\/x-www-form-urlencoded/)) {
        bodyData = qs.stringify(req.koaReq.body);
      }
      if (bodyData) {
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
        proxyReq.end();
      }
    }
  };
}

exports.wraperProxyReqHandler = wraperProxyReqHandler;

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
  const proxyMiddlewares = [delegateKoaClass2StreamMid];

  options.forEach(proxyConfigOrCallback => {
    const proxyConfig =
      typeof proxyConfigOrCallback === 'function'
        ? proxyConfigOrCallback()
        : proxyConfigOrCallback;

    if (proxyConfig.autoProcessReqBody) {
      proxyConfig.onProxyReq = wraperProxyReqHandler(proxyConfig.onProxyReq);
    }

    const proxyMiddleware = getProxyMiddleware(proxyConfig);

    if (proxyMiddleware) {
      proxyMiddlewares.push(proxyMiddleware);
    }
  });

  return proxyMiddlewares;
};
