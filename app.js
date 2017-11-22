var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var redis_ac = require('./lib/redis_autocomplete.js');
var elastic_ac = require('./lib/elastic_autocomplete.js');
const md5File = require('md5-file');

//Autocomplete control information
var etag="";
var pf="./products.json";

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /publicapp.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Initialize the data
console.log("Listening port: "+process.env.PORT);
etag = md5File.sync(pf);
redis_ac.load(pf);
elastic_ac.load(pf);

// query the data set 
app.get("/api", function(req,res) {
  
    var qe = redis_ac;
    var query = req.query.query;
    var elastic = req.query.elastic;
    if(elastic=="true")
    {
      qe=elastic_ac;
    }
  
    qe.query(query, function(err, data) {
    if (err) {
      console.log("Error:"+err);
      return res.send([]);
    } 
    console.log("Result:"+data);
    res.setHeader("Content-Type", "application/json");
    //res.setHeader("Cache-Control", "public, max-age=100");
    //res.setHeader("ETag", etag);
    res.json(data);
  }); 
});

//Load / refresh the content form the .json file
app.get("/load", function(req,res) {
      console.log(req.query);
      etag = md5File.sync(pf);
      console.log(`The MD5 sum of LICENSE.md is: ${etag}`);
      redis_ac.load(pf);
      elastic_ac.load(pf);
      return res.send("Loading initiated");   
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
