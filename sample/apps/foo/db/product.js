/*!
 * product
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2017/04/13
 * since: 0.0.1
 */
'use strict';

const faker = require('faker/locale/zh_CN');

let rows = [];
for(let i = 0, len = 1000; i < len; i++) {
	rows.push({
		id: i + 1,
		name: faker.commerce.productName(),
		price: faker.commerce.price(),
	});
}

module.exports = rows;
