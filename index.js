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
const express = require('express');
const autoAsset = require('express-auto-asset');
const autoController = require('express-auto-controller');
const jsonServer = require('json-server');
const logger = require('morgan');
const peppa = require('peppa');
const favicon = require('serve-favicon');

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
		if(!config.basePath || !config.path || !config.port) {
			console.error('basePath, path or port is required.');
			return;
		}

		this.app = express();
		this.config = Object.assign({}, defaultConfig, config);

		this.init();
	}

	init() {
		this.setAlias();
		this.settings();
		this.useLogger();
		this.useBodyParser();
		this.useCookie();
		this.useStatic();
		this.useJsonServer();
		this.useAsset();
		this.setController();
		this.errorHandler();
		this.listen();
	}

	setAlias() {
		this.app.alias = peppa.alias();
		this.app.alias('@basePath', this.config.basePath);
		this.app.alias('@npm', this.app.alias('@basePath/node_modules'));
		this.app.alias('@app', this.config.path);
		if(this.config.common) {
			this.app.alias('@common', this.config.common);
		}
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
		this.app.set('views', this.app.alias(`@app/${this.config.views}`));
		// this.app.set('view cache', false);	// true in production
		this.app.set('view engine', this.config.engine);

		this.app.set('x-powered-by', false);
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
			let options = typeof this.config.static == 'string' ? {
				root: this.config.static,
				// path: '/',
				// dotfiles: 'ignore',
				// etag: true,
				// extensions: false,
				// index: 'index.html',
				// lastModified: true,
				// maxAge: 0,
				// redirect: true,
				// setHeaders: '',
			} : this.config.static;

			if(!options.root) {
				console.error('static root is undefined.');
				return;
			}

			let root = options.root;
			let path = options.path || '/';

			delete options.root;
			delete options.path;

			this.app.alias('@static', this.app.alias(`@app/${root}`));
			this.app.alias('@web', path);
			this.app.use(path, express.static(this.app.alias('@static'), options));

			return;
		}
		if(this.config.favicon) {
			this.app.use(favicon(this.app.alias(`@app/${this.config.favicon}`)));
		}
	}

	useJsonServer() {
		if(!this.config.jsonServer) {
			return;
		}

		if(this.config.jsonServer === true) {
			this.config.jsonServer = '@app/db';
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

		let tables = db.tables || {};
		if(db.json) {
			if(db.json === true) {
				db.json = 'db.json';
			}

			let jsonPath = `${dbPath}/${db.json}`;
			if(!fs.existsSync(jsonPath)) {
				fs.writeFileSync(jsonPath, JSON.stringify(tables));
			}

			tables = jsonPath;
		}

		this.app.use(db.route, jsonServer.router(tables));
	}

	useAsset() {
		if(this.config.asset === false) {
			return;
		}

		this.app.autoAsset(this.config.asset);
	}

	setController() {
		this.app.autoController(
			this.app.alias(`@app/${this.config.controllers.dir || this.config.controllers}`)
			, typeof this.config.controllers == 'string' ? {} : this.config.controllers
		);
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
