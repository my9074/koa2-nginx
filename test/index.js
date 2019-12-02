const expect = require('expect.js');
const {
  setupProxyFeature,
  setupMiddlewares,
  wraperProxyReqHandler
} = require('../lib');

describe('utils', function() {
  describe('setupProxyFeature', function() {
    it('option transform correct', function() {
      const opt = {
        '/api': {
          target: 'http://www.example.com'
        }
      };

      const newOpt = setupProxyFeature(opt);

      expect(newOpt).eql([
        { context: '/api', target: 'http://www.example.com', logLevel: 'info' }
      ]);
    });

    it('option array', function() {
      const opt = [
        {
          context: '/user',
          target: 'http://www.example.com'
        },
        {
          context: '/user',
          target: 'http://www.example.com'
        }
      ];
      const newOpt = setupProxyFeature(opt);

      expect(newOpt).to.have.length(2);
      expect(newOpt).eql(opt);
    });

    it('Object Option: when option[context] is string, item of keys only have 3 key', function() {
      const opt = {
        '/api': 'http://www.example.com'
      };
      const newOpt = setupProxyFeature(opt);

      expect(newOpt[0]).to.only.have.keys(['context', 'target', 'logLevel']);
    });

    it('option has hasOwnProperty target', function() {
      const opt = {
        context: '/api',
        target: 'http://www.example.com'
      };
      const newOpt = setupProxyFeature(opt);

      expect(newOpt[0]).eql(opt);
    });
  });

  describe('setupMiddlewares', function() {
    it('proxyMiddlewares length should not contain no target element', function() {
      const opt = [
        function() {
          return {
            target: 'http://www.example.com'
          };
        },
        {
          context: '/noTarget',
          changeOrigin: true
        }
      ];

      const middles = setupMiddlewares(opt);
      expect(middles).to.have.length(1 + 1);
    });

    it('option has autoProcessReqBody field', function() {
      const opt = [
        {
          context: '/api',
          target: 'http://www.example.com',
          autoProcessReqBody: true,
          onProxyReq(proxyRes, req, res) {
            // test
          }
        }
      ];
      setupMiddlewares(opt);
    });
  });

  describe('wraperProxyReqHandler', function() {
    it('when context-type is application/json', function() {
      const onProxyReq = function(proxyReq, req, res, options) {};
      const arg1 = {
        getHeader: args => {
          return 'application/json';
        },
        setHeader: (key, value) => {},
        write: args => {},
        end: () => {}
      };
      const arg2 = {
        koaReq: {
          body: {
            a: 1
          },
          rawBody: '{\n    "a": 1\n}'
        }
      };
      const arg3 = {};

      wraperProxyReqHandler(onProxyReq)(arg1, arg2, arg3);
    });

    it('when context-type is application/x-www-form-urlencoded', function() {
      const onProxyReq = function(proxyReq, req, res, options) {};
      const arg1 = {
        getHeader: args => {
          return 'application/x-www-form-urlencoded';
        },
        setHeader: (key, value) => {},
        write: args => {},
        end: () => {}
      };
      const arg2 = {
        koaReq: {
          body: 'a=1',
          rawBody: 'a=1'
        }
      };
      const arg3 = {};

      wraperProxyReqHandler(onProxyReq)(arg1, arg2, arg3);
    });
  });
});
