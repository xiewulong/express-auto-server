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
		this.setAliases();
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

	setAliases() {
		this.app.locals.aliases = {};
		this.app.alias = (name, _path) => {
			if(_path) {
				this.app.locals.aliases[name] = _path;
				return;
			}

			if(name.indexOf('@')) {
				return name;
			}

			let sepPos = name.indexOf(path.sep);
			let _name = sepPos == -1 ? name : name.slice(0, sepPos);

			return name.replace(_name, this.app.locals.aliases[_name]);
		};
	},

	setLocals() {
		this.app.alias('@app', this.config.path);
		if(this.config.common) {
			this.app.alias('@common', this.config.common);
		}

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
