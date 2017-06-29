/*!
 * user
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2017/04/13
 * since: 0.0.1
 */
'use strict';

const faker = require('faker/locale/zh_CN');

let items = [];
for(let i = 0, len = 10; i < len; i++) {
	items.push({
		id: i + 1,
		name: faker.internet.userName(),
		email: faker.internet.email(),
	});
}

module.exports = items;
