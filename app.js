var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var redis_ac = require('./lib/redis_autocomplete.js');


var app = express();

// uncomment after placing your favicon in /publicapp.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

console.log("Listening port: "+process.env.PORT);
redis_ac.load("./products.json");

// query the data set 
app.post("/api", function(req,res) {
    console.log("Query:"+req.body.query);
    redis_ac.query(req.body.query, function(err, data) {
    if (err) {
      console.log("Error:"+err);
      return res.send([]);
    } 
    console.log("Result:"+data);
    res.send(data);
  }); 
});

//Load / refresh the content form the .json file
app.get("/load", function(req,res) {
      console.log(req.query);
      redis_ac.load("./products.json");
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
