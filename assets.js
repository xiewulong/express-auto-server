/*!
 * assets
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2017/05/09
 * since: 0.0.1
 */
'use strict';

const fs = require('fs');
const path = require('path');

const crc32 = require('crc32');
const express = require('express');

const defaultOptions = {
	basePath: '@static',
	baseUrl: '@web',
	publishPath: 'assets',
	timestamp: false,
};

class Assets {

	constructor(app, options = {}) {
		if(!app) {
			console.error('app is required');
			return;
		}

		this.app = app;
		this.options = Object.assign(defaultOptions, options);

		this._bundles = {};
		this.bundles = [];

		this.app.locals.assets = this;
		return this.app;
	}

	get endHead() {

	}

	get endBody() {

	}

	use(bundlePath) {
		this.bundle(bundlePath);
		this.register();
	}

	bundle(bundlePath) {
		if(this._bundles[bundlePath]) {
			return;
		}

		let bundle = require(this.app.alias(bundlePath));
		bundle.depends && bundle.depends.forEach((depend) => {
			this.bundle(depend);
		});

		this.bundles.push(bundle);
		this._bundles[bundlePath] = true;
	}

	register() {
		this.bundles.forEach((bundle) => {
			bundle.sourcePath && this.publish(bundle);

			// if(bundle.css) {
			// 	let cssOptions = bundle.cssOptions || {};
			// 	bundle.css.forEach((css) => {

			// 	});
			// }

			// if(bundle.js) {
			// 	let jsOptions = bundle.jsOptions || {};
			// 	bundle.js.forEach((js) => {

			// 	});
			// }
		});
	}

	publish(bundle) {
		if(!bundle.sourcePath) {
			return;
		}

		let sourcePath = this.app.alias(bundle.sourcePath);
		let stat = fs.statSync(sourcePath);
		if(!stat || !stat.isDirectory()) {
			console.error('Source path must be a directory: ' + sourcePath);
			return;
		}

		let basePath = bundle.basePath || `${this.options.basePath}/${this.options.publishPath}`;
		let baseUrl = bundle.baseUrl || `${this.options.baseUrl}/${this.options.publishPath}`;

		let basename = bundle.name || this.hash(sourcePath);
		bundle.basePath = this.app.alias(`${basePath}/${basename}`);
		bundle.baseUrl = this.app.alias(`${baseUrl}/${basename}`);

		fs.symlinkSync(sourcePath, bundle.basePath, 'dir');

	}

	hash(sourcePath) {
		if(typeof this.options.hash === 'function') {
			return this.options.hash(sourcePath);
		}

		let stat = fs.statSync(sourcePath);
		return crc32(`${sourcePath}${stat.mtime}`);
	}

}

express.application.autoAssets = function(options = {}) {
	return new Assets(this, options);
};

module.exports = (app, options = {}) => {
	return new Assets(app, options);
};
