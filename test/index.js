const expect = require('expect.js');
const { setupProxyFeature, setupMiddlewares } = require('../lib');

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
      expect(middles).to.have.length(1);
    });
  });
});
