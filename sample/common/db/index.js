/*!
 * db
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2017/04/13
 * since: 0.0.1
 */
'use strict';

module.exports = {
	delay: 500,
	// foreignKeySuffix: 'Id',
	// id: 'id',
	json: 'db.json',
	// jsonSpaces: 2,
	// middlewares: [],
	// noCors: false,
	// noGzip: false,
	// readOnly: false,
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
