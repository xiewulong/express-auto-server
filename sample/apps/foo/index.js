/*!
 * foo
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2017/04/06
 * since: 0.0.1
 */
'use strict';

const expressAutoServer = require('../../../');

const config = require('./config');
config.path = __dirname;

expressAutoServer(config);
