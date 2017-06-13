/*!
 * foo
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2017/04/06
 * since: 0.0.1
 */
'use strict';

const path = require('path');

const expressAutoServer = require('../../../');

let config = Object.assign(require('../../common/config'), require('./config'));
config.path = __dirname;
config.basePath = path.join(config.path, '..', '..', '..');

expressAutoServer(config);
