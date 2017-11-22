
module.exports = function () {
  var elastic = require('elasticsearch'),

  /*
  credentials = { username: process.env.ELASTICSEARCH_USER, 
                  password: process.env.ELASTICSEARCH_PWD, 
                  public_hostname: process.env.ELASTICSEARCH_HOST};
  bits = credentials.public_hostname.split('/'),
  hostname = bits[0],
  port = parseInt(bits[1]),
  */

  es_client = elastic.Client({
    host:'localhost:9200',
    log:'error'
  });
  console.log("Connecting to Elasticsearch server on localhost");  
  return es_client;
};