var JSONStream = require('JSONStream');
var es = require('event-stream');
var fs = require('fs');
var redis = require('./redis.js')();

var MAX_CHARACTERS = 15;
var MAX_INDEX_LINES = 750;
var key ="product";

//Read the content using streaming JSON 
var load = function(file) {
    var s = fs.createReadStream(file);
    var count =1;
    console.log("Start Loading");
    s.pipe(JSONStream.parse('*.name'))
        .pipe(es.mapSync(function (data) {
          if(count==1) console.log(count + " "+ data)
            store(data);
            count++;
        }))
}

//Store the name to redis for autocompletion
var store = function(str) {
    var lcstring = filter(str).trim();
    var multi = redis.multi();
    var top = Math.max(lcstring.length-1, MAX_CHARACTERS);
    for(var i = lcstring.length-1; i>=1; i--) {
      var bit = lcstring.substr(0, lcstring.length - i);
      multi.zadd(key, 0, bit.trim())
    }
    multi.zadd(key, 0, lcstring+"*"+str);
    multi.exec(); 
}    

//Filter the non wanted characters from the names
var filter = function(str) {
  if (!str) {
    return "";
  }
  return str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
}


//Query the redis
var query = function(str, callback) {
  console.log(str);
  str = filter(str).trim();
  str = str.substr(0, MAX_CHARACTERS);
  redis.zrank(key, str, function(err, data) {
    if (err || data == null) {
      console.log(err + data);
      return callback(true, null);
    }
    redis.zrange(key, data, data+MAX_INDEX_LINES, function(err, data) {
      if (err) {
        console.log(err);
        return callback(true, null);
      }
      var retval = [];
      for(var i in data) { 
        var match = data[i].match(/(.*)\*(.*)/)
        if (match) {
          if(match[1].indexOf(str) !=0) {
            break;
          }
          retval.push(match[2])
        }
      }
      callback(null, retval);
    })
  });
};

module.exports = {
  load: load,
  query:query

}