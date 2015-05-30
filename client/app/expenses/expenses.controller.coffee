'use strict'

angular.module 'moneyApp'
.controller 'ExpensesCtrl', ($scope, $http, $log, $stateParams) ->
  tag = 'ExpensesCtrl'

  $scope.names = ['날짜', '내용', '금액', '']

  $http.get "/api/expenses/months"
  .success (data) ->
    months = $scope.months = data.months
    date = $scope.date = $scope.months[0]

  .error (error) ->
    $log.error tag, error

  $scope.$watch 'date', (newDate) ->
    return if !newDate

    year = parseInt newDate.month.split('-')[0], 10
    month = parseInt newDate.month.split('-')[1], 10

    $http.get "/api/expenses?year=#{ year }&month=#{ month }"
    .success (data) ->
      expenses = $scope.expenses = data.expenses
      $scope.sum = _.sum expenses, (item) ->
        item.amount
    .error (error) ->
      $log.error tag, error
