// Generated by CoffeeScript 1.9.2
(function() {
  'use strict';
  angular.module('moneyApp').controller('LoginCtrl', function($scope, $log, $location, $http) {
    var tag;
    tag = 'LoginCtrl';
    $scope.email = $location.search().tryEmail;
    $scope.trySubmit = false;
    $scope.login = function(email, pass) {
      $scope.trySubmit = true;
      if ($scope.form.$invalid) {
        return;
      }
      return $http.post('/api/auth', {
        username: email,
        password: pass
      }).success(function(data) {
        $log.info(tag, 'login success', data);
        return $scope.helpMsg = '환영';
      }).error(function(error) {
        $log.warn(tag, 'login fail', error);
        return $scope.helpMsg = '인증실패. 재시도';
      });
    };
    return $scope.showError = function(form, validator, trySubmit) {
      return trySubmit && form.$error && form.$error[validator];
    };
  });

}).call(this);

//# sourceMappingURL=login.controller.js.map
