/*!
 * home
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2017/04/06
 * since: 0.0.1
 */
'use strict';

module.exports = {

	index(req, res, next) {
		console.dir(req.app.locals);
		res.render('home', {
			title: 'foo home',
		});
	},

};
