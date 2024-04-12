'use strict';

// Load Modules
var ejs        = require('ejs');
var http       = require('http');
var path       = require('path');
var express    = require('express');
var bodyParser = require('body-parser');

// Load File Exports
var initRoutes = require('./lib/initRoutes.js');
var reqLog     = require('./lib/requestLog.js');
var home       = require('./routes/home.js');

// Declare Variables
var app  = express();
var port = process.env.PORT || 3000;

// Configure Parsing
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '100kb'}));

// Configure View Engine
app.use(express.static(path.join(__dirname, '/static/')));
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views/');
app.set('view engine', 'html');

// Load Routes
app.use(initRoutes.loader);

// Start Server
http.createServer(app).listen(port, function(req, res){
  console.log('Node server listening on port ' + port);
});
