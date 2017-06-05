/*!
 * db
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2017/04/13
 * since: 0.0.1
 */
'use strict';

const product = require('./product');
const user = require('./user');

module.exports = {
	json: true,
	// route: '/api',
	routes: {
		'/good': '/product',
	},
	tables: {
		product,
		user,
	},
};
