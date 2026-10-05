var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var path = require('path');
require('dotenv').config();

var indexRouter = require('./routes/index');

var app = express();
var cors = require('cors')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
  origin: ['https://astro-answer.com', 'https://www.astro-answer.com', 'https://astro-answer.fly.dev']
}))
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/api', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  if (err.status === 404) {
    res.render('404.html');
  } else {
    console.error(err);
    res.send('Something went wrong.');
  }
});

module.exports = app;
