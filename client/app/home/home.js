var home = angular.module('grizzly.home', []);
// ----------------------------------------------------
// Angular controller for home page
// ----------------------------------------------------
home.controller('HomeController', function ($scope, HomeServices) {

  $scope.joinParty = function () {
    HomeServices.joinParty();
  };
});

// ----------------------------------------------------
// Angular services for home page
// ----------------------------------------------------
home.factory('HomeServices', function ($location) {
  var services = {};

  services.joinParty = function () {


    console.log('joining party');
    // This needs to query the server to see if there is a party with the name typed into the input box

    $location.path('/portal');


  };

  return services;
});
