'use strict';

// Load Modules
var reqLog = require('./requestLog.js');
var home   = require('../routes/home.js');
// var users  = require('../routes/users.js');

// Declare Variables
var initialized = false;

// Initialize Routes
exports.loader = function(req, res, next){
  if(!initialized){
    load(req.app, next);
    initialized = true;
  }else{
    next();
  }
};

function load(app, next){
  app.get('/', reqLog.logger, home.index);
  // app.post('/', d, users.saveBeat);
  // app.get('/user/:name', d, users.loadBeat);
  // app.get('/register', d, users.new);
  // app.post('/register', d, users.create);
  // app.get('/login', d, users.login);
  // app.post('/login', d, users.authenticate);
  next();
};
