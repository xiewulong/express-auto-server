/*!
 * assets
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2017/05/09
 * since: 0.0.1
 */
'use strict';

const fs = require('fs');
const path = require('path');

const express = require('express');

const defaultOptions = {

};

class Assets {

	constructor(app, options = {}) {
		if(!app) {
			console.error('app is required');
			return;
		}

		this.app = app;
		this.options = Object.assign(defaultOptions, options);
	}

}

express.application.autoAssets = function(options = {}) {
	return new Assets(this, options);
};

module.exports = (app) => {
	return new Assets(app, options);
};
