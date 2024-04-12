'use strict';

// var User = require('../models/user');

exports.index = function(req, res){
  // if(req.session.userId){
  //   User.findById(req.session.userId.toString(), function(user){
  //     res.render('home/index', {user:user});
  //   });
  // }else{
  res.render('index.ejs');
  // }
};
