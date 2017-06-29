/*!
 * db
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2017/04/13
 * since: 0.0.1
 */
'use strict';

module.exports = {
	json: true,
	// route: '/api',
	routes: {
		'/good': '/product',
		'/member': '/user',
	},
	tables: {
		product: require('./product'),
		user: require('./user'),
	},
};
