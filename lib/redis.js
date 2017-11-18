module.exports = function () {
  var redis = require('redis'),
  credentials = { username: process.env.REDIS_USER, 
                  password: process.env.REDIS_PWD, 
                  public_hostname: process.env.REDIS_HOST};
  bits = credentials.public_hostname.split('/'),
  hostname = bits[0],
  port = parseInt(bits[1]),
  client = redis.createClient(port, hostname);
  client.auth(credentials.password);
  console.log("Connecting to Redis server on", credentials.public_hostname);  
  return client;
};