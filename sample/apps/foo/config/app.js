/*!
 * app
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2017/04/06
 * since: 0.0.1
 */
'use strict';

// module.exports = Object.assign({
// 	port: 30003,
// 	static: 'dist',
// }, require('./app.local'));

module.exports = {
	jsonServer: {
		path: 'dbs',
		route: '/api',
		routes: {
			'/member': '/user',
		},
	},
	port: 30001,
};
