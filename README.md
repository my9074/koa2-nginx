# koa2-nginx
![npm](https://img.shields.io/npm/v/koa2-nginx)
[![codecov](https://codecov.io/gh/my9074/koa2-nginx/branch/master/graph/badge.svg)](https://codecov.io/gh/my9074/koa2-nginx)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![dependency Status](https://img.shields.io/david/my9074/koa2-nginx.svg?style=flat-square)](https://david-dm.org/my9074/koa2-nginx#info=dependencies)
[![Known Vulnerabilities](https://snyk.io/test/github/my9074/koa2-nginx/badge.svg?targetFile=package.json)](https://snyk.io/test/github/my9074/koa2-nginx?targetFile=package.json)

Proxy middleware for koa2 based on [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware) wrapper and support for configuring multiple proxy rules. The way to use is inspired by the [proxy](https://webpack.js.org/configuration/dev-server/#devserverproxy) option of [webpack-dev-server](https://github.com/webpack/webpack-dev-server)

## TL;DR

Proxy `/api` requests to `http://www.example.com`

```javascript
var koa = require('koa');
var proxy = require('koa2-nginx');

var app = koa();

app.use(
  proxy({ '/api': { target: 'http://www.example.com', changeOrigin: true } })
);
app.listen(3000);

// http://localhost:3000/api/v1 -> http://www.example.com/api/v1
```

_All_ `http-proxy-middleware` [options](https://github.com/chimurai/http-proxy-middleware#options) can be used.

**Tip:** Set the option `changeOrigin` to `true` for [name-based virtual hosted sites](http://en.wikipedia.org/wiki/Virtual_hosting#Name-based).

## Breaking with `koa2-nginx@1.x`

* V2.x version is a fully refactored version
* V1.x version is based on [http-proxy](https://github.com/http-party/node-http-proxy), and the v2 version provides more rich and reasonable configuration based on [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware).
* The logic for internally processing `context-length` is ***removed***, and we think this should be handled by the developer itself in the [events](https://github.com/chimurai/http-proxy-middleware#http-proxy-events) hooks.

## Table of Contents

<!-- MarkdownTOC autolink=true bracket=round depth=2 -->
- [Install](#install)
- [Example](#example)
- [Options](#options)
- [Usage](#usage)
- [Working examples](#working-examples)
- [FAQ](#faq)

<!-- /MarkdownTOC -->

## Install

```javascript
$ npm i koa2-nginx
```

## Example

An example with `koa2` server.

```javascript
// include dependencies
const Koa = require('koa');
const proxy = require('koa2-nginx');

// proxy middleware options
const options = {
  '/api': {
    target: 'http://www.example.com', 
    changeOrigin: true,
  },
  '**/*.html': {
    target: 'http://www.example2.com', 
    changeOrigin: true
  },
  '/user': 'http://localhost:3000'
};

// create the proxy (without context)
const exampleProxy = proxy(options);

// mount `exampleProxy` in web server
const app = new Koa();
app.use(exampleProxy);
app.listen(3000);
```

## Options

### koa2-nginx options

- **autoProcessReqBody**: If **koa2-nginx** is behind the **body-parser**, it may cause the request body to fail to proxy. Set `autoProcessReqBody` to **true** can proxy the request body in `json` and `form` content-type.

### http-proxy-middleware options

Can refer option to [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware#options) for each forwarding rule.

### http-proxy options

Can refer option to [http-proxy](https://github.com/http-party/node-http-proxy#options) for each forwarding rule.

## Usage

Option supports multiple pattern-matching proxy

#### normal

```javascript
let option = {
  '/api': {
    target: 'http://www.example.com', 
    changeOrigin: true,
    onProxyRes(proxyRes, req, res) {
      proxyRes.headers['x-added'] = 'foobar'; // add new header to response
      delete proxyRes.headers['x-removed'];
    },
    onProxyReq(proxyReq, req, res) {
      proxyReq.setHeader('x-added', 'foobar');
    }
  }
}
```

#### function

```javascript
let option = {
  '/api': function() {
    // your custom logic
    return {
        target: 'http://www.example.com', 
        changeOrigin: true,
    }
  }
}
```

#### batch proxy

If you want to proxy multiple, specific paths to the same target, you can use an array of one or more objects with a `context` property:

```javascript
let option = [{
    context: ['/auth', '/api'], target: 'http://localhost:3000'
}]
```

## Working examples

- [EggJS]() TODO

## FAQ
1. POST/PUT request body is not proxied to the servers [#40](https://github.com/chimurai/http-proxy-middleware/issues/40#issuecomment-163398924) or set `autoProcessReqBody` to `true`