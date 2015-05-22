'use strict';

var _ = require('lodash');
var models = require('../../models');
var email = require('../../components/email');

// Get auth info saved in session memory
exports.index = function (req, res) {
  res.json(req.user);
};

// Login
exports.login = function (req, res) {
  res.status(201).json(req.user);
};

// Logout
exports.logout = function (req, res) {
  req.logout();
  res.json({logout: true});
};

// Reset password
exports.resetPassword = function (req, res) {
  var newPassword = new Date().getTime().toString().substring(8, 12);
  var newPassword2 = require('crypto').createHash('md5').update(newPassword).digest('hex');

  models.User.findOne({where: {email: req.body.email}}).then(function (user) {
    if (!user) {
      res.status(404).send();
    }

    user.updateAttributes({pass: newPassword2}).then(function (affectedCount) {
      if (affectedCount) {
        email('Reset Password: ' + newPassword, '', user.email).then(function (info) {
          console.log(info);
          res.json(info);
        }, function (error) {
          console.error(error);
          res.status(500).json(error);
        })
      } else {
        res.status(404).send();
      }
    })
  })
};