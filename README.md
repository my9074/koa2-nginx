# koa2-nginx
![npm](https://img.shields.io/npm/v/koa2-nginx)
[![Coverage Status](https://coveralls.io/repos/github/my9074/koa2-nginx/badge.svg?branch=next)](https://coveralls.io/github/my9074/koa2-nginx?branch=next)
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

## Table of Contents

<!-- MarkdownTOC autolink=true bracket=round depth=2 -->
- [Install](#install)
- [Example](#example)
- [Options](#options)
- [Usage](#usage)
- [Working examples](#working-examples)

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
    changeOrigin: true
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

Can refer option to [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware#options) for each forwarding rule.

## Usage

Option supports multiple pattern-matching proxy

#### normal

```javascript
let option = {
  '/api': {
    target: 'http://www.example.com', 
    changeOrigin: true,
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