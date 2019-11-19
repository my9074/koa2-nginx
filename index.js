const HttpProxy = require('http-proxy');
const compose = require('koa-compose');
const baseProxy = require('./utils/baseProxy');
const route = require('path-match')();

class Proxy extends baseProxy {
  nginx(context, options) {
    return (ctx, next) => {
      // use path-match if context set like '/post/:id'
      // use startsWith if context set like 'post'
      if (/^\//.test(context)) {
        if (!route(context)(ctx.url)) return next();
      } else if (!ctx.url.startsWith(`/${context}`)) {
        return next();
      }

      const proxyServer = HttpProxy.createProxyServer();
      const { logs, rewrite, target } = options;
      ctx.req.body = ctx.request.body || null;
      options.headers = ctx.request.headers;
      return new Promise(resolve => {
        if (typeof rewrite === 'function') {
          ctx.req.url = rewrite(ctx.url);
        }

        if (ctx.logger && logs) {
          ctx.logger.info(
            '[koa2-nginx] [target] %s - proxy - [method] %s [url] %s',
            target,
            ctx.req.method,
            ctx.req.url
          );
        }

        if (logs) {
          this.options.log.info(
            target,
            '- proxy -',
            ctx.req.method,
            ctx.req.url
          );
        }

        this.handle(proxyServer, options.event);

        proxyServer.web(ctx.req, ctx.res, options, e => {
          const status = {
            ECONNRESET: 502,
            ECONNREFUSED: 503,
            ETIMEOUT: 504,
          }[e.code];
          if (status) ctx.status = status;

          if (options.event && options.event.handleError) {
            options.event.handleError.call(null, {
              e,
              req: ctx.req,
              res: ctx.res,
            });
          } else if (this.options.handleError) {
            this.options.handleError.call(null, {
              e,
              req: ctx.req,
              res: ctx.res,
            });
          }

          if (ctx.logger && logs) {
            ctx.logger.info(
              '[koa2-nginx proxyServer.web] [target] %s - proxy - [method] %s [url] %s',
              target,
              ctx.req.method,
              ctx.req.url
            );
          }

          if (logs) {
            this.options.log.error(
              '- proxy -',
              ctx.status,
              ctx.req.method,
              ctx.req.url
            );
          }
          resolve();
        });
      });
    };
  }
  proxy(options) {
    this.checkOut(options);
    const mildArr = [];
    const { proxies, proxyTimeout } = this.options;
    proxies.forEach(proxy => {
      mildArr.push(
        this.nginx(proxy.context, {
          target: proxy.host,
          changeOrigin: true,
          xfwd: true,
          rewrite: proxy.rewrite,
          logs: proxy.log || true,
          proxyTimeout: proxy.proxyTimeout || proxyTimeout,
          event: proxy.event,
        })
      );
    });
    return compose(mildArr);
  }
}
module.exports = new Proxy();
