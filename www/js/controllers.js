angular.module('starter.controllers', ['ionic.cloud'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicDB, $ionicAuth, $ionicUser, $state) {

  $ionicDB.connect();
  var usersDB = $ionicDB.collection('users');
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});


  // Form data for the login modal
  $scope.loginData = {};
  $scope.user = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    var details = {"email": $scope.loginData.email, "password": $scope.loginData.password};
    $ionicAuth.login('basic', details).then(function() {
      alert("Login Successful.");
      $scope.modal.hide();
      console.log($ionicUser);
      usersDB.find({id:$ionicUser.id}).fetch().subscribe(function(USER) {
        scopeUser = USER;
        scopeUser.email = $ionicUser.details.email;
        $state.go('app.profile');
      });

    }, function(err) {
      alert("Incorrect email or password.");
      for (var e of err.details) {
        alert(e);
      }
    });
  };

  $scope.doRegister = function() {
    if($ionicAuth.isAuthenticated()) {
      $ionicAuth.logout();
    }

    var details = {"email": $scope.loginData.email, "password": $scope.loginData.password};
    $ionicAuth.signup(details).then(function(){
      alert("Signup Success! " + details.email);
      $scope.doLogin();
      usersDB.update({
        id: $ionicUser.id,
        image: [$ionicUser.image]
      });
    }, function(err) {
      for (var e of err.details) {
        if (e === 'conflict_email') {
          alert('Email already exists.');
        } else {
          alert(e);
        }
      }
    });
  };


})

.controller('ProfileCtrl', function($scope, $ionicModal, $timeout, $ionicDB, $ionicAuth, $ionicUser) {

  $scope.user = {};
  $ionicDB.connect();
  var usersDB = $ionicDB.collection('users');
  $scope.userData = {};

  angular.element(document).ready(function () {
    usersDB.find({id:$ionicUser.id}).fetch().subscribe(function(USER) {
      $scope.user = USER;
      $scope.user.email = $ionicUser.details.email;
    });
    $scope.user = $scope.updateUser();
  });

  $scope.checkAuth = function() {
    alert($ionicAuth.isAuthenticated() + " " + $ionicUser.details.name);

    // usersDB.update({
    //   id: "08dab02f-bf02-43af-bb43-fb550a91771d",
    //   description: "New description of korgankd using update function."
    // });
    // usersDB.find({id: "08dab02f-bf02-43af-bb43-fb550a91771d"}).fetch().subscribe(function(msg) {
    //   console.log(msg);
    // });
  };

  $scope.saveData = function() {
    if($ionicAuth.isAuthenticated()) {
      if($scope.userData.username != undefined) {
        usersDB.update({id: $ionicUser.id, username: $scope.userData.username});
      }
      if($scope.userData.name != undefined) {
        usersDB.update({id: $ionicUser.id, name: $scope.userData.name});
      }
      if($scope.userData.location != undefined) {
        usersDB.update({id: $ionicUser.id, location: $scope.userData.location});
      }
      if($scope.userData.description != undefined) {
        usersDB.update({id: $ionicUser.id, description: $scope.userData.description});
      }
      $scope.user = $scope.updateUser();
    }
  };

  $scope.updateUser = function() {
    var scopeUser = $scope.user;
    console.log($ionicUser);
    if($ionicAuth.isAuthenticated()) {
      usersDB.find({id:$ionicUser.id}).fetch().subscribe( function(USER) {
        scopeUser = USER;
        scopeUser.email = $ionicUser.details.email;
        //check for properties to update scope.user, if they exist - hide input bar
        if(scopeUser.username != undefined) {
          document.getElementById("username").style.display = "none";
        }
        if(scopeUser.name != undefined) {
          document.getElementById("name").style.display = "none";
        }
        if(scopeUser.location != undefined) {
          document.getElementById("location").style.display = "none";
        }
        if(scopeUser.description != undefined) {
          document.getElementById("description").style.display = "none";
        }
      });
    }
    console.log("scopeUser");
    console.log(scopeUser);
    return scopeUser;
  };

  $scope.logout = function() {
    $ionicAuth.logout();
    $scope.user = {};
    alert("Successfully logged out.");
  };
})

.controller('AccountsCtrl', function($scope, $ionicModal, $timeout, $ionicDB, $ionicAuth, $ionicUser) {
  $ionicDB.connect();
  var usersDB = $ionicDB.collection('users');

  usersDB.findAll({complete: true}).fetch().subscribe(function(msg) {
    $scope.accounts = msg;
    console.log($scope.account);
    console.log($ionicUser);
  });
});