var JSONStream = require('JSONStream');
var es = require('event-stream');
var fs = require('fs');
var elastic = require('./elastic.js')();

//var MAX_CHARACTERS = 15;
//var MAX_INDEX_LINES = 750;
//var key ="product";

//Read the content using streaming JSON 
var load = function(file) {
    var s = fs.createReadStream(file);
    var count =1;
    console.log("Start Loading ElasticSearch");
    s.pipe(JSONStream.parse('*.name'))
        .pipe(es.mapSync(function (data) {
          if(count==1) console.log(count + " "+ data)
            store(data,count);
            count++;
        }))
}

//Store the name to redis for autocompletion
var store = function(str,count) {
  elastic.index({
    index: 'products',
    type: 'products',
    id:count,
    body: {
      name: str
    }
  }, function (error, response) {
      if(error)
        console.log("Error storing elasticsearch:"+ error);
  });
}    

//Filter the non wanted characters from the names
var filter = function(str) {
  if (!str) {
    return "";
  }
  return str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
}


//Query the Elasticsearch
var query = function(str, callback) {
  console.log(str);
  str = filter(str).trim();

  query = {
    index: 'products',
    body: {
      "query": {
        "match_phrase_prefix" : {
            "name" : str
        }
      }
    }
  };

  var data = elastic.search(query, function (error, response) {
    if(error)
    {
      console.log("Error quering Elasticsearch:"+error);
      return callback(true, null);
    }

    //Iterate through the responce and populate the array
    console.log("Elasticsearch got:"+response);
    var retval = [];
    for(i=0;i<response.hits.hits.length;i++)
    {
      console.log(response.hits.hits[i]._source.name);
      retval.push(response.hits.hits[i]._source.name);
    };
    return callback(null, retval);
  });

  
  
};

module.exports = {
  load: load,
  query:query

}