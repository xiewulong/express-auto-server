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

class Assets {

	constructor(app, options = {}) {

	}

}

express.application.autoAssets = function(options = {}) {
	new Assets(this, options);
};

module.exports = Assets;
