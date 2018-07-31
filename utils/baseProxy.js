const packageInfo = require('../package.json');
const queryString = require('querystring');
const log = require('./logger');

class baseProxy {
  // check params
  checkOut(option) {
    const { name } = packageInfo;
    if (!option) {
      throw Error(`${name}: missing main parameters`);
    }
    if (!option.proxies || !Array.isArray(option.proxies)) {
      throw Error(`${name}: The parameter is required and the type must be Array: proxyArray`);
    }
    this.options = {
      log: log(process.env.LOG_LEVEL || option.logLevel || 'info'),
      proxyTimeout: option.proxyTimeout || 30000,
      proxies: option.proxies,
      handleError: option.error,
    };
  }
  // handle event：proxyReq、proxyRes、error
  handle(proxyServer, event) {
    const { handleReq, handleRes, handleError } = event;

    proxyServer.on('proxyReq', (proxyReq, req, res, options) => {
      if (handleReq) {
        handleReq.call(null, { proxyReq, req, res, options });
      }
      if (req.body && Object.keys(req.body).length) {
        const contentType = proxyReq.getHeader('Content-Type');
        let bodyData;
        if (contentType.match(/application\/json/)) {
          bodyData = JSON.stringify(req.body);
        } else if (contentType.match(/application\/x-www-form-urlencoded/)) {
          bodyData = queryString.stringify(req.body);
        }
        if (bodyData) {
          proxyReq.write(bodyData);
          proxyReq.end();
        }
      }
    });
    proxyServer.on('proxyRes', (proxyRes, req, res) => {
      if (handleRes) {
        handleRes.call(null, { proxyRes, req, res });
      }
    });
    proxyServer.on('error', (err, req, res) => {
      if (handleError) {
        handleError.call(null, { err, req, res });
      }
    });
  }
}

module.exports = baseProxy;
