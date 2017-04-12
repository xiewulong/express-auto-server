/*!
 * express auto server
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2017/04/06
 * since: 0.0.1
 */
'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jsonServer = require('json-server');
const logger = require('morgan');
const favicon = require('serve-favicon');
const express = require('express');
const autoController = require('express-auto-controller');

const defaultConfig = {
	controllers: 'controllers',
	engine: 'pug',
	env: process.env.NODE_ENV || 'production',
	errorView: '',
	jsonSpaces: 2,
	views: 'views',
};

const application = function(config) {
	if(!config.path || !config.port) {
		console.error('path or port is undefined');
		return;
	}

	this.app = express();
	this.config = Object.assign(defaultConfig, config);

	this.init();
};

application.prototype = {

	init() {
		this.setLocals();
		this.setViews();
		this.setJsonSpaces();
		this.useLogger();
		this.useBodyParser();
		this.useCookie();
		this.useStatic();
		this.useJsonServer();
		this.setController();
		this.errorHandler();
		this.listen();
	},

	setLocals() {
		this.app.locals.minAsset = this.config.env === 'production' ? '.min' : '';
	},

	setViews() {
		this.app.set('views', path.join(this.config.path, this.config.views));
		this.app.set('view engine', this.config.engine);
	},

	setJsonSpaces() {
		this.app.set('json spaces', this.config.jsonSpaces);
	},

	useLogger() {
		if(this.config.env === 'production') {
			return;
		}

		this.app.use(logger('dev'));
	},

	useBodyParser() {
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({extended: false}));
	},

	useCookie() {
		this.app.use(cookieParser());
	},

	useStatic() {
		if(this.config.static) {
			this.app.use(express.static(path.join(this.config.path, this.config.static)));
			return;
		}
		if(this.config.favicon) {
			this.app.use(favicon(path.join(this.config.path, this.config.favicon)));
			return;
		}
	},

	useJsonServer() {
		if(!this.config.jsonServer) {
			return;
		}

		if(!this.config.jsonServer.path || !this.config.jsonServer.route) {
			console.error('json-server: path or route is undefined, skipped!');

			return;
		}

		if(this.config.jsonServer.routes) {
			this.app.use(this.config.jsonServer.route, jsonServer.rewriter(this.config.jsonServer.routes));
		}

		let dir = path.resolve(this.config.path, this.config.jsonServer.path);
		fs.readdirSync(dir).map((file) => {
			let ext = path.extname(file);

			if(ext == '.json') {
				this.app.use(this.config.jsonServer.route, jsonServer.router(path.join(dir, file)));
			}

			if(ext == '.js') {
				this.app.use(this.config.jsonServer.route, jsonServer.router(path.join(dir, file)));
			}
		});
	},

	setController() {
		this.app.autoController(path.join(this.config.path, this.config.controllers));
	},

	errorHandler() {

		// 404
		this.app.use((req, res, next) => {
			let err = new Error('Not Found');
			err.status = 404;

			next(err);
		});

		// all errors
		this.app.use((err, req, res, next) => {
			res.locals.message = err.message;
			res.locals.error = this.config.env === 'production' ? {} : err;

			res.status(err.status || 500);
			this.config.errorView ? res.render(this.config.errorView) : res.send(res.locals.message);
		});

	},

	listen() {
		this.server = http.createServer(this.app);
		this.server.listen(this.config.port);
	},

};

module.exports = function(config) {
	return new application(config);
};
