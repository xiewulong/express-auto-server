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
const peppa = require('peppa');
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

class Application {

	constructor(config) {
		if(!config.path || !config.port) {
			console.error('path or port is undefined');
			return;
		}

		this.app = express();
		this.config = Object.assign({}, defaultConfig, config);

		this.init();
	}

	init() {
		this.settings();
		this.setAlias();
		this.setLocals();
		this.useLogger();
		this.useBodyParser();
		this.useCookie();
		this.useStatic();
		this.useJsonServer();
		this.setController();
		this.errorHandler();
		this.listen();
	}

	settings() {
		this.app.set('env', this.config.env);

		// this.app.set('case sensitive routing', false);
		// this.app.set('strict routing', false);

		// this.app.set('jsonp callback name', '?callback=');
		// this.app.set('json replacer', null);
		this.app.set('json spaces', this.config.jsonSpaces);

		// this.app.set('etag', true);
		// this.app.set('query parser', 'extended');	// 'simple' or 'extended'
		// this.app.set('subdomain offset', 2);
		// this.app.set('trust proxy', false);
		this.app.set('views', path.join(this.config.path, this.config.views));
		// this.app.set('view cache', false);	// true in production
		this.app.set('view engine', this.config.engine);

		this.app.set('x-powered-by', false);
	}

	setAlias() {
		this.app.alias = peppa.alias();
	}

	setLocals() {
		this.app.alias('@app', this.config.path);
		if(this.config.common) {
			this.app.alias('@common', this.config.common);
		}

		this.app.locals.minAsset = this.app.get('env') === 'production' ? '.min' : '';
	}

	useLogger() {
		if(this.app.get('env') === 'production') {
			return;
		}

		this.app.use(logger('dev'));
	}

	useBodyParser() {
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({extended: false}));
	}

	useCookie() {
		this.app.use(cookieParser());
	}

	useStatic() {
		if(this.config.static) {
			this.app.use(express.static(path.join(this.config.path, this.config.static), this.config.staticOptions || {
				// dotfiles: 'ignore',
				// etag: true,
				// extensions: false,
				// index: 'index.html',
				// lastModified: true,
				// maxAge: 0,
				// redirect: true,
				// setHeaders: '',
			}));
			return;
		}
		if(this.config.favicon) {
			this.app.use(favicon(path.join(this.config.path, this.config.favicon)));
			return;
		}
	}

	useJsonServer() {
		if(!this.config.jsonServer) {
			return;
		}

		if(this.config.jsonServer === true) {
			this.config.jsonServer = path.join('@app', 'db');
		}

		let dbPath = this.app.alias(this.config.jsonServer);
		let db = require(dbPath);
		if(!db.route) {
			db.route = '/api';
		}

		if(db.routes) {
			this.app.use(db.route, jsonServer.rewriter(db.routes));
		}

		let dbStat = fs.statSync(dbPath);
		if(!dbStat.isDirectory()) {
			dbPath = path.dirname(dbPath);
		}

		let tables = db.tables;
		if(db.json) {
			if(db.json === true) {
				db.json = 'db.json';
			}

			let jsonPath = path.join(dbPath, db.json);
			if(!fs.existsSync(jsonPath)) {
				fs.writeFileSync(jsonPath, JSON.stringify(tables));
			}

			tables = jsonPath;
		}

		this.app.use(db.route, jsonServer.router(tables));
	}

	setController() {
		this.app.autoController(path.join(this.config.path, this.config.controllers));
	}

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
			res.locals.error = this.app.get('env') === 'production' ? {} : err;

			res.status(err.status || 500);
			this.config.errorView ? res.render(this.config.errorView) : res.send(res.locals.message);
		});

	}

	listen() {
		this.server = http.createServer(this.app);
		this.server.listen(this.config.port);
	}

}

module.exports = function(config) {
	return new Application(config);
};
