'use strict';

var _ = require('lodash');
var models = require('../../models');
var Expense = models.Expense;

// Get list of expenses
exports.query = function (req, res) {
  var year = req.query.year;
  var month = (function (month) {
    if (month < 10) {
      month = '0' + month
    }
    return month;
  })(req.query.month);

  var where = {UserId: req.user.user.id};
  if (year && month) {
    where.date = {$like: year + '-' + month + '%'}
  }

  Expense.findAll({
    where: where,
    order: 'createdAt DESC',
    limit: req.query.limit || 50,
    offset: req.query.offset || 0
  }).then(function (expenses) {
    res.json({expenses: expenses});
  });
};

// Get Months list
exports.getMonths = function (req, res) {
  var sql = 'SELECT distinct(left(date, 7)) as month FROM Expenses order by month desc';
  models.sequelize.query(sql).spread(function (results, metadata) {
    res.json({months: results})
  }).catch(function (error) {
    console.error(error);
    res.status(500).send();
  })
};

// New expense
exports.create = function (req, res) {
  Expense.create({
    UserId: req.user.user.id,
    amount: req.body.amount,
    text: req.body.text,
    date: new Date(req.body.date + ' 00:00:00')
  }).then(function (expense) {
    res.status(201).json({expense: expense})
  }).catch(function (error) {
    console.error(error);
    res.status(500);
  });
};

// Update expense
exports.update = function (req, res) {
  Expense.find(req.body.expenseId).then(function (expense) {
    expense.updateAttributes({
      date: req.body.date || expense.date,
      text: req.body.text || expense.text,
      amount: req.body.amount || expense.amount
    }).then(function (expense) {
      res.json({expense: expense});
    });
  });
};

// Remove expense
exports.remove = function (req, res) {
  console.log(req.params);
  console.log(req.query);
  Expense.find(req.params.expenseId).then(function (expense) {
    if (!expense) {
      return res.status(404).send();
    }
    expense.destroy().then(function (data) {
      res.json({delted: data});
    });
  });
};
