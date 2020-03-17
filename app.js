const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session')
const bodyParser = require('body-parser');
const cookieConfig = require('./config/cookie.config');

// var routes = require('./routes/outputRouter');
const routerConfig = require('./config/router.config');

const ejsFunctions = require('./utility/ejsFunctions');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 上线模式
// app.set('env', 'production');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));
//ejs工具类
app.locals.ejsFunctions = ejsFunctions;

app.use(session({
    secret: cookieConfig.secret.sessionSecret,
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: cookieConfig.cookieMaxAge,
        signed: true
    },
    rolling: true
}));

// 路由配置已分离到config/router.config.js
routerConfig(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
