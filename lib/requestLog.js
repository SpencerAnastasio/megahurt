'use strict';

// Load Modules
var util = require('util');

// Log Request Object To Console
exports.logger = function(req, res, next){
  console.log('//---- request object ----//');
  console.log('PARAMS: ' + req.params);
  console.log('QUERY: ' + req.query);
  console.log('BODY: ' + req.body);
  console.log('ROUTER INFO: ' + util.format('path: %s, verb: %s', req.route.path, req.route.methods));
  console.log('//------------------------//');
  next();
};
