/*!
 * config
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2017/04/06
 * since: 0.0.1
 */
'use strict';

const path = require('path');

module.exports = Object.assign(
	{}
	, require('./app')
	, {
		common: path.dirname(__dirname),
	}
);
